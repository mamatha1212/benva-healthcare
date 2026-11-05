import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { generateNextUhid } from '@/lib/uhid';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('doctor_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'benva-super-secret-key-2026');
    await jwtVerify(token, secret);

    const { searchParams } = new URL(req.url);
    const phoneRaw = searchParams.get('phone') || '';
    const cleanDigits = phoneRaw.replace(/\D/g, '');

    if (!cleanDigits || cleanDigits.length < 5) {
      return NextResponse.json({ found: false, patients: [] });
    }

    const searchPhone = cleanDigits.length >= 10 ? cleanDigits.slice(-10) : cleanDigits;

    // 1. Search in PatientRecord
    const existingPatients = await prisma.patientRecord.findMany({
      where: {
        phone: { contains: searchPhone }
      },
      select: {
        id: true,
        name: true,
        phone: true,
        uhid: true,
        age: true,
        gender: true,
        consultant: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    // 2. Search in Leads
    const existingLeads = await prisma.lead.findMany({
      where: {
        mobile: { contains: searchPhone }
      },
      select: {
        id: true,
        fullName: true,
        mobile: true,
        uhid: true,
        age: true,
        gender: true,
      },
      take: 5
    });

    // 3. Search in MedicineOrder
    const existingOrders = await prisma.medicineOrder.findMany({
      where: {
        mobile: { contains: searchPhone }
      },
      select: {
        id: true,
        patientName: true,
        mobile: true,
        uhid: true,
      },
      take: 5
    });

    // 4. Search in FreeConsultationRequest
    const existingConsults = await prisma.freeConsultationRequest.findMany({
      where: {
        phone: { contains: searchPhone }
      },
      select: {
        id: true,
        name: true,
        phone: true,
        uhid: true,
        age: true,
        gender: true,
      },
      take: 5
    });

    // Consolidate unique family members/patients
    const matchedList: Array<{
      id?: string;
      name: string;
      phone: string;
      uhid?: string | null;
      age?: string | null;
      gender?: string | null;
      source: string;
    }> = [];

    const seenKeys = new Set<string>();

    for (const p of existingPatients) {
      const key = `${p.name.trim().toLowerCase()}_${p.phone}`;
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        matchedList.push({
          id: p.id,
          name: p.name,
          phone: p.phone,
          uhid: p.uhid,
          age: p.age,
          gender: p.gender,
          source: 'PatientRecord'
        });
      }
    }

    for (const l of existingLeads) {
      const key = `${l.fullName.trim().toLowerCase()}_${l.mobile}`;
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        matchedList.push({
          name: l.fullName,
          phone: l.mobile,
          uhid: l.uhid,
          age: l.age,
          gender: l.gender,
          source: 'Lead'
        });
      }
    }

    for (const o of existingOrders) {
      const key = `${o.patientName.trim().toLowerCase()}_${o.mobile}`;
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        matchedList.push({
          name: o.patientName,
          phone: o.mobile,
          uhid: o.uhid,
          source: 'MedicineOrder'
        });
      }
    }

    for (const c of existingConsults) {
      if (!c.name) continue;
      const key = `${c.name.trim().toLowerCase()}_${c.phone}`;
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        matchedList.push({
          name: c.name,
          phone: c.phone || searchPhone,
          uhid: c.uhid,
          age: c.age,
          gender: c.gender,
          source: 'FreeConsultation'
        });
      }
    }

    if (matchedList.length > 0) {
      // Find the first item with a non-null UHID
      const primary = matchedList.find(m => m.uhid) || matchedList[0];
      return NextResponse.json({
        found: true,
        patients: matchedList,
        primary: {
          name: primary.name,
          phone: primary.phone,
          uhid: primary.uhid || null,
          age: primary.age || '',
          gender: primary.gender || '',
        }
      });
    }

    // If completely new, estimate the next UHID
    const nextUhid = await generateNextUhid();
    return NextResponse.json({
      found: false,
      patients: [],
      nextUhid
    });

  } catch (error: any) {
    console.error('Error looking up patient UHID:', error);
    return NextResponse.json({ error: 'Failed to look up UHID' }, { status: 500 });
  }
}

