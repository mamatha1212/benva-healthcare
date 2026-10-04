import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    const request = await prisma.freeConsultationRequest.create({
      data: {
        type: data.type,
        name: data.name,
        phone: data.phone,
        email: data.email,
        employeeId: data.employeeId,
        organizationName: data.organizationName,
        problem: data.problem,
        previousMedication: data.previousMedication,
        reportUrl: data.reportUrl,
        state: data.state,
        district: data.district,
        pincode: data.pincode,
      }
    });

    return NextResponse.json({ success: true, id: request.id }, { status: 201 });
  } catch (error) {
    console.error('Error submitting consultation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
