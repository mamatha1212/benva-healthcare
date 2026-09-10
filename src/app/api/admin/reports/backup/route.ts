import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const year = searchParams.get('year');
    const month = searchParams.get('month'); // 0-indexed
    const day = searchParams.get('day'); // 1-31

    if (!type || !year) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    let startDate: Date;
    let endDate: Date;

    if (type === 'year') {
      startDate = new Date(parseInt(year), 0, 1);
      endDate = new Date(parseInt(year), 11, 31, 23, 59, 59, 999);
    } else if (type === 'month') {
      if (!month) return NextResponse.json({ error: 'Missing month' }, { status: 400 });
      startDate = new Date(parseInt(year), parseInt(month), 1);
      endDate = new Date(parseInt(year), parseInt(month) + 1, 0, 23, 59, 59, 999);
    } else if (type === 'day') {
      if (!month || !day) return NextResponse.json({ error: 'Missing month or day' }, { status: 400 });
      startDate = new Date(parseInt(year), parseInt(month), parseInt(day), 0, 0, 0, 0);
      endDate = new Date(parseInt(year), parseInt(month), parseInt(day), 23, 59, 59, 999);
    } else {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    const reports = await prisma.reportFile.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(reports);
  } catch (error) {
    console.error('Error fetching backup reports:', error);
    return NextResponse.json({ error: 'Failed to fetch backup' }, { status: 500 });
  }
}
