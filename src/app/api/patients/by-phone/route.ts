import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get('phone');
    
    if (!phone) {
      return NextResponse.json({ error: 'Phone is required' }, { status: 400 });
    }

    const patient = await prisma.patientRecord.findFirst({
      where: { phone },
      orderBy: { createdAt: 'desc' }
    });

    if (!patient) {
      return NextResponse.json(null);
    }

    return NextResponse.json({
      name: patient.name,
      age: patient.age || '',
      gender: patient.gender || '',
      uhid: patient.uhid || ''
    });

  } catch (error) {
    console.error('Error fetching patient by phone:', error);
    return NextResponse.json({ error: 'Failed to fetch patient' }, { status: 500 });
  }
}
