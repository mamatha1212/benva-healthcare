'use client';

import React, { useState, useEffect } from 'react';

export default function CorporateClient() {
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ companyName: '', hrName: '', hrEmail: '', hrPhone: '', address: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      const res = await fetch('/api/admin/corporate/organizations');
      const data = await res.json();
      if (Array.isArray(data)) setOrganizations(data);
    } catch (err) {
      console.error('Failed to fetch organizations:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/corporate/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowAddModal(false);
        setFormData({ companyName: '', hrName: '', hrEmail: '', hrPhone: '', address: '' });
        fetchOrganizations();
      } else {
        alert('Failed to add organization');
      }
    } catch (err) {
      console.error(err);
    }
    setSubmitting(false);
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>Corporate Family Doctor Program</h1>
          <p style={{ margin: '4px 0 0 0', color: '#64748b' }}>Manage enrolled companies and their employees.</p>
        </div>
        <button onClick={() => setShowAddModal(true)} style={{ background: '#2563eb', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
          + Add Company
        </button>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: '#f8fafc' }}>
            <tr>
              <th style={{ padding: '16px', fontSize: '13px', color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>Company Name</th>
              <th style={{ padding: '16px', fontSize: '13px', color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>HR Contact</th>
              <th style={{ padding: '16px', fontSize: '13px', color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>Status</th>
              <th style={{ padding: '16px', fontSize: '13px', color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>Employees Enrolled</th>
            </tr>
          </thead>
          <tbody>
            {organizations.length > 0 ? organizations.map((org) => (
              <tr key={org.id}>
                <td style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', fontWeight: 600, color: '#0f172a' }}>{org.companyName}</td>
                <td style={{ padding: '16px', borderBottom: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '14px', color: '#334155' }}>{org.hrName}</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>{org.hrPhone} | {org.hrEmail}</div>
                </td>
                <td style={{ padding: '16px', borderBottom: '1px solid #e2e8f0' }}>
                  <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600, background: org.status === 'ACTIVE' ? '#dcfce7' : '#fef9c3', color: org.status === 'ACTIVE' ? '#166534' : '#854d0e' }}>
                    {org.status}
                  </span>
                </td>
                <td style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', color: '#334155' }}>
                  {org.employees?.length || 0} Employees
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={4} style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>No organizations enrolled yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: '16px', width: '100%', maxWidth: '500px', color: '#0f172a' }}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '20px', color: '#0f172a' }}>Add New Corporate Client</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>Company Name</label>
                <input type="text" value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#0f172a', background: 'white', outline: 'none' }} />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>HR/Admin Name</label>
                  <input type="text" value={formData.hrName} onChange={e => setFormData({...formData, hrName: e.target.value})} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#0f172a', background: 'white', outline: 'none' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>HR Phone</label>
                  <input type="text" value={formData.hrPhone} onChange={e => setFormData({...formData, hrPhone: e.target.value})} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#0f172a', background: 'white', outline: 'none' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>HR Email</label>
                <input type="email" value={formData.hrEmail} onChange={e => setFormData({...formData, hrEmail: e.target.value})} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#0f172a', background: 'white', outline: 'none' }} />
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button type="button" onClick={() => setShowAddModal(false)} style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', color: '#475569', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
                <button type="submit" disabled={submitting} style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: '#2563eb', color: 'white', cursor: 'pointer', fontWeight: 600 }}>{submitting ? 'Saving...' : 'Add Company'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
