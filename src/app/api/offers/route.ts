import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// GET /api/offers - Get all offers
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';

    const where: Record<string, unknown> = {};

    if (activeOnly) {
      where.isActive = true;
      where.endDate = { gte: new Date() };
      where.startDate = { lte: new Date() };
    }

    const offers = await db.offer.findMany({
      where,
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(offers);
  } catch (error) {
    console.error('Get offers error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/offers - Create new offer (Admin only)
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
      title,
      description,
      discountType,
      discountValue,
      startDate,
      endDate,
      productId,
      categoryId,
      isActive,
      bannerImage,
    } = body;

    // Validate required fields
    if (!title || !discountValue || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Title, discount value, start date, and end date are required' },
        { status: 400 }
      );
    }

    const offer = await db.offer.create({
      data: {
        title,
        description: description || null,
        discountType: discountType || 'PERCENTAGE',
        discountValue: parseFloat(discountValue),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        productId: productId || null,
        categoryId: categoryId || null,
        isActive: isActive !== false,
        bannerImage: bannerImage || null,
      },
      include: {
        product: true,
      },
    });

    return NextResponse.json(offer);
  } catch (error) {
    console.error('Create offer error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
