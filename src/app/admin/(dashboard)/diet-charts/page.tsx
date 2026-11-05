import React from 'react';
import { prisma } from '@/lib/prisma';
import AdminDietChartsClient from './AdminDietChartsClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminDietChartsPage() {
  const submittedDietCharts = await prisma.patientFile.findMany({
    where: {
      fileType: 'DIET_CHART'
    },
    include: {
      patient: true
    },
    orderBy: { createdAt: 'desc' }
  });

  const doctors = await prisma.doctor.findMany();
  
  const mappedCharts = submittedDietCharts.map(file => {
    const doctor = doctors.find(d => d.name === file.patient.consultant);
    return {
      ...file,
      doctorProfile: doctor || null
    };
  });

  return <AdminDietChartsClient initialDietCharts={mappedCharts} />;
}

