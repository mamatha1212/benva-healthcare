import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const body = await req.json();
    const params = await context.params;
    const { id } = params;

    const dataToUpdate: any = {};
    if (body.status !== undefined) dataToUpdate.status = body.status;
    if (body.serviceName !== undefined) dataToUpdate.serviceName = body.serviceName;
    if (body.amount !== undefined) dataToUpdate.amount = Number(body.amount);
    if (body.customServicePrice !== undefined) dataToUpdate.servicePrice = body.customServicePrice ? Number(body.customServicePrice) : null;
    if (body.patientName !== undefined) dataToUpdate.patientName = body.patientName || null;
    if (body.patientPhone !== undefined) dataToUpdate.patientPhone = body.patientPhone || null;
    if (body.referralDate !== undefined) dataToUpdate.referralDate = new Date(body.referralDate);

    const updated = await prisma.referralTransaction.update({
      where: { id },
      data: dataToUpdate
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating transaction:', error);
    return NextResponse.json({ error: 'Failed to update transaction' }, { status: 500 });
  }
}
