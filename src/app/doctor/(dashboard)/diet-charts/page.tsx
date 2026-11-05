import React from 'react';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { redirect } from 'next/navigation';
import DoctorDietChartsClient from './DoctorDietChartsClient';

export const dynamic = 'force-dynamic';

export default async function DoctorDietChartsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('doctor_token')?.value;

  if (!token) {
    redirect('/doctor/login');
  }

  let doctorName = 'Dietitian';
  let doctorId = '';
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'benva-super-secret-key-2026');
    const { payload } = await jwtVerify(token, secret);
    if (payload.name) doctorName = payload.name as string;
    if (payload.id) doctorId = payload.id as string;
  } catch (e) {
    redirect('/doctor/login');
  }

  // Fetch all DIET_CHART files for patients of this dietitian
  const dietCharts = await prisma.patientFile.findMany({
    where: {
      fileType: 'DIET_CHART',
      patient: {
        consultant: doctorName
      }
    },
    include: {
      patient: true
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <DoctorDietChartsClient
      initialDietCharts={dietCharts}
      doctorName={doctorName}
    />
  );
}

