import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    // Rate Limiting Logic
    if (data.email || data.phone) {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

      const userConditions = [];
      if (data.email) userConditions.push({ email: data.email });
      if (data.phone) userConditions.push({ phone: data.phone });

      if (data.type === 'GENERAL') {
        const lastYearRequest = await prisma.freeConsultationRequest.findFirst({
          where: {
            type: 'GENERAL',
            OR: userConditions,
            createdAt: { gte: oneYearAgo },
          },
          orderBy: { createdAt: 'desc' },
        });

        if (lastYearRequest) {
          const dateStr = lastYearRequest.createdAt.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
          return NextResponse.json(
            { error: `Your yearly limit is completed. General users get only one free consultation per year.\n(Last booked on: ${dateStr})` },
            { status: 429 }
          );
        }
      } else if (data.type === 'CORPORATE') {
        const lastQuarterRequest = await prisma.freeConsultationRequest.findFirst({
          where: {
            type: 'CORPORATE',
            OR: userConditions,
            createdAt: { gte: threeMonthsAgo },
          },
          orderBy: { createdAt: 'desc' },
        });

        if (lastQuarterRequest) {
          const dateStr = lastQuarterRequest.createdAt.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
          return NextResponse.json(
            { error: `Your quarterly limit is completed. Corporate users get only one free consultation per quarter.\n(Last booked on: ${dateStr})` },
            { status: 429 }
          );
        }

        const pastYearRequestsCount = await prisma.freeConsultationRequest.count({
          where: {
            type: 'CORPORATE',
            OR: userConditions,
            createdAt: { gte: oneYearAgo },
          },
        });

        if (pastYearRequestsCount >= 4) {
          return NextResponse.json(
            { error: 'Corporate users are limited to 4 free consultations per year.' },
            { status: 429 }
          );
        }
      }
    }

    const request = await prisma.freeConsultationRequest.create({
      data: {
        type: data.type,
        name: data.name,
        phone: data.phone,
        email: data.email,
        age: data.age,
        gender: data.gender,
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
