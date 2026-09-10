import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get('date');
    if (!dateStr) return NextResponse.json({ error: 'Missing date' }, { status: 400 });

    const date = new Date(dateStr);
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const prefix = `${year}${month}`;

    const latestReport = await prisma.reportFile.findFirst({
      where: {
        patientId: {
          startsWith: prefix,
        },
      },
      orderBy: {
        patientId: 'desc',
      },
      select: {
        patientId: true,
      },
    });

    let nextSequence = 1;
    if (latestReport && latestReport.patientId) {
      // Safely extract the numeric part at the end
      const lastSequenceStr = latestReport.patientId.slice(prefix.length);
      const lastSequence = parseInt(lastSequenceStr);
      if (!isNaN(lastSequence)) {
        nextSequence = lastSequence + 1;
      }
    }

    const nextId = `${prefix}${nextSequence.toString().padStart(3, '0')}`;

    return NextResponse.json({ nextId });
  } catch (error: any) {
    console.error('Error generating next ID:', error);
    return NextResponse.json({ error: 'Failed to generate next ID' }, { status: 500 });
  }
}
