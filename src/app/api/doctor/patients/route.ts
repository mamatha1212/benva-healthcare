import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('doctor_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'benva-super-secret-key-2026');
    await jwtVerify(token, secret);

    const body = await req.json();
    const { name, phone, age, gender, consultant } = body;

    if (!name || !phone) {
      return NextResponse.json({ error: 'Name and phone are required' }, { status: 400 });
    }

    const patient = await prisma.patientRecord.create({
      data: {
        name,
        phone,
        age,
        gender,
        consultant
      }
    });

    return NextResponse.json(patient);
  } catch (error: any) {
    console.error('Error creating patient:', error);
    return NextResponse.json({ error: error.message || 'Failed to create patient' }, { status: 500 });
  }
}
