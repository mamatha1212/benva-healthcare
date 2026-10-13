import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawPhone = searchParams.get('phone');
    
    if (!rawPhone) {
      return NextResponse.json({ error: 'Phone is required' }, { status: 400 });
    }

    const cleanPhone = rawPhone.replace(/\D/g, '');
    const searchPhones = [rawPhone.trim()];
    if (cleanPhone.length >= 10) {
      const tenDigit = cleanPhone.slice(-10);
      searchPhones.push(tenDigit);
      searchPhones.push(`+91${tenDigit}`);
      searchPhones.push(`91${tenDigit}`);
      searchPhones.push(`0${tenDigit}`);
    }
    const uniquePhones = Array.from(new Set(searchPhones.filter(Boolean)));

    // Search across PatientRecord, Lead, MedicineOrder, FreeConsultationRequest
    const [patientRecords, leads, medicineOrders, consultations] = await Promise.all([
      prisma.patientRecord.findMany({
        where: { phone: { in: uniquePhones } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.lead.findMany({
        where: {
          OR: [
            { mobile: { in: uniquePhones } },
            { whatsapp: { in: uniquePhones } },
          ],
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.medicineOrder.findMany({
        where: { mobile: { in: uniquePhones } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.freeConsultationRequest.findMany({
        where: { phone: { in: uniquePhones } },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    // Map to deduplicate by patient name (case-insensitive)
    const membersMap = new Map<string, {
      name: string;
      uhid: string;
      age: string;
      gender: string;
      address: string;
      phone: string;
      sources: string[];
      lastActive: Date;
    }>();

    const normalizeKey = (name: string) => name.trim().toLowerCase().replace(/\s+/g, ' ');

    // 1. Process PatientRecord
    for (const p of patientRecords) {
      const key = normalizeKey(p.name);
      if (!key) continue;
      const existing = membersMap.get(key);
      const sources = existing ? existing.sources : [];
      if (!sources.includes('Patient Record')) sources.push('Patient Record');

      membersMap.set(key, {
        name: p.name.trim(),
        uhid: p.uhid || existing?.uhid || '',
        age: p.age || existing?.age || '',
        gender: p.gender || existing?.gender || '',
        address: p.address || existing?.address || '',
        phone: p.phone,
        sources,
        lastActive: p.createdAt > (existing?.lastActive || new Date(0)) ? p.createdAt : (existing?.lastActive || p.createdAt),
      });
    }

    // 2. Process MedicineOrder
    for (const m of medicineOrders) {
      const key = normalizeKey(m.patientName);
      if (!key) continue;
      const existing = membersMap.get(key);
      const sources = existing ? existing.sources : [];
      if (!sources.includes('Medicine Order')) sources.push('Medicine Order');

      membersMap.set(key, {
        name: existing?.name || m.patientName.trim(),
        uhid: m.uhid || existing?.uhid || '',
        age: existing?.age || '',
        gender: existing?.gender || '',
        address: m.address || existing?.address || '',
        phone: m.mobile,
        sources,
        lastActive: m.createdAt > (existing?.lastActive || new Date(0)) ? m.createdAt : (existing?.lastActive || m.createdAt),
      });
    }

    // 3. Process Lead (Health Checkup, Membership, Diet Plan, Home Healthcare)
    for (const l of leads) {
      const key = normalizeKey(l.fullName);
      if (!key) continue;
      const existing = membersMap.get(key);
      const sources = existing ? existing.sources : [];
      const serviceName = l.enquiryType === 'HEALTH_CHECKUP' ? 'Health Checkup'
        : l.enquiryType === 'MEMBERSHIP' ? 'Membership'
        : l.enquiryType === 'DIET_PLAN' ? 'Diet Plan'
        : l.enquiryType === 'HOME_HEALTHCARE' ? 'Home Healthcare'
        : 'Health Service';
      if (!sources.includes(serviceName)) sources.push(serviceName);

      const leadAddrParts = [l.area, l.district, l.state, l.pincode].filter(Boolean);
      const leadAddr = leadAddrParts.length > 0 ? leadAddrParts.join(', ') : '';

      membersMap.set(key, {
        name: existing?.name || l.fullName.trim(),
        uhid: l.uhid || existing?.uhid || '',
        age: l.age || existing?.age || '',
        gender: l.gender || existing?.gender || '',
        address: existing?.address || leadAddr,
        phone: l.mobile || l.whatsapp,
        sources,
        lastActive: l.createdAt > (existing?.lastActive || new Date(0)) ? l.createdAt : (existing?.lastActive || l.createdAt),
      });
    }

    // 4. Process FreeConsultationRequest
    for (const c of consultations) {
      if (!c.name) continue;
      const key = normalizeKey(c.name);
      if (!key) continue;
      const existing = membersMap.get(key);
      const sources = existing ? existing.sources : [];
      if (!sources.includes('Free Consultation')) sources.push('Free Consultation');

      const consultAddrParts = [c.state, c.district, c.pincode].filter(Boolean);
      const consultAddr = consultAddrParts.length > 0 ? consultAddrParts.join(', ') : '';

      membersMap.set(key, {
        name: existing?.name || c.name.trim(),
        uhid: c.uhid || existing?.uhid || '',
        age: c.age || existing?.age || '',
        gender: c.gender || existing?.gender || '',
        address: existing?.address || consultAddr,
        phone: c.phone || '',
        sources,
        lastActive: c.createdAt > (existing?.lastActive || new Date(0)) ? c.createdAt : (existing?.lastActive || c.createdAt),
      });
    }

    const result = Array.from(membersMap.values()).sort(
      (a, b) => b.lastActive.getTime() - a.lastActive.getTime()
    );

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error fetching patient by phone:', error);
    return NextResponse.json({ error: 'Failed to fetch patient' }, { status: 500 });
  }
}
