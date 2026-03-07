import { NextResponse } from 'next/server';
import { prisma, isDatabaseConfigured } from '@/lib/db';

const defaultSettings: Record<string, unknown> = {
  siteName: 'The Nireeti Nest',
  siteTagline: 'Premium Home Decor & Lifestyle',
  primaryColor: '#B45309',
  secondaryColor: '#D2691E',
  accentColor: '#F5DEB3',
  backgroundColor: '#FFFFFF',
  textColor: '#1F2937',
  logoUrl: '',
  faviconUrl: '/favicon.ico',
  footerBgColor: '#111827',
  footerTextColor: '#D1D5DB',
  footerAccentColor: '#D97706',
  footerText: '© 2024 The Nireeti Nest. All rights reserved.',
  contactEmail: 'support@thenireetinest.com',
  contactPhone: '+91 98765 43210',
  address: 'Mumbai, India',
  showTestimonials: true,
  showNewsletter: true,
  showOurStory: true,
};

export async function GET() {
  try {
    // Check if database is configured
    if (!isDatabaseConfigured()) {
      console.error('❌ Database not configured - returning default settings');
      return NextResponse.json(defaultSettings);
    }

    const settings = await prisma.siteSetting.findMany();
    const result: Record<string, unknown> = { ...defaultSettings };
    
    for (const s of settings) {
      if (s.value === 'true') result[s.key] = true;
      else if (s.value === 'false') result[s.key] = false;
      else result[s.key] = s.value;
    }
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ Settings API Error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
    });
    // Return default settings on error so frontend doesn't crash
    return NextResponse.json(defaultSettings);
  }
}

export async function POST(request: Request) {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    const data = await request.json();
    
    for (const [key, value] of Object.entries(data)) {
      const strValue = typeof value === 'boolean' ? String(value) : String(value || '');
      await prisma.siteSetting.upsert({
        where: { key },
        update: { value: strValue },
        create: { key, value: strValue },
      });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Update settings error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
