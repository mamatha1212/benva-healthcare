import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const payouts = await prisma.drPayout.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(payouts);
  } catch (error) {
    console.error('Failed to fetch payouts:', error);
    return NextResponse.json({ error: 'Failed to fetch payouts' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Check if we are updating an existing payout
    if (data.id && typeof data.id === 'string' && data.id.length > 10) {
      // It's a CUID, update it
      const updated = await prisma.drPayout.update({
        where: { id: data.id },
        data: {
          consultingDoctor: data.consultingDoctor,
          consultationMode: data.consultationMode,
          reportingPeriod: data.reportingPeriod,
          year: data.year,
          totalPatientsConsulted: Number(data.totalPatientsConsulted) || 0,
          totalConsultationsCompleted: Number(data.totalConsultationsCompleted) || 0,
          totalPayoutAmount: Number(data.totalPayoutAmount) || 0,
          payoutDate: data.payoutDate,
          paymentMode: data.paymentMode,
          transactionReferenceNo: data.transactionReferenceNo,
          paymentScreenshotUrl: data.paymentScreenshotUrl,
          records: data.records,
        }
      });
      return NextResponse.json(updated);
    } else {
      // Create new
      const created = await prisma.drPayout.create({
        data: {
          consultingDoctor: data.consultingDoctor,
          consultationMode: data.consultationMode,
          reportingPeriod: data.reportingPeriod,
          year: data.year,
          totalPatientsConsulted: Number(data.totalPatientsConsulted) || 0,
          totalConsultationsCompleted: Number(data.totalConsultationsCompleted) || 0,
          totalPayoutAmount: Number(data.totalPayoutAmount) || 0,
          payoutDate: data.payoutDate,
          paymentMode: data.paymentMode,
          transactionReferenceNo: data.transactionReferenceNo,
          paymentScreenshotUrl: data.paymentScreenshotUrl,
          records: data.records,
        }
      });
      return NextResponse.json(created);
    }
  } catch (error) {
    console.error('Failed to save payout:', error);
    return NextResponse.json({ error: 'Failed to save payout' }, { status: 500 });
  }
}
