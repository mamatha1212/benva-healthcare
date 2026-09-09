import React from 'react';
import { prisma } from '@/lib/prisma';
import PatientList from './PatientList';

export default async function PatientRecordsAdmin() {
  const patients = await prisma.patientRecord.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      files: true,
      invoices: {
        orderBy: { createdAt: 'desc' },
        include: { items: true }
      }
    }
  });

  const doctors = await prisma.doctor.findMany({
    where: { type: 'CONSULTANT' },
    orderBy: { name: 'asc' }
  });

  return (
    <div>
      <PatientList initialPatients={patients} doctors={doctors} />
    </div>
  );
}
