import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { generateNextUhid } from '@/lib/uhid';


export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('doctor_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'benva-super-secret-key-2026');
    await jwtVerify(token, secret);

    const { id } = await params;
    const body = await req.json();
    const { name, phone, age, gender } = body;

    const patient = await prisma.patientRecord.update({
      where: { id },
      data: { name, phone, age, gender }
    });

    return NextResponse.json(patient);
  } catch (error: any) {
    console.error('Error updating patient:', error);
    return NextResponse.json({ error: error.message || 'Failed to update patient' }, { status: 500 });
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('doctor_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'benva-super-secret-key-2026');
    await jwtVerify(token, secret);

    const { id } = await params;
    let patient = await prisma.patientRecord.findUnique({
      where: { id },
      include: {
        files: true
      }
    });

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    if (!patient.uhid) {
       const nextUhid = await generateNextUhid();
       patient = await prisma.patientRecord.update({
         where: { id },
         data: { uhid: nextUhid },
         include: { files: true }
       });
    }

    return NextResponse.json(patient);
  } catch (error: any) {
    console.error('Error fetching patient:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch patient' }, { status: 500 });
  }
}
