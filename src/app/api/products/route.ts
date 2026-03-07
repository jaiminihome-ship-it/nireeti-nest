import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  try {
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
    console.error('Products error:', error);
    return NextResponse.json({ data: [], total: 0, page: 1, limit: 12, totalPages: 0 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    if (data.images && Array.isArray(data.images)) {
      data.images = JSON.stringify(data.images);
    }
    const product = await prisma.product.create({ data, include: { category: true } });
    return NextResponse.json({ ...product, images: JSON.parse(product.images || '[]') });
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
