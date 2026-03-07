import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendEmail, generateOtp } from '@/lib/email';
import { sendSMS, generateOTP, isValidPhone, getSMSConfig } from '@/lib/sms';

/**
 * POST /api/auth/send-otp
 * Send OTP via Email or SMS
 * 
 * Body: { email?: string, phone?: string, type?: 'email' | 'sms' }
 * 
 * Priority:
 * 1. If type='sms' and phone provided → Send SMS OTP
 * 2. If type='email' and email provided → Send Email OTP
 * 3. If phone provided and SMS configured → Send SMS OTP
 * 4. If email provided → Send Email OTP
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

    const { email, phone, type = 'auto' } = body;

    // Validate at least one contact method
    if (!email && !phone) {
      return NextResponse.json(
        { error: 'Email or phone number is required' },
        { status: 400 }
      );
    }

    // Determine OTP delivery method
    const smsConfig = getSMSConfig();
    let deliveryMethod: 'email' | 'sms' = 'email';
    let contactValue = '';
    let user = null;

    // Determine delivery method based on request and availability
    if (type === 'sms' && phone) {
      if (!isValidPhone(phone)) {
        return NextResponse.json(
          { error: 'Invalid phone number format' },
          { status: 400 }
        );
      }
      deliveryMethod = 'sms';
      contactValue = phone;
    } else if (type === 'email' && email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: 'Invalid email format' },
          { status: 400 }
        );
      }
      deliveryMethod = 'email';
      contactValue = email;
    } else if (phone && smsConfig.enabled) {
      // Auto: Prefer SMS if configured and phone provided
      if (!isValidPhone(phone)) {
        // Invalid phone, try email
        if (email) {
          deliveryMethod = 'email';
          contactValue = email;
        } else {
          return NextResponse.json(
            { error: 'Invalid phone number format' },
            { status: 400 }
          );
        }
      } else {
        deliveryMethod = 'sms';
        contactValue = phone;
      }
    } else if (email) {
      // Fallback to email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: 'Invalid email format' },
          { status: 400 }
        );
      }
      deliveryMethod = 'email';
      contactValue = email;
    } else {
      return NextResponse.json(
        { error: 'No valid contact method provided' },
        { status: 400 }
      );
    }

    // Find user by email or phone
    try {
      if (deliveryMethod === 'email') {
        user = await db.user.findUnique({
          where: { email: contactValue.toLowerCase() },
        });
      } else {
        // Find by phone (clean the phone number)
        const cleanPhone = contactValue.replace(/[\s\-\(\)]/g, '');
        user = await db.user.findFirst({
          where: { phone: cleanPhone },
        });
      }
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Service temporarily unavailable. Please try again.' },
        { status: 503 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { error: `No account found with this ${deliveryMethod === 'email' ? 'email address' : 'phone number'}` },
        { status: 404 }
      );
    }

    // Generate 6-digit OTP
    const otp = deliveryMethod === 'sms' ? generateOTP() : generateOtp();
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

    // Send OTP via appropriate channel
    if (deliveryMethod === 'sms') {
      const smsResult = await sendSMS(contactValue, 'otp', { otp });

      return NextResponse.json({
        message: 'OTP sent to your phone number',
        method: 'sms',
        // In development/demo mode, return the OTP for testing
        ...(smsResult.demoOtp && { demoOtp: smsResult.demoOtp }),
        ...(process.env.NODE_ENV === 'development' && { devOtp: otp }),
      });
    } else {
      // Send via email
      const emailResult = await sendEmail(contactValue, 'otp', {
        name: user.name || 'there',
        otp,
      });

      return NextResponse.json({
        message: 'OTP sent to your email',
        method: 'email',
        // In development mode, return the OTP for testing
        ...(emailResult.demoOtp && { demoOtp: emailResult.demoOtp }),
      });
    }
  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
