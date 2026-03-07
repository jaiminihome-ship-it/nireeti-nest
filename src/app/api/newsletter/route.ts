import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { email, source } = await request.json();
    
    if (!email?.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }

    await prisma.newsletterSubscriber.upsert({
      where: { email: email.toLowerCase() },
      update: { isActive: true },
      create: { email: email.toLowerCase(), source: source || 'homepage' },
    });

    return NextResponse.json({ message: 'Successfully subscribed!' });
  } catch (error) {
    console.error('Newsletter error:', error);
    return NextResponse.json({ error: 'Subscription failed' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const subscribers = await prisma.newsletterSubscriber.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ subscribers, total: subscribers.length });
  } catch (error) {
    console.error('Get subscribers error:', error);
    return NextResponse.json({ subscribers: [], total: 0 });
  }
}
