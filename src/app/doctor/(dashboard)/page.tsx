import React from 'react';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

export default async function DoctorDashboardPage() {
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

  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a', marginBottom: '8px' }}>
        Welcome back, Dr. {doctorName}
      </h1>
      <p style={{ color: '#64748b', marginBottom: '32px' }}>
        Here is your overview for today.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
          <div style={{ color: '#64748b', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>Today's Appointments</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#0f172a' }}>0</div>
        </div>
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
          <div style={{ color: '#64748b', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>Total Patients</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#0f172a' }}>0</div>
        </div>
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
          <div style={{ color: '#64748b', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>Pending Reports</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#0f172a' }}>0</div>
        </div>
      </div>

      <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#0f172a', marginBottom: '16px' }}>Recent Activity</h2>
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
          No recent activity to display.
        </div>
      </div>
    </div>
  );
}
