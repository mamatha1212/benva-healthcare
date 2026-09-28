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

  return <AdminPrescriptionsClient initialPrescriptions={submittedPrescriptions} />;
}
