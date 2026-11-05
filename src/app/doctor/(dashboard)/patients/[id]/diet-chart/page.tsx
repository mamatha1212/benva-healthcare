import React from 'react';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import DietChartClient from './DietChartClient';

export const dynamic = 'force-dynamic';

export default async function PatientDietChartPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ fileId?: string; view?: string }>;
}) {
  const { id } = await params;
  const { fileId, view } = await searchParams;

  const cookieStore = await cookies();
  const token = cookieStore.get('doctor_token')?.value;

  if (!token) {
    redirect('/doctor/login');
  }

  let doctor: any = null;
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'benva-super-secret-key-2026');
    const { payload } = await jwtVerify(token, secret);
    
    if (payload.id) {
      doctor = await prisma.doctor.findUnique({
        where: { id: payload.id as string }
      });
    }
    if (!doctor) {
      doctor = payload;
    }
  } catch (e) {
    redirect('/doctor/login');
  }

  const patient = await prisma.patientRecord.findUnique({
    where: { id },
    include: {
      files: true
    }
  });

  if (!patient) {
    redirect('/doctor/patients');
  }

  let existingChartData: any = null;
  let existingFile: any = null;

  if (fileId) {
    existingFile = patient.files.find((f: any) => f.id === fileId);
    if (existingFile && existingFile.fileUrl.startsWith('data:')) {
      try {
        const base64Data = existingFile.fileUrl.split(',')[1];
        const decoded = Buffer.from(base64Data, 'base64').toString('utf-8');
        existingChartData = JSON.parse(decoded);
      } catch (err) {
        console.error('Failed to parse diet chart file data', err);
      }
    }
  }

  return (
    <DietChartClient
      patient={patient}
      doctor={doctor}
      initialChartData={existingChartData}
      existingFile={existingFile}
      initialViewMode={view === 'true'}
    />
  );
}

