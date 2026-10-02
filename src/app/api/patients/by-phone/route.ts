import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get('phone');
    
    if (!phone) {
      return NextResponse.json({ error: 'Phone is required' }, { status: 400 });
    }

    const patients = await prisma.patientRecord.findMany({
      where: { phone },
      orderBy: { createdAt: 'asc' }
    });

    if (!patients || patients.length === 0) {
      return NextResponse.json([]);
    }

    const result = patients.map(p => ({
      name: p.name,
      age: p.age || '',
      gender: p.gender || '',
      uhid: p.uhid || ''
    }));

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error fetching patient by phone:', error);
    return NextResponse.json({ error: 'Failed to fetch patient' }, { status: 500 });
  }
}
