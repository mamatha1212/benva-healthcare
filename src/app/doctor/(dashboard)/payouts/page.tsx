import React from 'react';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import DoctorPayoutsClient from './DoctorPayoutsClient';

export default async function DoctorPayoutsPage() {
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

  return <DoctorPayoutsClient doctorName={doctorName} />;
}
