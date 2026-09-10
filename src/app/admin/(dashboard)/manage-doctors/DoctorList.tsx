'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DoctorList({ initialDoctors }: { initialDoctors: any[] }) {
  const [doctors, setDoctors] = useState(initialDoctors);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({ name: '', type: '', phone: '' });
  const router = useRouter();

  const handleOpenModal = (doctor: any = null) => {
    if (doctor) {
      setEditingDoctor(doctor);
      setFormData({ name: doctor.name, type: doctor.type, phone: doctor.phone || '' });
    } else {
      setEditingDoctor(null);
      setFormData({ name: '', type: '', phone: '' });
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
              <th style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', fontWeight: 600, borderRadius: '8px 0 0 8px', minWidth: '150px' }}>Name</th>
              <th style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', fontWeight: 600, minWidth: '120px' }}>Type</th>
              <th style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', fontWeight: 600, minWidth: '150px' }}>Phone</th>
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
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={() => handleOpenModal(doctor)} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: '14px', fontWeight: 500 }}>Edit</button>
                    <button onClick={() => handleDelete(doctor.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '14px', fontWeight: 500 }}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {doctors.length === 0 && (
              <tr>
                <td colSpan={4} style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
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
