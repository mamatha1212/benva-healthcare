import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { generateNextUhid, getOrCreateUhidForPatient } from '@/lib/uhid';

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
    const first5 = searchPhone.slice(0, 5);
    const last5 = searchPhone.slice(-5);

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

    const addMatch = (item: {
      id?: string;
      name?: string | null;
      phone?: string | null;
      uhid?: string | null;
      age?: string | null;
      gender?: string | null;
      source: string;
    }) => {
      const cleanName = (item.name || '').trim();
      const cleanPhone = (item.phone || searchPhone).trim();
      if (!cleanName && !cleanPhone) return;

      const digits = cleanPhone.replace(/\D/g, '');
      const key = `${cleanName.toLowerCase()}_${digits.slice(-10)}`;
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        matchedList.push({
          id: item.id,
          name: cleanName || 'Patient',
          phone: cleanPhone,
          uhid: item.uhid || null,
          age: item.age || null,
          gender: item.gender || null,
          source: item.source
        });
      }
    };

    // 1. INDEPENDENT RAW SQL REGEX MATCHES (Each protected with its own try/catch)
    // 1.1 PatientRecord
    try {
      const rawPatients: any = await prisma.$queryRawUnsafe(
        `SELECT id, name, phone, uhid, age, gender FROM "PatientRecord" 
         WHERE regexp_replace(phone, '[^0-9]', '', 'g') LIKE '%${searchPhone}%'
         ORDER BY "createdAt" DESC LIMIT 10;`
      );
      if (Array.isArray(rawPatients)) {
        for (const p of rawPatients) {
          addMatch({ id: p.id, name: p.name, phone: p.phone, uhid: p.uhid, age: p.age, gender: p.gender, source: 'PatientRecord' });
        }
      }
    } catch (e) {
      console.warn('Raw SQL PatientRecord lookup warning:', e);
    }

    // 1.2 Leads (Website enquiries, callbacks, contact forms, checkups)
    try {
      const rawLeads: any = await prisma.$queryRawUnsafe(
        `SELECT id, "fullName" as name, mobile, whatsapp, uhid, age, gender FROM "Lead" 
         WHERE regexp_replace(mobile, '[^0-9]', '', 'g') LIKE '%${searchPhone}%'
            OR regexp_replace(whatsapp, '[^0-9]', '', 'g') LIKE '%${searchPhone}%'
         ORDER BY "createdAt" DESC LIMIT 10;`
      );
      if (Array.isArray(rawLeads)) {
        for (const l of rawLeads) {
          addMatch({
            id: l.id,
            name: l.name,
            phone: l.mobile || l.whatsapp,
            uhid: l.uhid,
            age: l.age,
            gender: l.gender,
            source: 'Lead'
          });
        }
      }
    } catch (e) {
      console.warn('Raw SQL Lead lookup warning:', e);
    }

    // 1.3 MedicineOrder
    try {
      const rawOrders: any = await prisma.$queryRawUnsafe(
        `SELECT id, "patientName" as name, mobile, uhid FROM "MedicineOrder" 
         WHERE regexp_replace(mobile, '[^0-9]', '', 'g') LIKE '%${searchPhone}%'
         ORDER BY "createdAt" DESC LIMIT 10;`
      );
      if (Array.isArray(rawOrders)) {
        for (const o of rawOrders) {
          addMatch({ id: o.id, name: o.name, phone: o.mobile, uhid: o.uhid, source: 'MedicineOrder' });
        }
      }
    } catch (e) {
      console.warn('Raw SQL MedicineOrder lookup warning:', e);
    }

    // 1.4 FreeConsultationRequest
    try {
      const rawConsults: any = await prisma.$queryRawUnsafe(
        `SELECT id, name, phone, uhid, age, gender FROM "FreeConsultationRequest" 
         WHERE phone IS NOT NULL AND regexp_replace(phone, '[^0-9]', '', 'g') LIKE '%${searchPhone}%'
         ORDER BY "createdAt" DESC LIMIT 10;`
      );
      if (Array.isArray(rawConsults)) {
        for (const c of rawConsults) {
          addMatch({ id: c.id, name: c.name, phone: c.phone, uhid: c.uhid, age: c.age, gender: c.gender, source: 'FreeConsultation' });
        }
      }
    } catch (e) {
      console.warn('Raw SQL FreeConsultationRequest lookup warning:', e);
    }

    // 1.5 ReportFile
    try {
      const rawReports: any = await prisma.$queryRawUnsafe(
        `SELECT id, "patientName" as name, "mobileNumber" as phone FROM "ReportFile" 
         WHERE "mobileNumber" IS NOT NULL AND regexp_replace("mobileNumber", '[^0-9]', '', 'g') LIKE '%${searchPhone}%'
         ORDER BY "createdAt" DESC LIMIT 10;`
      );
      if (Array.isArray(rawReports)) {
        for (const r of rawReports) {
          addMatch({ id: r.id, name: r.name, phone: r.phone, source: 'ReportFile' });
        }
      }
    } catch (e) {
      console.warn('Raw SQL ReportFile lookup warning:', e);
    }

    // 2. PRISMA COMPREHENSIVE FALLBACKS (If raw queries returned 0 results)
    if (matchedList.length === 0) {
      // Build search substrings to guarantee matching even across various formatting
      const searchTerms = [
        searchPhone,
        `${first5} ${last5}`,
        `+91 ${searchPhone}`,
        `+91${searchPhone}`,
        `+91 ${first5} ${last5}`,
        `0${searchPhone}`,
        last5
      ];

      const [prismaPatients, prismaLeads, prismaOrders, prismaConsults] = await Promise.all([
        prisma.patientRecord.findMany({
          where: {
            OR: searchTerms.map(t => ({ phone: { contains: t } }))
          },
          select: { id: true, name: true, phone: true, uhid: true, age: true, gender: true },
          take: 15
        }).catch(() => []),

        prisma.lead.findMany({
          where: {
            OR: [
              ...searchTerms.map(t => ({ mobile: { contains: t } })),
              ...searchTerms.map(t => ({ whatsapp: { contains: t } }))
            ]
          },
          select: { id: true, fullName: true, mobile: true, whatsapp: true, uhid: true, age: true, gender: true },
          take: 15
        }).catch(() => []),

        prisma.medicineOrder.findMany({
          where: {
            OR: searchTerms.map(t => ({ mobile: { contains: t } }))
          },
          select: { id: true, patientName: true, mobile: true, uhid: true },
          take: 15
        }).catch(() => []),

        prisma.freeConsultationRequest.findMany({
          where: {
            OR: searchTerms.map(t => ({ phone: { contains: t } }))
          },
          select: { id: true, name: true, phone: true, uhid: true, age: true, gender: true },
          take: 15
        }).catch(() => [])
      ]);

      // Filter verified matches where digits match searchPhone
      for (const p of prismaPatients) {
        if (p.phone.replace(/\D/g, '').includes(searchPhone)) {
          addMatch({ ...p, source: 'PatientRecord' });
        }
      }
      for (const l of prismaLeads) {
        const mDigits = (l.mobile || '').replace(/\D/g, '');
        const wDigits = (l.whatsapp || '').replace(/\D/g, '');
        if (mDigits.includes(searchPhone) || wDigits.includes(searchPhone)) {
          addMatch({ id: l.id, name: l.fullName, phone: l.mobile || l.whatsapp, uhid: l.uhid, age: l.age, gender: l.gender, source: 'Lead' });
        }
      }
      for (const o of prismaOrders) {
        if (o.mobile.replace(/\D/g, '').includes(searchPhone)) {
          addMatch({ id: o.id, name: o.patientName, phone: o.mobile, uhid: o.uhid, source: 'MedicineOrder' });
        }
      }
      for (const c of prismaConsults) {
        if ((c.phone || '').replace(/\D/g, '').includes(searchPhone)) {
          addMatch({ ...c, source: 'FreeConsultation' });
        }
      }
    }

    // 3. IF MATCHES FOUND (from any website lead, consultation, or previous patient)
    if (matchedList.length > 0) {
      // Pick the best primary profile:
      // Prefer actual names over placeholder strings like "Unknown (Callback)" or "N/A"
      const isValidName = (n: string) => {
        const lower = (n || '').trim().toLowerCase();
        return (
          lower.length > 0 &&
          !lower.includes('unknown') &&
          !lower.includes('not provided') &&
          !lower.includes('n/a') &&
          lower !== 'patient' &&
          lower !== 'undefined' &&
          lower !== 'null'
        );
      };

      const primary = 
        matchedList.find(m => m.uhid && isValidName(m.name)) ||
        matchedList.find(m => isValidName(m.name)) ||
        matchedList.find(m => m.uhid) ||
        matchedList[0];

      // Retrieve or generate verified UHID
      let finalUhid = primary.uhid;
      if (!finalUhid) {
        // Check if any other matched record already has a UHID
        const otherWithUhid = matchedList.find(m => m.uhid);
        if (otherWithUhid) {
          finalUhid = otherWithUhid.uhid;
        } else {
          finalUhid = await getOrCreateUhidForPatient(searchPhone, isValidName(primary.name) ? primary.name : undefined);
        }
      }

      // If lead or record had null uhid, sync back to Lead table in background
      if (finalUhid) {
        prisma.lead.updateMany({
          where: {
            OR: [
              { mobile: { contains: searchPhone } },
              { whatsapp: { contains: searchPhone } }
            ],
            uhid: null
          },
          data: { uhid: finalUhid }
        }).catch(() => {});
      }

      // Ensure every patient in the returned list has a UHID
      for (const item of matchedList) {
        if (!item.uhid) {
          item.uhid = finalUhid;
        }
      }

      return NextResponse.json({
        found: true,
        source: primary.source,
        patients: matchedList,
        primary: {
          id: primary.id || null,
          name: isValidName(primary.name) ? primary.name : '',
          phone: primary.phone || searchPhone,
          uhid: finalUhid,
          age: primary.age || '',
          gender: primary.gender || '',
        }
      });
    }

    // 4. IF COMPLETELY NEW (No records anywhere in any website leads or patients)
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
