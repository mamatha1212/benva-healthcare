import React from 'react';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';

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

  // Set up date boundaries for today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Fetch real analytics
  const totalPatients = await prisma.patientRecord.count({
    where: { consultant: doctorName }
  });

  const todaysAppointments = await prisma.patientRecord.count({
    where: { 
      consultant: doctorName,
      createdAt: { gte: today, lt: tomorrow }
    }
  });

  const pendingReports = await prisma.patientFile.count({
    where: { 
      status: 'DRAFT',
      patient: { consultant: doctorName }
    }
  });

  const recentActivity = await prisma.patientRecord.findMany({
    where: { consultant: doctorName },
    orderBy: { createdAt: 'desc' },
    take: 5
  });

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
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#0f172a' }}>{todaysAppointments}</div>
        </div>
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
          <div style={{ color: '#64748b', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>Total Patients</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#0f172a' }}>{totalPatients}</div>
        </div>
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
          <div style={{ color: '#64748b', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>Pending Reports</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#0f172a' }}>{pendingReports}</div>
        </div>
      </div>

      <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#0f172a', marginBottom: '16px' }}>Recent Activity</h2>
        
        {recentActivity.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentActivity.map((activity) => (
              <div key={activity.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', border: '1px solid #f1f5f9', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '40px', height: '40px', backgroundColor: '#e0f2fe', color: '#0284c7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                    {activity.name.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{activity.name}</div>
                    <div style={{ fontSize: '13px', color: '#64748b' }}>New Patient Added • {activity.phone}</div>
                  </div>
                </div>
                <div style={{ color: '#64748b', fontSize: '13px' }}>
                  {new Date(activity.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
            No recent activity to display.
          </div>
        )}
      </div>
    </div>
  );
}
