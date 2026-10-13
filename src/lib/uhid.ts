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
  const cleanPhone = phone?.trim();
  const cleanName = name?.trim();

  if (cleanPhone) {
    try {
      // 1. PatientRecord
      const existingPatient = await prisma.patientRecord.findFirst({
        where: {
          phone: cleanPhone,
          ...(cleanName ? { name: { equals: cleanName, mode: 'insensitive' } } : {}),
          uhid: { not: null },
        },
        select: { uhid: true },
      });
      if (existingPatient?.uhid) return existingPatient.uhid;

      // 2. MedicineOrder
      const existingOrder = await prisma.medicineOrder.findFirst({
        where: {
          mobile: cleanPhone,
          ...(cleanName ? { patientName: { equals: cleanName, mode: 'insensitive' } } : {}),
          uhid: { not: null },
        },
        select: { uhid: true },
      });
      if (existingOrder?.uhid) return existingOrder.uhid;

      // 3. Lead
      const existingLead = await prisma.lead.findFirst({
        where: {
          mobile: cleanPhone,
          ...(cleanName ? { fullName: { equals: cleanName, mode: 'insensitive' } } : {}),
          uhid: { not: null },
        },
        select: { uhid: true },
      });
      if (existingLead?.uhid) return existingLead.uhid;

      // 4. FreeConsultationRequest
      const existingConsult = await prisma.freeConsultationRequest.findFirst({
        where: {
          phone: cleanPhone,
          ...(cleanName ? { name: { equals: cleanName, mode: 'insensitive' } } : {}),
          uhid: { not: null },
        },
        select: { uhid: true },
      });
      if (existingConsult?.uhid) return existingConsult.uhid;
    } catch (err) {
      console.error('Error finding existing UHID:', err);
    }
  }

  return await generateNextUhid();
}
