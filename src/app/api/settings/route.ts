import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// GET /api/settings - Get all settings
export async function GET() {
  try {
    const settings = await db.siteSetting.findMany();

    // Convert to object
    const settingsObj: Record<string, string> = {};
    for (const setting of settings) {
      settingsObj[setting.key] = setting.value;
    }

    // Default settings
    const defaultSettings = {
      siteName: 'The Nireeti Nest',
      siteTagline: 'Curated Home Essentials for Modern Living',
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
      contactPhone: '+1 234 567 8900',
      address: '123 Decor Street, Design City, DC 12345',
      socialFacebook: '',
      socialInstagram: '',
      socialTwitter: '',
      socialPinterest: '',
      metaTitle: 'The Nireeti Nest - Premium Home Decor & Essentials',
      metaDescription: 'Discover curated home decor and essentials at The Nireeti Nest. Quality craftsmanship meets modern design for your perfect living space.',
      metaKeywords: 'home decor, furniture, interior design, living room, bedroom',
      // Payment settings
      upiEnabled: false,
      upiId: '',
      upiPayeeName: '',
      razorpayEnabled: false,
      razorpayKeyId: '',
      razorpayKeySecret: '',
      paypalEnabled: false,
      paypalClientId: '',
      paypalSecret: '',
      paypalMode: 'sandbox',
      // Section visibility
      showTestimonials: true,
      showNewsletter: true,
      showOurStory: true,
      // Our Story Section
      ourStoryTitle: 'Our Story',
      ourStorySubtitle: 'Crafting Beautiful Spaces Since 2010',
      ourStoryDescription1: 'Founded in 2010, The Nireeti Nest began with a simple mission: to make beautiful, high-quality home furnishings accessible to everyone. What started as a small workshop has grown into a trusted brand that helps thousands of customers create spaces they love.',
      ourStoryDescription2: 'We believe that your home should reflect your unique personality and style. That\'s why we work with talented artisans from around the world to bring you pieces that are both beautiful and functional.',
      ourStoryImage1: '',
      ourStoryImage2: '',
      ourStoryImage3: '',
      ourStoryImage4: '',
      // Features
      feature1Title: 'Quality Craftsmanship',
      feature1Description: 'Every piece is crafted with meticulous attention to detail using premium materials.',
      feature2Title: 'Sustainable Materials',
      feature2Description: 'We prioritize eco-friendly and sustainably sourced materials in all our products.',
      feature3Title: 'Made with Love',
      feature3Description: 'Our artisans pour their passion and expertise into every creation.',
      feature4Title: 'Free Shipping',
      feature4Description: 'Enjoy complimentary shipping on all orders above $100.',
    };

    // Merge with defaults and convert string booleans to booleans
    const result: Record<string, any> = { ...defaultSettings };
    
    for (const [key, value] of Object.entries(settingsObj)) {
      // Convert string booleans to actual booleans
      if (value === 'true' || value === 'false') {
        result[key] = value === 'true';
      } else {
        result[key] = value;
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Get settings error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/settings - Update settings (Admin only)
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Update each setting
    for (const [key, value] of Object.entries(body)) {
      // Convert all values to strings for storage
      const stringValue = typeof value === 'boolean' ? String(value) : String(value || '');
      
      await db.siteSetting.upsert({
        where: { key },
        update: { value: stringValue },
        create: {
          key,
          value: stringValue,
        },
      });
    }

    return NextResponse.json({ message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Update settings error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
