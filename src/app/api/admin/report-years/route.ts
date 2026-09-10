import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const years = await prisma.reportYear.findMany({
      orderBy: { year: 'desc' }
    });
    return NextResponse.json(years);
  } catch (error) {
    console.error('Error fetching report years:', error);
    return NextResponse.json({ error: 'Failed to fetch years' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { year } = body;

    if (!year) {
      return NextResponse.json({ error: 'Year is required' }, { status: 400 });
    }

    const existingYear = await prisma.reportYear.findUnique({
      where: { year: parseInt(year) }
    });

    if (existingYear) {
      return NextResponse.json({ error: 'Year already exists' }, { status: 400 });
    }

    const newYear = await prisma.reportYear.create({
      data: { year: parseInt(year) }
    });

    return NextResponse.json(newYear);
  } catch (error) {
    console.error('Error creating report year:', error);
    return NextResponse.json({ error: 'Failed to create year' }, { status: 500 });
  }
}
