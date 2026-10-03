'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DoctorList({ initialDoctors }: { initialDoctors: any[] }) {
  const [doctors, setDoctors] = useState(initialDoctors);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({ name: '', type: '', phone: '', email: '', password: '', qualification: '', speciality: '', medicalCouncilReg: '', signature: '' });
  const router = useRouter();

  const handleOpenModal = (doctor: any = null) => {
    if (doctor) {
      setEditingDoctor(doctor);
      setFormData({ name: doctor.name, type: doctor.type, phone: doctor.phone || '', email: doctor.email || '', password: doctor.password || '', qualification: doctor.qualification || '', speciality: doctor.speciality || '', medicalCouncilReg: doctor.medicalCouncilReg || '', signature: doctor.signature || '' });
    } else {
      setEditingDoctor(null);
      setFormData({ name: '', type: '', phone: '', email: '', password: '', qualification: '', speciality: '', medicalCouncilReg: '', signature: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const url = editingDoctor 
        ? `/api/admin/doctors/${editingDoctor.id}` 
        : '/api/admin/doctors';
        
      const res = await fetch(url, {
        method: editingDoctor ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (!res.ok) throw new Error('Failed to save doctor');
      
      const savedDoctor = await res.json();
      
      if (editingDoctor) {
        setDoctors(doctors.map(d => d.id === savedDoctor.id ? savedDoctor : d));
      } else {
        setDoctors([savedDoctor, ...doctors]);
      }
      
      setIsModalOpen(false);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert('Error saving doctor');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this doctor?')) return;
    
    try {
      const res = await fetch(`/api/admin/doctors/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete doctor');
      
      setDoctors(doctors.filter(d => d.id !== id));
      router.refresh();
    } catch (error) {
      console.error(error);
      alert('Error deleting doctor');
    }
  };

  return (
    <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1a202c', margin: '0 0 8px 0' }}>Manage Doctors</h1>
          <p style={{ color: '#64748b', margin: 0, fontSize: '15px' }}>
            Add, edit, or remove Consultants and Dieticians.
          </p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          style={{ background: '#2563eb', color: 'white', padding: '10px 20px', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap', flexShrink: 0 }}
        >
          <span>+ Add New Doctor</span>
        </button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8fafc', color: '#64748b', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <th style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', fontWeight: 600, minWidth: '150px' }}>Name</th>
              <th style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', fontWeight: 600, minWidth: '120px' }}>Type</th>
              <th style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', fontWeight: 600, minWidth: '130px' }}>Phone</th>
              <th style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', fontWeight: 600, minWidth: '280px' }}>Login Details</th>
              <th style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', fontWeight: 600, borderRadius: '0 8px 8px 0', minWidth: '120px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {doctors.map(doctor => (
              <tr key={doctor.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '16px', color: '#1e293b', fontWeight: 500, whiteSpace: 'nowrap' }}>{doctor.name}</td>
                <td style={{ padding: '16px' }}>
                  <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600, background: doctor.type === 'CONSULTANT' ? '#e0f2fe' : '#dcfce3', color: doctor.type === 'CONSULTANT' ? '#0369a1' : '#166534' }}>
                    {doctor.type}
                  </span>
                </td>
                <td style={{ padding: '16px', color: '#475569' }}>{doctor.phone || '-'}</td>
                <td style={{ padding: '16px' }}>
                  {doctor.email ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', background: 'linear-gradient(to right, #f8fafc, #ffffff)', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em', width: '16px' }}>U:</span>
                          <span style={{ color: '#0f172a', fontSize: '13px', fontWeight: 500 }}>{doctor.email}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em', width: '16px' }}>P:</span>
                          <span style={{ color: '#0f172a', fontSize: '13px', fontWeight: 500 }}>{doctor.password || <span style={{ color: '#ef4444', fontStyle: 'italic', fontSize: '12px' }}>Not Set</span>}</span>
                        </div>
                        <div style={{ marginTop: '2px' }}>
                          <a href="/admin/login" target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', fontSize: '11px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            Open Login Portal
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                          </a>
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
                          const text = `Doctor Portal Login\nURL: ${baseUrl}/admin/login\nUsername: ${doctor.email}\nPassword: ${doctor.password || 'Not Set'}`;
                          navigator.clipboard.writeText(text); 
                          alert('Login details copied!');
                        }} 
                        style={{ background: '#eff6ff', border: '1px solid #bfdbfe', cursor: 'pointer', color: '#2563eb', padding: '8px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', flexShrink: 0 }} 
                        title="Copy All Login Details"
                        onMouseOver={(e) => e.currentTarget.style.background = '#dbeafe'}
                        onMouseOut={(e) => e.currentTarget.style.background = '#eff6ff'}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                      </button>
                    </div>
                  ) : (
                    <span style={{ color: '#94a3b8', fontSize: '13px', fontStyle: 'italic' }}>No Login Configured</span>
                  )}
                </td>
                <td style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={() => handleOpenModal(doctor)} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: '14px', fontWeight: 500 }}>Edit</button>
                    <button onClick={() => handleDelete(doctor.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '14px', fontWeight: 500 }}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {doctors.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
                  No doctors found. Click "Add New Doctor" to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: '12px', width: '100%', maxWidth: '500px' }}>
            <h2 style={{ margin: '0 0 24px 0', fontSize: '24px', color: '#1e293b' }}>
              {editingDoctor ? 'Edit Doctor' : 'Add New Doctor'}
            </h2>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#475569' }}>Name *</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required 
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} 
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#475569' }}>Type *</label>
                <select 
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  required 
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                >
                  <option value="">Select Type</option>
                  <option value="CONSULTANT">Consultant</option>
                  <option value="DIETICIAN">Dietician</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#475569' }}>Phone Number</label>
                <input 
                  type="tel" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} 
                />
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#475569' }}>Qualification</label>
                  <input 
                    type="text" 
                    value={formData.qualification}
                    onChange={(e) => setFormData({...formData, qualification: e.target.value})}
                    placeholder="e.g. MBBS, MD"
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} 
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#475569' }}>Speciality</label>
                  <input 
                    type="text" 
                    value={formData.speciality}
                    onChange={(e) => setFormData({...formData, speciality: e.target.value})}
                    placeholder="e.g. General Physician"
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} 
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#475569' }}>Medical Council Reg. No.</label>
                  <input 
                    type="text" 
                    value={formData.medicalCouncilReg}
                    onChange={(e) => setFormData({...formData, medicalCouncilReg: e.target.value})}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} 
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#475569' }}>Digital Signature (Initials)</label>
                  <input 
                    type="text" 
                    value={formData.signature}
                    onChange={(e) => setFormData({...formData, signature: e.target.value})}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} 
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#475569' }}>Email (Username for Login)</label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} 
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#475569' }}>Dashboard Password</label>
                <input 
                  type="text" 
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="Set a password for the doctor"
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} 
                />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', color: '#475569', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={isSubmitting} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#2563eb', color: 'white', fontWeight: 600, cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1 }}>
                  {isSubmitting ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
