import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { generateNextUhid, getOrCreateUhidForPatient } from '@/lib/uhid';

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
    let { name, phone, age, gender, consultant, uhid } = body;
    name = name?.trim();
    phone = phone?.trim();

    if (!name || !phone) {
      return NextResponse.json({ error: 'Name and phone are required' }, { status: 400 });
    }

    const existingPatient = await prisma.patientRecord.findFirst({ 
      where: { 
        phone: { contains: phone.replace(/\D/g, '').slice(-10) },
        name: { equals: name, mode: 'insensitive' }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (existingPatient) {
      let finalUhid = existingPatient.uhid || uhid;
      if (!finalUhid) {
        finalUhid = await generateNextUhid();
      }
      const updated = await prisma.patientRecord.update({
        where: { id: existingPatient.id },
        data: {
          uhid: finalUhid,
          consultant: consultant || existingPatient.consultant,
          age: age || existingPatient.age,
          gender: gender || existingPatient.gender,
        }
      });
      return NextResponse.json(updated);
    }

    const nextUhid = uhid || await getOrCreateUhidForPatient(phone, name);

    const created = await prisma.patientRecord.create({
      data: { name, phone, age, gender, consultant, uhid: nextUhid }
    });

    return NextResponse.json(created);

  } catch (error: any) {
    console.error('Error creating patient:', error);
    return NextResponse.json({ error: error.message || 'Failed to create patient' }, { status: 500 });
  }
}
