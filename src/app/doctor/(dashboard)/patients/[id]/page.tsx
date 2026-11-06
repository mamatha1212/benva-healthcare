import React from 'react';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import PatientDetailClient from './PatientDetailClient';

export const dynamic = 'force-dynamic';

export default async function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const cookieStore = await cookies();
  const token = cookieStore.get('doctor_token')?.value;

  let doctorName = 'Doctor';
  let doctorType = 'CONSULTANT';

  if (token) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'benva-super-secret-key-2026');
      const { payload } = await jwtVerify(token, secret);
      if (payload.name) doctorName = payload.name as string;
      if (payload.type) doctorType = payload.type as string;

      if (payload.id) {
        const doc = await prisma.doctor.findUnique({
          where: { id: payload.id as string }
        });
        if (doc) {
          if (doc.type) doctorType = doc.type;
          if (doc.name) doctorName = doc.name;
        }
      }
    } catch (e) {
      // ignore
    }
  }

  const isDietician =
    doctorType === 'DIETICIAN' ||
    doctorName.toLowerCase().startsWith('dt.') ||
    doctorName.toLowerCase().startsWith('dt ');

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

  return (
    <PatientDetailClient
      initialPatient={patient}
      isDietician={isDietician}
      doctorType={doctorType}
      doctorName={doctorName}
    />
  );
}
