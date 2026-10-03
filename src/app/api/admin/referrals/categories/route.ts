import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const categories = await prisma.referralCategory.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching referral categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description } = body;
    
    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

    const newCategory = await prisma.referralCategory.create({
      data: { name, description }
    });
    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    console.error('Error creating referral category:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
