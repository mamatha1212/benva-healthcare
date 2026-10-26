import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'benva-super-secret-key-2026');
    await jwtVerify(token, secret);

    const submittedPrescriptions = await prisma.patientFile.findMany({
      where: {
        OR: [
          { fileType: 'PRESCRIPTION' },
          { status: 'SUBMITTED' }
        ]
      },
      include: {
        patient: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const doctors = await prisma.doctor.findMany();
    
    const mappedPrescriptions = submittedPrescriptions.map(file => {
      const doctor = doctors.find(d => d.name === file.patient.consultant);
      return {
        ...file,
        doctorProfile: doctor || null
      };
    });

    return NextResponse.json(mappedPrescriptions);
  } catch (error) {
    console.error('Error fetching prescriptions:', error);
    return NextResponse.json({ error: 'Failed to fetch prescriptions' }, { status: 500 });
  }
}
