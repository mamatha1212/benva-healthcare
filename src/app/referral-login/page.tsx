import React from 'react';
import LoginForm from './LoginForm';

export default function ReferralLoginPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      <div style={{ width: '100%', maxWidth: '400px', padding: '24px' }}>
        <LoginForm />
      </div>
    </div>
  );
}
