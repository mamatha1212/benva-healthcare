import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const data = await request.json();

    const updateData: any = {};
    if (data.uhid !== undefined) updateData.uhid = data.uhid ? data.uhid.trim() : null;
    if (data.patientName !== undefined) updateData.patientName = data.patientName;
    if (data.mobile !== undefined) updateData.mobile = data.mobile;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.prescriptionUrls !== undefined) updateData.prescriptionUrls = data.prescriptionUrls;
    if (data.medicines !== undefined) updateData.medicines = data.medicines;
    if (data.totalMrp !== undefined) updateData.totalMrp = Number(data.totalMrp) || 0;
    if (data.discount !== undefined) updateData.discount = Number(data.discount) || 0;
    if (data.finalAmount !== undefined) updateData.finalAmount = Number(data.finalAmount) || 0;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.lastGivenDate !== undefined) updateData.lastGivenDate = data.lastGivenDate ? new Date(data.lastGivenDate) : null;
    if (data.nextDueDate !== undefined) updateData.nextDueDate = data.nextDueDate ? new Date(data.nextDueDate) : null;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.consignmentNo !== undefined) updateData.consignmentNo = data.consignmentNo ? data.consignmentNo.trim() : null;
    if (data.consignmentImage !== undefined) updateData.consignmentImage = data.consignmentImage || null;

    const order = await prisma.medicineOrder.update({
      where: { id },
      data: updateData,
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
