import { prisma } from './prisma';

export async function generateNextUhid(): Promise<string> {
  try {
    const [patientUhids, leadUhids, medUhids, consultUhids] = await Promise.all([
      prisma.patientRecord.findMany({
        where: { uhid: { not: null } },
        select: { uhid: true },
        orderBy: { uhid: 'desc' },
        take: 50,
      }),
      prisma.lead.findMany({
        where: { uhid: { not: null } },
        select: { uhid: true },
        orderBy: { uhid: 'desc' },
        take: 50,
      }),
      prisma.medicineOrder.findMany({
        where: { uhid: { not: null } },
        select: { uhid: true },
        orderBy: { uhid: 'desc' },
        take: 50,
      }),
      prisma.freeConsultationRequest.findMany({
        where: { uhid: { not: null } },
        select: { uhid: true },
        orderBy: { uhid: 'desc' },
        take: 50,
      }),
    ]);

    let maxNum = 0;
    const all = [...patientUhids, ...leadUhids, ...medUhids, ...consultUhids];
    for (const item of all) {
      if (item.uhid) {
        const match = item.uhid.match(/(\d+)/);
        if (match) {
          const num = parseInt(match[1], 10);
          if (!isNaN(num) && num > maxNum) {
            maxNum = num;
          }
        }
      }
    }

    if (maxNum === 0) {
      const [pCount, lCount, mCount, cCount] = await Promise.all([
        prisma.patientRecord.count({ where: { uhid: { not: null } } }),
        prisma.lead.count({ where: { uhid: { not: null } } }),
        prisma.medicineOrder.count({ where: { uhid: { not: null } } }),
        prisma.freeConsultationRequest.count({ where: { uhid: { not: null } } }),
      ]);
      maxNum = pCount + lCount + mCount + cCount;
    }

    const nextNumber = maxNum + 1;
    return `BENVA-UHID-${nextNumber.toString().padStart(9, '0')}`;
  } catch (err) {
    console.error('Error generating UHID:', err);
    const fallbackNum = Date.now().toString().slice(-9);
    return `BENVA-UHID-${fallbackNum}`;
  }
}

export async function getOrCreateUhidForPatient(phone: string, name?: string): Promise<string> {
  const digits = (phone || '').replace(/\D/g, '');
  const last10 = digits.length >= 10 ? digits.slice(-10) : digits;
  const cleanName = name?.trim();

  if (last10) {
    // 1. Raw SQL regex across all tables
    try {
      const rawResults: any = await prisma.$queryRawUnsafe(
        `SELECT uhid FROM (
           SELECT uhid, "createdAt" FROM "PatientRecord" WHERE uhid IS NOT NULL AND regexp_replace(phone, '[^0-9]', '', 'g') LIKE '%${last10}%'
           UNION ALL
           SELECT uhid, "createdAt" FROM "Lead" WHERE uhid IS NOT NULL AND (regexp_replace(mobile, '[^0-9]', '', 'g') LIKE '%${last10}%' OR regexp_replace(whatsapp, '[^0-9]', '', 'g') LIKE '%${last10}%')
           UNION ALL
           SELECT uhid, "createdAt" FROM "MedicineOrder" WHERE uhid IS NOT NULL AND regexp_replace(mobile, '[^0-9]', '', 'g') LIKE '%${last10}%'
           UNION ALL
           SELECT uhid, "createdAt" FROM "FreeConsultationRequest" WHERE uhid IS NOT NULL AND phone IS NOT NULL AND regexp_replace(phone, '[^0-9]', '', 'g') LIKE '%${last10}%'
         ) AS all_records WHERE uhid IS NOT NULL AND uhid != '' ORDER BY "createdAt" DESC LIMIT 1;`
      );
      if (rawResults && rawResults.length > 0 && rawResults[0].uhid) {
        return rawResults[0].uhid;
      }
    } catch (rawErr) {
      // Fall back to Prisma queries
    }

    // 2. Prisma queries with formatted chunks
    const searchTerms = [
      last10,
      `${last10.slice(0, 5)} ${last10.slice(-5)}`,
      `+91 ${last10}`,
      `+91${last10}`,
      `0${last10}`
    ];

    try {
      // 2.1 PatientRecord
      const existingPatient = await prisma.patientRecord.findFirst({
        where: {
          OR: searchTerms.map(t => ({ phone: { contains: t } })),
          ...(cleanName ? { name: { equals: cleanName, mode: 'insensitive' } } : {}),
          uhid: { not: null },
        },
        select: { uhid: true },
        orderBy: { createdAt: 'desc' }
      });
      if (existingPatient?.uhid) return existingPatient.uhid;

      // 2.2 Lead
      const existingLead = await prisma.lead.findFirst({
        where: {
          OR: [
            ...searchTerms.map(t => ({ mobile: { contains: t } })),
            ...searchTerms.map(t => ({ whatsapp: { contains: t } }))
          ],
          ...(cleanName ? { fullName: { equals: cleanName, mode: 'insensitive' } } : {}),
          uhid: { not: null },
        },
        select: { uhid: true },
        orderBy: { createdAt: 'desc' }
      });
      if (existingLead?.uhid) return existingLead.uhid;

      // 2.3 MedicineOrder
      const existingOrder = await prisma.medicineOrder.findFirst({
        where: {
          OR: searchTerms.map(t => ({ mobile: { contains: t } })),
          ...(cleanName ? { patientName: { equals: cleanName, mode: 'insensitive' } } : {}),
          uhid: { not: null },
        },
        select: { uhid: true },
        orderBy: { createdAt: 'desc' }
      });
      if (existingOrder?.uhid) return existingOrder.uhid;

      // 2.4 FreeConsultationRequest
      const existingConsult = await prisma.freeConsultationRequest.findFirst({
        where: {
          OR: searchTerms.map(t => ({ phone: { contains: t } })),
          ...(cleanName ? { name: { equals: cleanName, mode: 'insensitive' } } : {}),
          uhid: { not: null },
        },
        select: { uhid: true },
        orderBy: { createdAt: 'desc' }
      });
      if (existingConsult?.uhid) return existingConsult.uhid;
    } catch (err) {
      console.error('Error finding existing UHID via Prisma:', err);
    }
  }

  return await generateNextUhid();
}
