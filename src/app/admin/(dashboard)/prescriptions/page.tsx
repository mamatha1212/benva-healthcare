import React from 'react';
import { prisma } from '@/lib/prisma';
import AdminPrescriptionsClient from './AdminPrescriptionsClient';

export default async function AdminPrescriptionsPage() {
  const submittedPrescriptions = await prisma.patientFile.findMany({
    where: { status: 'SUBMITTED' },
    include: {
      patient: true
    },
    orderBy: { createdAt: 'desc' }
  });

  const doctors = await prisma.doctor.findMany();
  
  const mappedPrescriptions = submittedPrescriptions.map(file => {
    const doctor = doctors.find(d => d.name === file.patient.consultant);
    return {
      ...file,
      doctorProfile: doctor || null
    };
  });

  return <AdminPrescriptionsClient initialPrescriptions={mappedPrescriptions} />;
}
