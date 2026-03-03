import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { generateSlug, safeJsonParse } from '@/lib/utils';

// GET /api/products - Get all products with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const featured = searchParams.get('featured') === 'true';
    const bestSeller = searchParams.get('bestSeller') === 'true';
    const isNew = searchParams.get('isNew') === 'true';
    const search = searchParams.get('search');

    const skip = (page - 1) * limit;

    // Build filter
    const where: Record<string, unknown> = {};

    if (category) {
      where.category = { slug: category };
    }

    if (featured) {
      where.featured = true;
    }

    if (bestSeller) {
      where.bestSeller = true;
    }

    if (isNew) {
      where.isNew = true;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { tags: { contains: search } },
      ];
    }

    // Get total count
    const total = await db.product.count({ where });

    // Get products
    const products = await db.product.findMany({
      where,
      include: {
        category: true,
        offers: {
          where: {
            isActive: true,
            endDate: { gte: new Date() },
            startDate: { lte: new Date() },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    // Parse images and videos from JSON strings
    const parsedProducts = products.map((product) => ({
      ...product,
      images: safeJsonParse<string[]>(product.images, []),
      videos: product.videos ? safeJsonParse<string[]>(product.videos, []) : [],
    }));

    return NextResponse.json({
      data: parsedProducts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Get products error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/products - Create new product (Admin only)
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      name,
      slug,
      description,
      shortDesc,
      price,
      comparePrice,
      images,
      videos,
      categoryId,
      stock,
      sku,
      barcode,
      featured,
      bestSeller,
      isNew,
      // Delivery & Returns
      deliveryTime,
      deliveryCost,
      returnPolicy,
      // Guarantee & Warranty
      guarantee,
      warranty,
      // Specifications
      material,
      dimensions,
      weight,
      color,
      style,
      assembly,
      // SEO
      metaTitle,
      metaDesc,
      tags,
    } = body;

    // Validate required fields
    if (!name || !description || !price || !categoryId) {
      return NextResponse.json(
        { error: 'Name, description, price, and category are required' },
        { status: 400 }
      );
    }

    // Generate slug if not provided
    const productSlug = slug || generateSlug(name);

    // Check if slug exists
    const existingProduct = await db.product.findUnique({
      where: { slug: productSlug },
    });

    if (existingProduct) {
      return NextResponse.json(
        { error: 'Product with this slug already exists' },
        { status: 400 }
      );
    }

    // Create product
    const product = await db.product.create({
      data: {
        name,
        slug: productSlug,
        description,
        shortDesc: shortDesc || null,
        price: parseFloat(price),
        comparePrice: comparePrice ? parseFloat(comparePrice) : null,
        images: JSON.stringify(images || []),
        videos: videos ? JSON.stringify(videos) : null,
        categoryId,
        stock: parseInt(stock) || 0,
        sku: sku || null,
        barcode: barcode || null,
        featured: featured || false,
        bestSeller: bestSeller || false,
        isNew: isNew !== false,
        // Delivery & Returns
        deliveryTime: deliveryTime || null,
        deliveryCost: deliveryCost ? parseFloat(deliveryCost) : 0,
        returnPolicy: returnPolicy || null,
        // Guarantee & Warranty
        guarantee: guarantee || null,
        warranty: warranty || null,
        // Specifications
        material: material || null,
        dimensions: dimensions || null,
        weight: weight || null,
        color: color || null,
        style: style || null,
        assembly: assembly || null,
        // SEO
        metaTitle: metaTitle || null,
        metaDesc: metaDesc || null,
        tags: tags || null,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json({
      ...product,
      images: safeJsonParse<string[]>(product.images, []),
      videos: product.videos ? safeJsonParse<string[]>(product.videos, []) : [],
    });
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
