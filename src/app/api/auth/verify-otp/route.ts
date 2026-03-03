import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateToken, setAuthCookie } from '@/lib/auth';

// POST - Verify OTP and login
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

    const { email, otp } = body;

    if (!email || !otp) {
      return NextResponse.json(
        { error: 'Email and OTP are required' },
        { status: 400 }
      );
    }

    // Validate OTP format (6 digits)
    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        { error: 'Invalid OTP format' },
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

    if (!user || !user.otp || !user.otpExpiry) {
      return NextResponse.json(
        { error: 'Please request a new OTP' },
        { status: 400 }
      );
    }

    // Check if OTP matches and hasn't expired
    if (user.otp !== otp) {
      return NextResponse.json(
        { error: 'Invalid OTP. Please try again.' },
        { status: 400 }
      );
    }

    if (new Date() > user.otpExpiry) {
      return NextResponse.json(
        { error: 'OTP has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Clear OTP and mark email as verified
    try {
      await db.user.update({
        where: { id: user.id },
        data: {
          otp: null,
          otpExpiry: null,
          emailVerified: new Date(),
        },
      });
    } catch (dbError) {
      console.error('Database update error:', dbError);
      return NextResponse.json(
        { error: 'Failed to verify OTP. Please try again.' },
        { status: 500 }
      );
    }

    // Generate auth token
    const token = generateToken(user.id, user.email, user.role);

    const response = NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
      address: user.address,
    });

    response.headers.set('Set-Cookie', setAuthCookie(token));

    return response;
  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
