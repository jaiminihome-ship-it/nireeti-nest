import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// GET /api/gifts - Get all gift orders (Admin only)
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');

    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (status) {
      where.status = status;
    }

    const total = await db.giftOrder.count({ where });

    const gifts = await db.giftOrder.findMany({
      where,
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        product: {
          include: {
            category: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    return NextResponse.json({
      data: gifts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Get gifts error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/gifts - Create new gift order
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'You must be logged in to send a gift' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      receiverName,
      receiverPhone,
      receiverAddress,
      message,
      deliveryDate,
      giftWrap,
      giftWrapPrice,
      isAnonymous,
      productId,
      quantity,
    } = body;

    // Validate required fields
    if (!receiverName || !receiverPhone || !receiverAddress || !productId) {
      return NextResponse.json(
        { error: 'Receiver details and product are required' },
        { status: 400 }
      );
    }

    // Get product
    const product = await db.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 400 }
      );
    }

    if (product.stock < (quantity || 1)) {
      return NextResponse.json(
        { error: 'Insufficient stock' },
        { status: 400 }
      );
    }

    const qty = quantity || 1;
    const giftWrapCost = giftWrap ? (giftWrapPrice || 5) : 0;
    const total = product.price * qty + giftWrapCost;

    // Create gift order
    const giftOrder = await db.giftOrder.create({
      data: {
        senderId: user.id,
        receiverName,
        receiverPhone,
        receiverAddress,
        message: message || null,
        deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
        giftWrap: giftWrap || false,
        giftWrapPrice: giftWrapCost,
        isAnonymous: isAnonymous || false,
        productId,
        quantity: qty,
        total,
        status: 'PENDING',
      },
      include: {
        product: true,
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Update product stock
    await db.product.update({
      where: { id: productId },
      data: {
        stock: {
          decrement: qty,
        },
      },
    });

    return NextResponse.json(giftOrder);
  } catch (error) {
    console.error('Create gift order error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
