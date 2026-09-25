import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const year = req.nextUrl.searchParams.get('year');
    if (!year) {
      return NextResponse.json({ error: 'Year is required' }, { status: 400 });
    }

    const counts: any = await prisma.$queryRaw`
      SELECT EXTRACT(MONTH FROM date) as month, COUNT(*)::int as count 
      FROM "ReportFile" 
      WHERE EXTRACT(YEAR FROM date) = ${parseInt(year)}
      GROUP BY EXTRACT(MONTH FROM date)
    `;

    const countMap = new Map();
    if (Array.isArray(counts)) {
      counts.forEach(c => countMap.set(Number(c.month), Number(c.count)));
    }

    const monthsData = Array.from({ length: 12 }, (_, i) => ({
      month: i, // 0-11 for JS dates, but SQL EXTRACT returns 1-12.
      count: countMap.get(i + 1) || 0
    }));

    return NextResponse.json(monthsData);
  } catch (error) {
    console.error('Error fetching monthly counts:', error);
    return NextResponse.json({ error: 'Failed to fetch counts' }, { status: 500 });
  }
}
