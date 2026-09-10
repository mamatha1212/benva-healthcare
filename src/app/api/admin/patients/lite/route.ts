import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const patients = await prisma.patientRecord.findMany({
      select: {
        id: true,
        name: true,
        phone: true
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(patients);
  } catch (error) {
    console.error('Error fetching lite patients:', error);
    return NextResponse.json({ error: 'Failed to fetch patients' }, { status: 500 });
  }
}
