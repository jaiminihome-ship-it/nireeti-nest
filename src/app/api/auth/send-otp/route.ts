import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendEmail, generateOtp } from '@/lib/email';

// POST - Send OTP to email
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

    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
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

    // Find user
    let user;
    try {
      user = await db.user.findUnique({
        where: { email: email.toLowerCase() },
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Service temporarily unavailable. Please try again later.' },
        { status: 503 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { error: 'No account found with this email address' },
        { status: 404 }
      );
    }

    // Generate 6-digit OTP
    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP to database
    try {
      await db.user.update({
        where: { id: user.id },
        data: {
          otp,
          otpExpiry,
        },
      });
    } catch (dbError) {
      console.error('Database update error:', dbError);
      return NextResponse.json(
        { error: 'Failed to generate OTP. Please try again.' },
        { status: 500 }
      );
    }

    // Send OTP via email
    const emailResult = await sendEmail(email, 'otp', {
      name: user.name || 'there',
      otp,
    });

    // IMPORTANT: Always return OTP in demo mode for development
    const isDevelopment = process.env.NODE_ENV !== 'production';
    const isEmailNotConfigured = !process.env.SMTP_USER && !process.env.EMAIL_USER;
    
    return NextResponse.json({
      success: true,
      message: emailResult.success ? 'OTP sent to your email' : 'OTP generated (email service unavailable)',
      // In development or when email not configured, return the OTP for testing
      ...(emailResult.demoOtp && { demoOtp: emailResult.demoOtp }),
      ...(isDevelopment && isEmailNotConfigured && { demoOtp: otp }),
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
