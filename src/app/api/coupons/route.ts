import { NextRequest, NextResponse } from 'next/server';
import { db, isDatabaseConfigured } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// GET /api/coupons - Get all coupons (Admin only)
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

    const user = await getCurrentUser();

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const coupons = await db.coupon.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(coupons);
  } catch (error) {
    console.error('❌ Get coupons error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json(
      { error: 'Failed to fetch coupons' },
      { status: 500 }
    );
  }
}

// POST /api/coupons - Create or validate coupon
export async function POST(request: NextRequest) {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();

    // If code and subtotal provided, validate coupon
    if (body.code && body.subtotal !== undefined) {
      const coupon = await db.coupon.findUnique({
        where: { code: body.code },
      });

      if (!coupon) {
        return NextResponse.json(
          { valid: false, message: 'Invalid coupon code' },
          { status: 400 }
        );
      }

      if (!coupon.isActive) {
        return NextResponse.json(
          { valid: false, message: 'This coupon is no longer active' },
          { status: 400 }
        );
      }

      if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
        return NextResponse.json(
          { valid: false, message: 'This coupon has expired' },
          { status: 400 }
        );
      }

      if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
        return NextResponse.json(
          { valid: false, message: 'This coupon has reached its usage limit' },
          { status: 400 }
        );
      }

      if (coupon.minPurchase && body.subtotal < coupon.minPurchase) {
        return NextResponse.json(
          { valid: false, message: `Minimum purchase of $${coupon.minPurchase} required` },
          { status: 400 }
        );
      }

      // Calculate discount
      let discount = 0;
      if (coupon.discountType === 'PERCENTAGE') {
        discount = (body.subtotal * coupon.discountValue) / 100;
      } else {
        discount = coupon.discountValue;
      }

      return NextResponse.json({
        valid: true,
        message: 'Coupon applied successfully',
        discount,
        coupon: {
          id: coupon.id,
          code: coupon.code,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
        },
      });
    }

    // Otherwise, create new coupon (Admin only)
    const user = await getCurrentUser();

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const {
      code,
      discountType,
      discountValue,
      minPurchase,
      maxUses,
      expiryDate,
      isActive,
    } = body;

    // Validate required fields
    if (!code || !discountValue) {
      return NextResponse.json(
        { error: 'Code and discount value are required' },
        { status: 400 }
      );
    }

    // Check if code exists
    const existingCoupon = await db.coupon.findUnique({
      where: { code },
    });

    if (existingCoupon) {
      return NextResponse.json(
        { error: 'Coupon code already exists' },
        { status: 400 }
      );
    }

    const coupon = await db.coupon.create({
      data: {
        code: code.toUpperCase(),
        discountType: discountType || 'PERCENTAGE',
        discountValue: parseFloat(discountValue),
        minPurchase: minPurchase ? parseFloat(minPurchase) : null,
        maxUses: maxUses ? parseInt(maxUses) : null,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        isActive: isActive !== false,
      },
    });

    return NextResponse.json(coupon);
  } catch (error) {
    console.error('❌ Create/validate coupon error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json(
      { error: 'Failed to process coupon request' },
      { status: 500 }
    );
  }
}
