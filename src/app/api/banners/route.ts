import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const banners = await prisma.banner.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
    return NextResponse.json(banners);
  } catch (error) {
    console.error('Banners error:', error);
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const banner = await prisma.banner.create({ data });
    return NextResponse.json(banner);
  } catch (error) {
    console.error('Create banner error:', error);
    return NextResponse.json({ error: 'Failed to create banner' }, { status: 500 });
  }
}
