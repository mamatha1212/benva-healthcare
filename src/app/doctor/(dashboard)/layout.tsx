import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import DoctorLayoutClient from './DoctorLayoutClient';

export default async function DoctorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get('doctor_token')?.value;

  if (!token) {
    redirect('/admin/login');
  }

  let doctorData = null;
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'benva-super-secret-key-2026');
    const { payload } = await jwtVerify(token, secret);
    
    if (payload.role !== 'doctor') {
      redirect('/admin/login');
    }
    doctorData = payload;
  } catch (e) {
    redirect('/admin/login');
  }

  return (
    <DoctorLayoutClient doctorData={doctorData}>
      {children}
    </DoctorLayoutClient>
  );
}
