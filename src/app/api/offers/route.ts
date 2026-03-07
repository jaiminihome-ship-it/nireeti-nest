import { NextRequest, NextResponse } from 'next/server';
import { db, isDatabaseConfigured } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// GET /api/offers - Get all offers
export async function GET(request: NextRequest) {
  try {
    // Check if database is configured
    if (!isDatabaseConfigured()) {
      console.error('❌ Database not configured - missing DATABASE_URL');
      return NextResponse.json(
        { error: 'Database not configured', details: 'DATABASE_URL environment variable is missing' },
        { status: 500 }
      );
    }

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
      orderBy: { createdAt: 'desc' },
    });

    // If there are offers with productId, fetch the related products
    const offersWithProducts = await Promise.all(
      offers.map(async (offer) => {
        if (offer.productId) {
          try {
            const product = await db.product.findUnique({
              where: { id: offer.productId },
              include: { category: true },
            });
            return { ...offer, product };
          } catch {
            return { ...offer, product: null };
          }
        }
        return { ...offer, product: null };
      })
    );

    return NextResponse.json(offersWithProducts);
  } catch (error) {
    console.error('❌ Get offers error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined,
    });
    
    // Return empty array on error
    return NextResponse.json([]);
  }
}

// POST /api/offers - Create new offer (Admin only)
export async function POST(request: NextRequest) {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

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
    if (!title || discountValue === undefined || !startDate || !endDate) {
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
    });

    return NextResponse.json(offer);
  } catch (error) {
    console.error('❌ Create offer error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json(
      { error: 'Failed to create offer' },
      { status: 500 }
    );
  }
}
