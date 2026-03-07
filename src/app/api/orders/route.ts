import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { sendSMS } from '@/lib/sms';
import { sendEmail } from '@/lib/email';

// GET /api/orders - Get all orders (Admin) or user's orders
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');

    const skip = (page - 1) * limit;

    // Build filter
    const where: Record<string, unknown> = {};

    // Non-admin users can only see their own orders
    if (!user || user.role !== 'ADMIN') {
      if (!user) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
      where.userId = user.id;
    }

    if (status) {
      where.status = status;
    }

    // Get total count
    const total = await db.order.count({ where });

    // Get orders
    const orders = await db.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    return NextResponse.json({
      data: orders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Get orders error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/orders - Create new order
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();
    const { items, customerName, customerEmail, customerPhone, shippingAddr, billingAddr, couponCode, discount, notes } = body;

    // Validate required fields
    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'Order items are required' },
        { status: 400 }
      );
    }

    if (!customerName || !customerEmail) {
      return NextResponse.json(
        { error: 'Customer name and email are required' },
        { status: 400 }
      );
    }

    // Calculate total
    let total = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await db.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        return NextResponse.json(
          { error: `Product ${item.productId} not found` },
          { status: 400 }
        );
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${product.name}` },
          { status: 400 }
        );
      }

      total += product.price * item.quantity;
      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
      });
    }

    // Apply discount
    const discountAmount = discount || 0;
    total = Math.max(0, total - discountAmount);

    // Create order
    const order = await db.order.create({
      data: {
        userId: user?.id || null,
        total,
        status: 'PENDING',
        customerName,
        customerEmail,
        customerPhone: customerPhone || null,
        shippingAddr: shippingAddr || null,
        billingAddr: billingAddr || null,
        couponCode: couponCode || null,
        discount: discountAmount,
        notes: notes || null,
        items: {
          create: orderItems,
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // Update product stock
    for (const item of items) {
      await db.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });
    }

    // Update coupon usage if used
    if (couponCode) {
      await db.coupon.update({
        where: { code: couponCode },
        data: {
          usedCount: {
            increment: 1,
          },
        },
      });
    }

    // Generate order number
    const orderNumber = `TNN${Date.now().toString(36).toUpperCase()}`;

    // Send order confirmation notifications (SMS + Email)
    try {
      // Send SMS if phone number is provided
      if (customerPhone) {
        await sendSMS(customerPhone, 'order-confirmation', {
          orderNumber,
          total: total.toString(),
        });
      }

      // Send email confirmation
      await sendEmail(customerEmail, 'order-confirm', {
        name: customerName,
        orderNumber,
        total: total.toString(),
      });
    } catch (notificationError) {
      // Log error but don't fail the order
      console.error('Failed to send order confirmation:', notificationError);
    }

    return NextResponse.json({ ...order, orderNumber });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
