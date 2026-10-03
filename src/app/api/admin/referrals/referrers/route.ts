import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const referrers = await prisma.referrer.findMany({
      include: {
        category: true,
        transactions: true
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(referrers);
  } catch (error) {
    console.error('Error fetching referrers:', error);
    return NextResponse.json({ error: 'Failed to fetch referrers' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, username, password, categoryId } = body;
    
    if (!name || !phone || !username || !password || !categoryId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check username existence
    const existing = await prisma.referrer.findUnique({ where: { username } });
    if (existing) {
      return NextResponse.json({ error: 'Username already exists' }, { status: 400 });
    }

    const newReferrer = await prisma.referrer.create({
      data: { name, email, phone, username, password, categoryId }
    });
    return NextResponse.json(newReferrer, { status: 201 });
  } catch (error) {
    console.error('Error creating referrer:', error);
    return NextResponse.json({ error: 'Failed to create referrer' }, { status: 500 });
  }
}
