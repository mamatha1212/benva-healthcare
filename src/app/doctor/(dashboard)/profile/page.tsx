'use client';

import React, { useState, useEffect } from 'react';
import { Save, Loader2, User } from 'lucide-react';

export default function DoctorProfilePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    qualification: '',
    speciality: '',
    medicalCouncilReg: '',
    signature: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/doctor/profile');
      if (!res.ok) throw new Error('Failed to fetch profile');
      const data = await res.json();
      setFormData({
        name: data.name || '',
        phone: data.phone || '',
        qualification: data.qualification || '',
        speciality: data.speciality || '',
        medicalCouncilReg: data.medicalCouncilReg || '',
        signature: data.signature || ''
      });
    } catch (err: any) {
      setError(err.message || 'Error loading profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/doctor/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error('Failed to update profile');
      setSuccess('Profile updated successfully.');
    } catch (err: any) {
      setError(err.message || 'Error saving profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#02559d' }}><Loader2 className="animate-spin" /></div>;
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', flexWrap: 'nowrap' }}>
        <User size={28} color="#02559d" style={{ flexShrink: 0 }} />
        <h1 style={{ fontSize: 'clamp(18px, 5vw, 24px)', fontWeight: 'bold', color: '#0f172a', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Doctor Profile Settings</h1>
      </div>
      <p style={{ color: '#64748b', marginBottom: '32px' }}>
        These details will be used as default values when generating prescriptions.
      </p>

      {error && <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '12px', borderRadius: '8px', marginBottom: '24px' }}>{error}</div>}
      {success && <div style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', padding: '12px', borderRadius: '8px', marginBottom: '24px' }}>{success}</div>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px', backgroundColor: '#ffffff', padding: '32px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '14px', color: '#334155', fontWeight: 600 }}>Doctor Name</label>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            style={{ padding: '12px', borderRadius: '8px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', color: '#0f172a', outline: 'none', transition: 'border-color 0.2s' }}
            onFocus={(e) => e.target.style.borderColor = '#02559d'}
            onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
            required
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', color: '#334155', fontWeight: 600 }}>Qualification</label>
            <input
              name="qualification"
              value={formData.qualification}
              onChange={handleChange}
              placeholder="e.g. MBBS, MD"
              style={{ padding: '12px', borderRadius: '8px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', color: '#0f172a', outline: 'none', transition: 'border-color 0.2s' }}
              onFocus={(e) => e.target.style.borderColor = '#02559d'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', color: '#334155', fontWeight: 600 }}>Speciality</label>
            <input
              name="speciality"
              value={formData.speciality}
              onChange={handleChange}
              placeholder="e.g. General Physician"
              style={{ padding: '12px', borderRadius: '8px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', color: '#0f172a', outline: 'none', transition: 'border-color 0.2s' }}
              onFocus={(e) => e.target.style.borderColor = '#02559d'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', color: '#334155', fontWeight: 600 }}>Medical Council Reg. No.</label>
            <input
              name="medicalCouncilReg"
              value={formData.medicalCouncilReg}
              onChange={handleChange}
              style={{ padding: '12px', borderRadius: '8px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', color: '#0f172a', outline: 'none', transition: 'border-color 0.2s' }}
              onFocus={(e) => e.target.style.borderColor = '#02559d'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', color: '#334155', fontWeight: 600 }}>Phone Number</label>
            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              style={{ padding: '12px', borderRadius: '8px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', color: '#0f172a', outline: 'none', transition: 'border-color 0.2s' }}
              onFocus={(e) => e.target.style.borderColor = '#02559d'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '14px', color: '#334155', fontWeight: 600 }}>Digital Signature Text or Initials</label>
          <input
            name="signature"
            value={formData.signature}
            onChange={handleChange}
            placeholder="e.g. Dr. John Doe"
            style={{ padding: '12px', borderRadius: '8px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', color: '#0f172a', outline: 'none', transition: 'border-color 0.2s' }}
            onFocus={(e) => e.target.style.borderColor = '#02559d'}
            onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
          />
        </div>

        <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="submit"
            disabled={isSaving}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              backgroundColor: '#02559d',
              color: '#ffffff',
              borderRadius: '8px',
              fontWeight: 600,
              border: 'none',
              cursor: isSaving ? 'not-allowed' : 'pointer',
              opacity: isSaving ? 0.7 : 1,
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => !isSaving && (e.currentTarget.style.backgroundColor = '#013a6b')}
            onMouseOut={(e) => !isSaving && (e.currentTarget.style.backgroundColor = '#02559d')}
          >
            {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            {isSaving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>

      </form>
    </div>
  );
}
