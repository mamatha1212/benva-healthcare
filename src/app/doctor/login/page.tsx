import React from 'react';
import LoginForm from '@/app/admin/login/LoginForm';

export const dynamic = 'force-dynamic';

export default function DoctorLoginPage() {
  return <LoginForm initialRole="doctor" />;
}
