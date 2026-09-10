import React from 'react';
import { prisma } from '@/lib/prisma';
import DoctorList from './DoctorList';

export default async function ManageDoctorsAdmin() {
  const doctors = await prisma.doctor.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div>
      <DoctorList initialDoctors={doctors} />
    </div>
  );
}
