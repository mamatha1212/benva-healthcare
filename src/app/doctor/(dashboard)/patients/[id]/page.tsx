import React from 'react';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import PatientDetailClient from './PatientDetailClient';

export default async function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const patient = await prisma.patientRecord.findUnique({
    where: { id },
    include: {
      files: {
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!patient) {
    redirect('/doctor/patients');
  }

  return <PatientDetailClient initialPatient={patient} />;
}
