import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { employees } = await req.json();
    
    if (!employees || !Array.isArray(employees) || employees.length === 0) {
      return NextResponse.json({ error: 'No valid employees provided' }, { status: 400 });
    }

    const created = await prisma.corporateEmployee.createMany({
      data: employees,
      skipDuplicates: true
    });

    return NextResponse.json({ success: true, count: created.count }, { status: 201 });
  } catch (error) {
    console.error('Error in bulk import employees:', error);
    return NextResponse.json({ error: 'Failed to import employees' }, { status: 500 });
  }
}
