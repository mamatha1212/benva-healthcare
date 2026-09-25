import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const year = req.nextUrl.searchParams.get('year');
    const month = req.nextUrl.searchParams.get('month');

    if (!year || !month) {
      return NextResponse.json({ error: 'Year and month are required' }, { status: 400 });
    }

    // month in query is 0-indexed (0 = Jan, 11 = Dec)
    const dbMonth = parseInt(month) + 1; // SQL EXTRACT MONTH returns 1-12

    const counts: any = await prisma.$queryRaw`
      SELECT EXTRACT(DAY FROM date) as day, COUNT(*)::int as count 
      FROM "ReportFile" 
      WHERE EXTRACT(YEAR FROM date) = ${parseInt(year)}
        AND EXTRACT(MONTH FROM date) = ${dbMonth}
      GROUP BY EXTRACT(DAY FROM date)
    `;

    const countMap = new Map();
    if (Array.isArray(counts)) {
      counts.forEach(c => countMap.set(Number(c.day), Number(c.count)));
    }

    // Assuming max 31 days
    const daysData = Array.from({ length: 31 }, (_, i) => ({
      day: i + 1,
      count: countMap.get(i + 1) || 0
    }));

    return NextResponse.json(daysData);
  } catch (error) {
    console.error('Error fetching daily counts:', error);
    return NextResponse.json({ error: 'Failed to fetch counts' }, { status: 500 });
  }
}
