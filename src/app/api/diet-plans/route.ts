import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const plans = await prisma.dietPlan.findMany({
      include: {
        benefits: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
    return NextResponse.json(plans);
  } catch (error) {
    console.error('Failed to fetch diet plans:', error);
    return NextResponse.json({ error: 'Failed to fetch diet plans' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, duration, price, priceUnit, isActive, benefits } = body;

    if (!title || !duration || !price || !priceUnit) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newPlan = await prisma.dietPlan.create({
      data: {
        title,
        duration,
        price,
        priceUnit,
        isActive: isActive ?? true,
        benefits: {
          create: benefits?.map((benefit: any, index: number) => ({
            name: benefit.name,
            order: index,
          })) || [],
        },
      },
      include: {
        benefits: true,
      },
    });

    return NextResponse.json(newPlan);
  } catch (error) {
    console.error('Failed to create diet plan:', error);
    return NextResponse.json({ error: 'Failed to create diet plan' }, { status: 500 });
  }
}
