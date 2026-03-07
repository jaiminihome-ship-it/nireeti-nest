import { NextResponse } from 'next/server';
import { prisma, isDatabaseConfigured } from '@/lib/db';

export async function GET(request: Request) {
  try {
    // Check if database is configured
    if (!isDatabaseConfigured()) {
      console.error('❌ Database not configured - missing DATABASE_URL');
      return NextResponse.json(
        { 
          error: 'Database not configured', 
          details: 'DATABASE_URL environment variable is missing',
          data: [],
          total: 0,
          page: 1,
          limit: 12,
          totalPages: 0
        },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const featured = searchParams.get('featured') === 'true';
    const bestSeller = searchParams.get('bestSeller') === 'true';
    const isNew = searchParams.get('isNew') === 'true';
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (category) where.categoryId = category;
    if (featured) where.featured = true;
    if (bestSeller) where.bestSeller = true;
    if (isNew) where.isNew = true;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      data: products.map(p => ({ ...p, images: JSON.parse(p.images || '[]') })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    // Log detailed error for debugging
    console.error('❌ Products API Error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined,
    });
    
    // Return error details in development, generic error in production
    const errorResponse = process.env.NODE_ENV === 'development'
      ? { 
          error: 'Failed to fetch products', 
          details: error instanceof Error ? error.message : 'Unknown error',
          data: [],
          total: 0,
          page: 1,
          limit: 12,
          totalPages: 0
        }
      : { 
          error: 'Failed to fetch products',
          data: [],
          total: 0,
          page: 1,
          limit: 12,
          totalPages: 0
        };
    
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.name || !data.slug || !data.categoryId) {
      return NextResponse.json(
        { error: 'Name, slug, and categoryId are required' },
        { status: 400 }
      );
    }
    
    // Handle images array
    if (data.images && Array.isArray(data.images)) {
      data.images = JSON.stringify(data.images);
    }
    
    const product = await prisma.product.create({ 
      data, 
      include: { category: true } 
    });
    
    return NextResponse.json({ 
      ...product, 
      images: JSON.parse(product.images || '[]') 
    });
  } catch (error) {
    console.error('❌ Create product error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
    });
    
    // Handle unique constraint violations
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'A product with this slug already exists' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
