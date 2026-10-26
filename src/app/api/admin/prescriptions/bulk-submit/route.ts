import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const updated = await prisma.patientFile.updateMany({
      where: {
        fileType: 'PRESCRIPTION',
        status: { not: 'SUBMITTED' }
      },
      data: {
        status: 'SUBMITTED'
      }
    });

    return NextResponse.json({ success: true, count: updated.count });
  } catch (error) {
    console.error('Error bulk submitting prescriptions:', error);
    return NextResponse.json(
      { error: 'Failed to bulk submit prescriptions' },
      { status: 500 }
    );
  }
}
