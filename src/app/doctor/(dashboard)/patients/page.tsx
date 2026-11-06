import React from 'react';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';
import DoctorPatientsClient from './DoctorPatientsClient';

export const dynamic = 'force-dynamic';

export default async function DoctorPatientsPage() {
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

  // Fetch patients assigned to this doctor
  const patients = await prisma.patientRecord.findMany({
    where: { consultant: doctorName },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <DoctorPatientsClient
      initialPatients={patients}
      doctorName={doctorName}
      doctorType={doctorType}
      isDietician={isDietician}
    />
  );
}
