'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getLocationsHierarchy } from '@/components/DoorstepSection/actions';

export default function BookFreeConsultationPage() {
  const [type, setType] = useState<'NONE' | 'GENERAL' | 'CORPORATE'>('NONE');
  
  // Corporate Step State
  const [phoneToVerify, setPhoneToVerify] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [employeeData, setEmployeeData] = useState<any>(null);
  const [verifyError, setVerifyError] = useState('');
  const [corporateConfirmed, setCorporateConfirmed] = useState(false);

  // Locations State
  const [locations, setLocations] = useState<any[]>([]);
  const [availableDistricts, setAvailableDistricts] = useState<any[]>([]);

  useEffect(() => {
    getLocationsHierarchy().then(data => {
      setLocations(data);
    });
  }, []);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    state: '',
    district: '',
    pincode: '',
    problem: '',
    previousMedication: '',
    reportUrl: ''
  });

  // Handle state change
  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedStateName = e.target.value;
    const selectedState = locations.find(s => s.name === selectedStateName);
    setAvailableDistricts(selectedState ? selectedState.districts : []);
    setFormData({ ...formData, state: selectedStateName, district: '' });
  };
  
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneToVerify) return;
    setVerifying(true);
    setVerifyError('');
    setEmployeeData(null);
    try {
      const res = await fetch('/api/consultation/verify-corporate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneToVerify })
      });
      const data = await res.json();
      if (res.ok) {
        setEmployeeData(data);
        // Pre-fill form data
        setFormData(prev => ({
          ...prev,
          name: data.name,
          phone: data.phone,
          email: data.email || ''
        }));
      } else {
        setVerifyError(data.error || 'Verification failed');
      }
    } catch (err) {
      setVerifyError('Something went wrong. Please try again.');
    }
    setVerifying(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    const submitData = {
      ...formData,
      type,
      employeeId: employeeData?.id || null,
      organizationName: employeeData?.organization?.companyName || null
    };

    try {
      const res = await fetch('/api/consultation/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });
      if (res.ok) {
        setSuccess(true);
      } else {
        alert('Failed to submit your request. Please try again.');
      }
    } catch (err) {
      alert('Something went wrong.');
    }
    setSubmitting(false);
  };

  if (success) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: '24px' }}>
        <div style={{ background: 'white', padding: '48px', borderRadius: '16px', textAlign: 'center', maxWidth: '500px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
          <div style={{ width: '64px', height: '64px', background: '#dcfce7', color: '#16a34a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', margin: '0 auto 24px auto' }}>✓</div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>Request Submitted Successfully!</h2>
          <p style={{ color: '#475569', marginBottom: '32px', lineHeight: 1.6 }}>Thank you for requesting a free consultation. Our team will review your details and contact you shortly to schedule your session.</p>
          <button onClick={() => window.location.href = '/'} style={{ padding: '12px 24px', background: '#2563eb', color: 'white', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Return to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '48px 24px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '36px', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>Book Your Free Consultation</h1>
          <p style={{ fontSize: '16px', color: '#64748b' }}>Please select your path to proceed with your booking.</p>
        </div>

        {type === 'NONE' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div onClick={() => setType('GENERAL')} style={{ background: 'white', padding: '32px', borderRadius: '16px', border: '2px solid transparent', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>👥</div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>General Public</h3>
              <p style={{ color: '#64748b', fontSize: '14px' }}>I am booking as an individual seeking general consultation.</p>
            </div>
            
            <div onClick={() => setType('CORPORATE')} style={{ background: 'white', padding: '32px', borderRadius: '16px', border: '2px solid #2563eb', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏢</div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#2563eb', marginBottom: '8px' }}>Corporate Plan</h3>
              <p style={{ color: '#64748b', fontSize: '14px' }}>My company is enrolled in Benva Healthcare corporate program.</p>
            </div>
          </div>
        )}

        {type === 'CORPORATE' && !corporateConfirmed && (
          <div style={{ background: 'white', padding: '32px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
            <button onClick={() => { setType('NONE'); setEmployeeData(null); setVerifyError(''); }} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', marginBottom: '24px', fontWeight: 600 }}>&larr; Back to Selection</button>
            
            <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>Corporate Verification</h2>
            <p style={{ color: '#64748b', marginBottom: '24px' }}>Please enter your mobile number to verify your corporate enrollment.</p>
            
            {!employeeData ? (
              <form onSubmit={handleVerify} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <input 
                  type="text" 
                  placeholder="Enter 10-digit mobile number" 
                  value={phoneToVerify} 
                  onChange={e => setPhoneToVerify(e.target.value)}
                  style={{ flex: '1 1 200px', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '16px' }}
                  required
                />
                <button type="submit" disabled={verifying} style={{ flex: '1 1 120px', padding: '12px 24px', background: '#2563eb', color: 'white', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer' }}>
                  {verifying ? 'Verifying...' : 'Verify'}
                </button>
              </form>
            ) : (
              <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>Details Found</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Name</div>
                    <div style={{ fontSize: '16px', color: '#0f172a', fontWeight: 500 }}>{employeeData.name}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Organization</div>
                    <div style={{ fontSize: '16px', color: '#0f172a', fontWeight: 500 }}>{employeeData.organization?.companyName}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Phone</div>
                    <div style={{ fontSize: '16px', color: '#0f172a', fontWeight: 500 }}>{employeeData.phone}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Email</div>
                    <div style={{ fontSize: '16px', color: '#0f172a', fontWeight: 500 }}>{employeeData.email || 'N/A'}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <button onClick={() => setCorporateConfirmed(true)} style={{ flex: '1 1 200px', padding: '12px', background: '#10b981', color: 'white', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Yes, this is me</button>
                  <button onClick={() => setEmployeeData(null)} style={{ flex: '1 1 200px', padding: '12px', background: 'white', color: '#475569', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 600, cursor: 'pointer' }}>No, try another number</button>
                </div>
              </div>
            )}
            
            {verifyError && <div style={{ color: '#ef4444', marginTop: '16px', fontSize: '14px', background: '#fef2f2', padding: '12px', borderRadius: '8px' }}>{verifyError}</div>}
          </div>
        )}

        {((type === 'GENERAL') || (type === 'CORPORATE' && corporateConfirmed)) && (
          <div style={{ background: 'white', padding: '32px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
            <button onClick={() => { setType('NONE'); setCorporateConfirmed(false); setEmployeeData(null); }} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', marginBottom: '24px', fontWeight: 600 }}>&larr; Start Over</button>
            
            <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', marginBottom: '24px' }}>
              {type === 'CORPORATE' ? 'Complete Your Consultation Request' : 'General Consultation Request'}
            </h2>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Personal Details */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#475569' }}>Full Name *</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required disabled={type === 'CORPORATE'} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', background: type === 'CORPORATE' ? '#f1f5f9' : 'white' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#475569' }}>Mobile Number *</label>
                  <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required disabled={type === 'CORPORATE'} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', background: type === 'CORPORATE' ? '#f1f5f9' : 'white' }} />
                </div>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#475569' }}>Email Address</label>
                <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} disabled={type === 'CORPORATE' && !!employeeData?.email} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', background: (type === 'CORPORATE' && !!employeeData?.email) ? '#f1f5f9' : 'white' }} />
              </div>

              {/* Location Details */}
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: '12px 0 0 0', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>Location Details</h3>
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 calc(50% - 10px)', minWidth: '100px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#475569' }}>State *</label>
                  <select 
                    value={formData.state} 
                    onChange={handleStateChange} 
                    required 
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', background: 'white', appearance: 'auto' }}
                  >
                    <option value="">Select State</option>
                    {locations.map(state => (
                      <option key={state.id} value={state.name}>{state.name}</option>
                    ))}
                  </select>
                </div>
                <div style={{ flex: '1 1 calc(50% - 10px)', minWidth: '100px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#475569' }}>District *</label>
                  <select 
                    value={formData.district} 
                    onChange={e => setFormData({...formData, district: e.target.value})} 
                    required 
                    disabled={!formData.state}
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', background: !formData.state ? '#f1f5f9' : 'white', appearance: 'auto' }}
                  >
                    <option value="">Select District</option>
                    {availableDistricts.map(district => (
                      <option key={district.id} value={district.name}>{district.name}</option>
                    ))}
                  </select>
                </div>
                <div style={{ flex: '1 1 100%', minWidth: '200px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#475569' }}>Pincode *</label>
                  <input type="text" value={formData.pincode} onChange={e => setFormData({...formData, pincode: e.target.value})} required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} />
                </div>
              </div>

              {/* Medical Details */}
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: '12px 0 0 0', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>Medical Details</h3>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#475569' }}>Primary Problem / Issue *</label>
                <textarea rows={3} value={formData.problem} onChange={e => setFormData({...formData, problem: e.target.value})} required placeholder="Please describe your health issue briefly..." style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}></textarea>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#475569' }}>Previous Medication (Optional)</label>
                <textarea rows={2} value={formData.previousMedication} onChange={e => setFormData({...formData, previousMedication: e.target.value})} placeholder="List any medications you are currently taking..." style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}></textarea>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#475569' }}>Medical Reports (Optional)</label>
                <div style={{ padding: '24px', border: '2px dashed #cbd5e1', borderRadius: '8px', textAlign: 'center', background: '#f8fafc' }}>
                  <input type="file" id="reportFile" style={{ display: 'none' }} />
                  <label htmlFor="reportFile" style={{ display: 'inline-block', padding: '10px 20px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, color: '#475569' }}>Choose File</label>
                  <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>Upload PDF, JPG, or PNG (Max 5MB)</p>
                </div>
              </div>

              <div style={{ marginTop: '24px', borderTop: '1px solid #e2e8f0', paddingTop: '24px' }}>
                <button type="submit" disabled={submitting} style={{ width: '100%', padding: '16px', background: '#2563eb', color: 'white', borderRadius: '8px', border: 'none', fontWeight: 700, fontSize: '16px', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(37,99,235,0.3)' }}>
                  {submitting ? 'Submitting Request...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
