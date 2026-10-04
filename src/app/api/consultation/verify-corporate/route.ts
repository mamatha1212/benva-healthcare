import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    const employee = await prisma.corporateEmployee.findFirst({
      where: { phone },
      include: { organization: true }
    });

    if (!employee) {
      return NextResponse.json({ error: 'No corporate employee found with this phone number.' }, { status: 404 });
    }

    return NextResponse.json(employee, { status: 200 });
  } catch (error) {
    console.error('Error verifying corporate employee:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
