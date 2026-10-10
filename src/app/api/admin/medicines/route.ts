import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const orders = await prisma.medicineOrder.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching medicine orders:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();

    const order = await prisma.medicineOrder.create({
      data: {
        patientName: data.patientName,
        mobile: data.mobile,
        address: data.address,
        prescriptionUrls: data.prescriptionUrls || [],
        medicines: data.medicines || [],
        status: data.status || 'ACTIVE',
        lastGivenDate: data.lastGivenDate ? new Date(data.lastGivenDate) : null,
        nextDueDate: data.nextDueDate ? new Date(data.nextDueDate) : null,
        notes: data.notes,
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error creating medicine order:', error);
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}
