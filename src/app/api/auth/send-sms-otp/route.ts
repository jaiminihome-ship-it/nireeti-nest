import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendSMS, generateOTP, isValidPhone } from '@/lib/sms';

/**
 * POST /api/auth/send-sms-otp
 * Send OTP via SMS to phone number
 * 
 * Body: { phone: string }
 * 
 * This API auto-detects:
 * - Indian numbers (+91 or 10-digit) → Uses MSG91
 * - International numbers → Uses Twilio
 */
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

    const { phone } = body;

    if (!phone) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    // Validate phone format
    if (!isValidPhone(phone)) {
      return NextResponse.json(
        { error: 'Invalid phone number format. Please enter a valid 10-digit Indian number or international number with country code.' },
        { status: 400 }
      );
    }

    // Find user by phone
    let user;
    try {
      user = await db.user.findFirst({
        where: { phone: phone.replace(/[\s\-\(\)]/g, '') },
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Service temporarily unavailable. Please try again.' },
        { status: 503 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { error: 'No account found with this phone number' },
        { status: 404 }
      );
    }

    // Generate 6-digit OTP
    const otp = generateOTP();
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

    // Send OTP via SMS
    const smsResult = await sendSMS(phone, 'otp', { otp });

    return NextResponse.json({
      message: 'OTP sent to your phone number',
      // In development/demo mode, return the OTP for testing
      ...(smsResult.demoOtp && { demoOtp: smsResult.demoOtp }),
      ...(process.env.NODE_ENV === 'development' && { devOtp: otp }),
    });
  } catch (error) {
    console.error('Send SMS OTP error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
