import React from 'react';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';
import DoctorPatientsClient from './DoctorPatientsClient';

export default async function DoctorPatientsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('doctor_token')?.value;
  
  let doctorName = 'Doctor';
  
  if (token) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'benva-super-secret-key-2026');
      const { payload } = await jwtVerify(token, secret);
      if (payload.name) doctorName = payload.name as string;
    } catch (e) {
      // ignore
    }
  }

  // Fetch patients assigned to this doctor
  const patients = await prisma.patientRecord.findMany({
    where: { consultant: doctorName },
    orderBy: { createdAt: 'desc' }
  });

  return <DoctorPatientsClient initialPatients={patients} doctorName={doctorName} />;
}
