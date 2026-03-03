import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const { name, email, phone, subject, message } = body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Name, email, subject, and message are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Store contact message in database
    try {
      await db.contactMessage.create({
        data: {
          name,
          email: email.toLowerCase(),
          phone: phone || null,
          subject,
          message,
        },
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Failed to save message. Please try again.' },
        { status: 500 }
      );
    }

    // Get admin email from environment
    const adminEmail = process.env.EMAIL_USER || 'support@thenireetinest.com';

    // Send notification email to admin (non-blocking)
    sendEmail(adminEmail, 'contact-notification', {
      name,
      email,
      phone: phone || 'Not provided',
      subject,
      message,
    }).catch(err => console.error('Admin notification email error:', err));

    // Send auto-reply to the person who contacted (non-blocking)
    sendEmail(email, 'contact-auto-reply', {
      name,
      email,
      subject,
    }).catch(err => console.error('Auto-reply email error:', err));

    return NextResponse.json({ 
      success: true, 
      message: 'Message sent successfully! We will get back to you soon.' 
    });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const messages = await db.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    const total = await db.contactMessage.count();

    return NextResponse.json({
      data: messages,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Get contact messages error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
