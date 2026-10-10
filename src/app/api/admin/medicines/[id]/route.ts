import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const data = await request.json();

    const order = await prisma.medicineOrder.update({
      where: { id },
      data: {
        patientName: data.patientName,
        mobile: data.mobile,
        address: data.address,
        prescriptionUrls: data.prescriptionUrls,
        medicines: data.medicines,
        status: data.status,
        lastGivenDate: data.lastGivenDate ? new Date(data.lastGivenDate) : null,
        nextDueDate: data.nextDueDate ? new Date(data.nextDueDate) : null,
        notes: data.notes,
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error updating medicine order:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;

    await prisma.medicineOrder.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting medicine order:', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
