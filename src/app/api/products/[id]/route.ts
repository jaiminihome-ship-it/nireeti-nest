import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { safeJsonParse } from '@/lib/utils';

// GET /api/products/[id] - Get product by ID or slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Try to find by ID first, then by slug
    let product = await db.product.findUnique({
      where: { id },
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
    });

    if (!product) {
      product = await db.product.findUnique({
        where: { slug: id },
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
      });
    }

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...product,
      images: safeJsonParse<string[]>(product.images, []),
      videos: product.videos ? safeJsonParse<string[]>(product.videos, []) : [],
    });
  } catch (error) {
    console.error('Get product error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/products/[id] - Update product (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    // Check if product exists
    const existingProduct = await db.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Update product
    const product = await db.product.update({
      where: { id },
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description,
        price: body.price ? parseFloat(body.price) : undefined,
        comparePrice: body.comparePrice !== undefined ? (body.comparePrice ? parseFloat(body.comparePrice) : null) : undefined,
        images: body.images ? JSON.stringify(body.images) : undefined,
        videos: body.videos !== undefined ? (body.videos ? JSON.stringify(body.videos) : null) : undefined,
        categoryId: body.categoryId,
        stock: body.stock !== undefined ? parseInt(body.stock) : undefined,
        sku: body.sku,
        featured: body.featured,
        bestSeller: body.bestSeller,
        guarantee: body.guarantee,
        warranty: body.warranty,
        tags: body.tags,
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
    console.error('Update product error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/products/[id] - Delete product (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Check if product exists
    const existingProduct = await db.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Delete product
    await db.product.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
