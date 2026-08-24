import React from 'react';
import LoginForm from './LoginForm';

// This firmly forces Next.js NOT to statically prerender the login page
export const dynamic = 'force-dynamic';

export default function AdminLoginPage() {
  return <LoginForm />;
}
