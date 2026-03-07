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

    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { products: true } } },
    });
    
    return NextResponse.json(categories);
  } catch (error) {
    // Log detailed error for debugging
    console.error('❌ Categories API Error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined,
    });
    
    // Return error details in development, generic error in production
    const errorResponse = process.env.NODE_ENV === 'development'
      ? { error: 'Failed to fetch categories', details: error instanceof Error ? error.message : 'Unknown error' }
      : { error: 'Failed to fetch categories' };
    
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.name || !data.slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      );
    }
    
    const category = await prisma.category.create({ data });
    return NextResponse.json(category);
  } catch (error) {
    console.error('❌ Create category error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
    });
    
    // Handle unique constraint violations
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'A category with this slug already exists' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}
