import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    
    const dataToUpdate: any = {};
    if (body.status !== undefined) dataToUpdate.status = body.status;
    if (body.adminRemarks !== undefined) dataToUpdate.adminRemarks = body.adminRemarks;
    
    const updated = await prisma.freeConsultationRequest.update({
      where: { id },
      data: dataToUpdate
    });
    
    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error('Error updating:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
