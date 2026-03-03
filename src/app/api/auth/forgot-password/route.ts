import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendEmail, generateOtp } from '@/lib/email';

// POST - Request password reset
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
        { error: 'Service temporarily unavailable. Please try again.' },
        { status: 503 }
      );
    }

    if (!user) {
      // Don't reveal if email exists or not (security best practice)
      return NextResponse.json({
        message: 'If an account with this email exists, a reset code has been sent',
      });
    }

    // Generate reset token (6 digit OTP)
    const resetToken = generateOtp();
    const resetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Save reset token to database
    try {
      await db.user.update({
        where: { id: user.id },
        data: {
          resetToken,
          resetExpiry,
        },
      });
    } catch (dbError) {
      console.error('Database update error:', dbError);
      return NextResponse.json(
        { error: 'Failed to generate reset code. Please try again.' },
        { status: 500 }
      );
    }

    // Send reset email
    const emailResult = await sendEmail(email, 'reset-password', {
      name: user.name || 'there',
      otp: resetToken,
    });

    return NextResponse.json({
      message: 'If an account with this email exists, a reset code has been sent',
      // In development mode, return the token for testing
      ...(emailResult.demoOtp && { demoToken: emailResult.demoOtp }),
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
