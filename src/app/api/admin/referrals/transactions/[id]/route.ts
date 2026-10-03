import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { status } = await req.json();
    const params = await context.params;
    const { id } = params;
    
    if (!status) {
      return NextResponse.json({ error: 'Missing status' }, { status: 400 });
    }

    const updated = await prisma.referralTransaction.update({
      where: { id },
      data: { status }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating transaction:', error);
    return NextResponse.json({ error: 'Failed to update transaction' }, { status: 500 });
  }
}
