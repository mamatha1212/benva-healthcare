import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || '';
    const date = searchParams.get('date');
    const month = searchParams.get('month'); // 0-11
    const year = searchParams.get('year');

    const OR: any[] = [];
    
    if (q) {
      OR.push(
        { patientName: { contains: q, mode: 'insensitive' } },
        { patientId: { contains: q, mode: 'insensitive' } },
        { mobileNumber: { contains: q, mode: 'insensitive' } },
        { testName: { contains: q, mode: 'insensitive' } },
        { fileName: { contains: q, mode: 'insensitive' } }
      );
    }

    const where: any = {};
    if (OR.length > 0) {
      where.OR = OR;
    }

    if (year) {
      const y = parseInt(year);
      let startDate = new Date(y, 0, 1);
      let endDate = new Date(y, 11, 31, 23, 59, 59, 999);
      
      if (month) {
        const m = parseInt(month);
        startDate = new Date(y, m, 1);
        endDate = new Date(y, m + 1, 0, 23, 59, 59, 999);
        
        if (date) {
          const d = parseInt(date);
          startDate = new Date(y, m, d, 0, 0, 0, 0);
          endDate = new Date(y, m, d, 23, 59, 59, 999);
        }
      }

      where.date = {
        gte: startDate,
        lte: endDate
      };
    }

    const reports = await prisma.reportFile.findMany({
      where,
      select: {
        id: true,
        date: true,
        title: true,
        fileName: true,
        patientName: true,
        patientId: true,
        mobileNumber: true,
        testName: true,
        labName: true,
        reference: true,
        remarks: true,
        needsReminder: true,
        reminderDate: true,
        createdAt: true
      },
      orderBy: { date: 'desc' }
    });

    return NextResponse.json(reports);
  } catch (error) {
    console.error('Error searching reports:', error);
    return NextResponse.json({ error: 'Failed to search reports' }, { status: 500 });
  }
}
