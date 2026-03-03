import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// GET /api/faq - Get all FAQs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';
    const category = searchParams.get('category');

    const where: Record<string, unknown> = {};
    
    if (activeOnly) {
      where.isActive = true;
    }
    
    if (category) {
      where.category = category;
    }

    const faqs = await db.fAQ.findMany({
      where,
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json(faqs);
  } catch (error) {
    console.error('Get FAQs error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/faq - Create new FAQ (Admin only)
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
    const { question, answer, category, order, isActive } = body;

    if (!question || !answer) {
      return NextResponse.json(
        { error: 'Question and answer are required' },
        { status: 400 }
      );
    }

    const faq = await db.fAQ.create({
      data: {
        question,
        answer,
        category: category || null,
        order: order || 0,
        isActive: isActive !== false,
      },
    });

    return NextResponse.json(faq);
  } catch (error) {
    console.error('Create FAQ error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
