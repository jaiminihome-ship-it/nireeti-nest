import { NextResponse } from 'next/server';
import { prisma, isDatabaseConfigured } from '@/lib/db';

export async function GET() {
  try {
    // Check if database is configured
    if (!isDatabaseConfigured()) {
      console.error('❌ Database not configured - missing DATABASE_URL');
      return NextResponse.json(
        { error: 'Database not configured', details: 'DATABASE_URL environment variable is missing' },
        { status: 500 }
      );
    }

    const banners = await prisma.banner.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
    return NextResponse.json(banners);
  } catch (error) {
    console.error('❌ Banners API Error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined,
    });
    
    // Return empty array on error so frontend doesn't crash
    return NextResponse.json([]);
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
    
    // Validate required fields
    if (!data.title || !data.image) {
      return NextResponse.json(
        { error: 'Title and Image are required' },
        { status: 400 }
      );
    }
