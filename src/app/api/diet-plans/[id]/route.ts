import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { title, duration, price, priceUnit, isActive, benefits } = body;

    // Delete existing benefits first, then create new ones to ensure correct ordering/updates
    await prisma.dietPlanBenefit.deleteMany({
      where: { dietPlanId: id },
    });

    const updatedPlan = await prisma.dietPlan.update({
      where: { id },
      data: {
        title,
        duration,
        price,
        priceUnit,
        isActive,
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

    return NextResponse.json(updatedPlan);
  } catch (error) {
    console.error('Failed to update diet plan:', error);
    return NextResponse.json({ error: 'Failed to update diet plan' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    await prisma.dietPlan.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete diet plan:', error);
    return NextResponse.json({ error: 'Failed to delete diet plan' }, { status: 500 });
  }
}
