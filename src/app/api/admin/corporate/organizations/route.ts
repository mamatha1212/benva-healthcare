import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const orgs = await prisma.organization.findMany({
      include: {
        employees: true
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(orgs);
  } catch (error) {
    console.error('Error fetching orgs:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { companyName, hrName, hrEmail, hrPhone, address } = await req.json();
    
    if (!companyName || !hrName || !hrEmail || !hrPhone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newOrg = await prisma.organization.create({
      data: { companyName, hrName, hrEmail, hrPhone, address, status: 'ACTIVE' }
    });
    return NextResponse.json(newOrg, { status: 201 });
  } catch (error) {
    console.error('Error creating org:', error);
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, companyName, hrName, hrEmail, hrPhone, address } = await req.json();
    
    if (!id || !companyName || !hrName || !hrEmail || !hrPhone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const updatedOrg = await prisma.organization.update({
      where: { id },
      data: { companyName, hrName, hrEmail, hrPhone, address }
    });
    return NextResponse.json(updatedOrg, { status: 200 });
  } catch (error) {
    console.error('Error updating org:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
