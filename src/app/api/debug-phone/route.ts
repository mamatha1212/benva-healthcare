import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || '9010681168';
  const digits = q.replace(/\D/g, '');
  const last10 = digits.slice(-10);

  // Search in all tables using raw SQL or prisma queries
  const results: any = {};

  try {
    results.patientRecords = await prisma.patientRecord.findMany({
      where: {
        OR: [
          { phone: { contains: last10 } },
          { phone: { contains: digits } },
          { name: { contains: q, mode: 'insensitive' } }
        ]
      }
    });

    results.leads = await prisma.lead.findMany({
      where: {
        OR: [
          { mobile: { contains: last10 } },
          { whatsapp: { contains: last10 } },
          { mobile: { contains: digits } },
          { fullName: { contains: q, mode: 'insensitive' } }
        ]
      }
    });

    results.medicineOrders = await prisma.medicineOrder.findMany({
      where: {
        OR: [
          { mobile: { contains: last10 } },
          { patientName: { contains: q, mode: 'insensitive' } }
        ]
      }
    });

    results.freeConsultations = await prisma.freeConsultationRequest.findMany({
      where: {
        OR: [
          { phone: { contains: last10 } },
          { name: { contains: q, mode: 'insensitive' } }
        ]
      }
    });

    results.reportFiles = await prisma.reportFile.findMany({
      where: {
        OR: [
          { mobileNumber: { contains: last10 } },
          { patientName: { contains: q, mode: 'insensitive' } }
        ]
      }
    });

    results.doctorApplications = await prisma.doctorApplication.findMany({
      where: {
        OR: [
          { mobile: { contains: last10 } },
          { fullName: { contains: q, mode: 'insensitive' } }
        ]
      }
    });

    results.allLeadsCount = await prisma.lead.count();
    results.allPatientsCount = await prisma.patientRecord.count();

    // Also search with raw query in case spaces/formatting exist
    try {
      const rawLeads: any = await prisma.$queryRawUnsafe(
        `SELECT id, "fullName", mobile, whatsapp, uhid FROM "Lead" WHERE regexp_replace(mobile, '[^0-9]', '', 'g') LIKE '%${last10}%' OR regexp_replace(whatsapp, '[^0-9]', '', 'g') LIKE '%${last10}%' LIMIT 10;`
      );
      results.rawLeadsRegex = rawLeads;
    } catch (e: any) {
      results.rawLeadsError = e.message;
    }

    try {
      const rawPatients: any = await prisma.$queryRawUnsafe(
        `SELECT id, name, phone, uhid FROM "PatientRecord" WHERE regexp_replace(phone, '[^0-9]', '', 'g') LIKE '%${last10}%' LIMIT 10;`
      );
      results.rawPatientsRegex = rawPatients;
    } catch (e: any) {
      results.rawPatientsError = e.message;
    }

    return NextResponse.json({ success: true, query: q, last10, results });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message });
  }
}

