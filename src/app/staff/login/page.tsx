'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { loginStaff } from './actions';

export default function StaffLogin() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (credentials.username && credentials.password) {
        // Call the server action to verify and set cookie
        await loginStaff(credentials.username);
        
        // Redirect to dashboard without alert
        router.push('/staff/dashboard');
      } else {
        setError('Please enter both username and password.');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed - invalid username');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
      fontFamily: "'Inter', sans-serif"
    }}>
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '16px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            <img 
              src="/images/Benva%20NEW.png" 
              alt="Benva Healthcare" 
              style={{ height: '45px', width: 'auto' }} 
            />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', margin: 0 }}>Staff Portal</h1>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '8px' }}>Sign in to access your dashboard</p>
        </div>

        {error && (
          <div style={{
            background: '#fef2f2', border: '1px solid #fecaca', color: '#ef4444',
            padding: '12px', borderRadius: '8px', fontSize: '14px', marginBottom: '20px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
              Username or Email
            </label>
            <input 
              type="text" 
              name="username"
              required
              value={credentials.username}
              onChange={handleChange}
              style={{
                width: '100%', padding: '12px 16px', borderRadius: '8px',
                border: '1px solid #cbd5e1', fontSize: '15px', outline: 'none',
                boxSizing: 'border-box'
              }}
              placeholder="e.g., janedoe"
            />
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
              Password
            </label>
            <input 
              type="password" 
              name="password"
              required
              value={credentials.password}
              onChange={handleChange}
              style={{
                width: '100%', padding: '12px 16px', borderRadius: '8px',
                border: '1px solid #cbd5e1', fontSize: '15px', outline: 'none',
                boxSizing: 'border-box'
              }}
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{
              background: '#2563eb', color: 'white', border: 'none',
              padding: '12px', borderRadius: '8px', fontSize: '16px',
              fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '8px', transition: 'background 0.2s'
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: '#64748b' }}>
          For technical support, contact the IT Administrator.
        </div>
      </div>
    </div>
  );
}
