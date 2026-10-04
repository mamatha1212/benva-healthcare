import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { status } = await req.json();
    
    const updated = await prisma.freeConsultationRequest.update({
      where: { id },
      data: { status }
    });
    
    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error('Error updating status:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
