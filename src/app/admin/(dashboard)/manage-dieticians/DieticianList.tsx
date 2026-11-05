'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DieticianList({ initialDieticians }: { initialDieticians: any[] }) {
  const [dieticians, setDieticians] = useState(initialDieticians);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDietician, setEditingDietician] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    type: 'DIETICIAN',
    phone: '',
    email: '',
    password: '',
    qualification: '',
    speciality: '',
    medicalCouncilReg: '',
    signature: ''
  });

  const router = useRouter();

  const handleOpenModal = (dietician: any = null) => {
    if (dietician) {
      setEditingDietician(dietician);
      setFormData({
        name: dietician.name,
        type: 'DIETICIAN',
        phone: dietician.phone || '',
        email: dietician.email || '',
        password: dietician.password || '',
        qualification: dietician.qualification || '',
        speciality: dietician.speciality || '',
        medicalCouncilReg: dietician.medicalCouncilReg || '',
        signature: dietician.signature || ''
      });
    } else {
      setEditingDietician(null);
      setFormData({
        name: '',
        type: 'DIETICIAN',
        phone: '',
        email: '',
        password: '',
        qualification: '',
        speciality: '',
        medicalCouncilReg: '',
        signature: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = editingDietician
        ? `/api/admin/doctors/${editingDietician.id}`
        : '/api/admin/doctors';

      const res = await fetch(url, {
        method: editingDietician ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, type: 'DIETICIAN' })
      });

      if (!res.ok) throw new Error('Failed to save dietician');

      const savedDietician = await res.json();

      if (editingDietician) {
        setDieticians(dieticians.map(d => d.id === savedDietician.id ? savedDietician : d));
      } else {
        setDieticians([savedDietician, ...dieticians]);
      }

      setIsModalOpen(false);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert('Error saving dietician');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this dietician?')) return;

    try {
      const res = await fetch(`/api/admin/doctors/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete dietician');

      setDieticians(dieticians.filter(d => d.id !== id));
      router.refresh();
    } catch (error) {
      console.error(error);
      alert('Error deleting dietician');
    }
  };

  return (
    <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1a202c', margin: '0 0 8px 0' }}>Manage Dieticians</h1>
          <p style={{ color: '#64748b', margin: 0, fontSize: '15px' }}>
            Add, edit, or configure login accounts for Dieticians, Clinical Nutritionists, and Lifestyle Counselors.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          style={{ background: '#059669', color: 'white', padding: '10px 20px', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap', flexShrink: 0, boxShadow: '0 2px 4px rgba(5,150,105,0.25)' }}
        >
          <span>+ Add New Dietician</span>
        </button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8fafc', color: '#64748b', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <th style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', fontWeight: 600, minWidth: '180px' }}>Dietitian Name</th>
              <th style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', fontWeight: 600, minWidth: '150px' }}>Speciality / Qualification</th>
              <th style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', fontWeight: 600, minWidth: '130px' }}>Phone</th>
              <th style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', fontWeight: 600, minWidth: '280px' }}>Login Details</th>
              <th style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', fontWeight: 600, borderRadius: '0 8px 8px 0', minWidth: '120px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {dieticians.map(dietician => (
              <tr key={dietician.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '16px', whiteSpace: 'nowrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, background: '#dcfce7', color: '#15803d' }}>
                      DIETITIAN
                    </span>
                    <strong style={{ color: '#0f172a', fontSize: '15px' }}>{dietician.name}</strong>
                  </div>
                  {dietician.medicalCouncilReg && (
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                      Reg: {dietician.medicalCouncilReg}
                    </div>
                  )}
                </td>
                <td style={{ padding: '16px' }}>
                  <div style={{ fontWeight: 600, color: '#334155', fontSize: '13px' }}>
                    {dietician.speciality || 'General Clinical Nutrition'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>
                    {dietician.qualification || '-'}
                  </div>
                </td>
                <td style={{ padding: '16px', color: '#475569' }}>{dietician.phone || '-'}</td>
                <td style={{ padding: '16px' }}>
                  {dietician.email ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', background: 'linear-gradient(to right, #f8fafc, #ffffff)', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em', width: '16px' }}>U:</span>
                          <span style={{ color: '#0f172a', fontSize: '13px', fontWeight: 500 }}>{dietician.email}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em', width: '16px' }}>P:</span>
                          <span style={{ color: '#0f172a', fontSize: '13px', fontWeight: 500 }}>{dietician.password || <span style={{ color: '#ef4444', fontStyle: 'italic', fontSize: '12px' }}>Not Set</span>}</span>
                        </div>
                        <div style={{ marginTop: '2px' }}>
                          <a href="/admin/login" target="_blank" rel="noopener noreferrer" style={{ color: '#059669', fontSize: '11px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                            Open Login Portal
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                          </a>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
                          const text = `Dietitian Portal Login\nURL: ${baseUrl}/admin/login\nUsername: ${dietician.email}\nPassword: ${dietician.password || 'Not Set'}`;
                          navigator.clipboard.writeText(text).then(() => {
                            setCopiedId(dietician.id);
                            setTimeout(() => setCopiedId(null), 2000);
                          });
                        }}
                        style={{ background: copiedId === dietician.id ? '#dcfce7' : '#f0fdf4', border: `1px solid ${copiedId === dietician.id ? '#bbf7d0' : '#bbf7d0'}`, cursor: 'pointer', color: copiedId === dietician.id ? '#166534' : '#059669', padding: '8px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', flexShrink: 0 }}
                        title="Copy Login Details"
                      >
                        {copiedId === dietician.id ? (
                          <span style={{ fontSize: '11px', fontWeight: 'bold', padding: '0 4px' }}>Copied!</span>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                        )}
                      </button>
                    </div>
                  ) : (
                    <span style={{ color: '#94a3b8', fontSize: '13px', fontStyle: 'italic' }}>No Login Configured</span>
                  )}
                </td>
                <td style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={() => handleOpenModal(dietician)} style={{ background: 'none', border: 'none', color: '#059669', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}>Edit</button>
                    <button onClick={() => handleDelete(dietician.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '14px', fontWeight: 500 }}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {dieticians.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                  <div style={{ fontSize: '16px', fontWeight: 600, color: '#0f172a', marginBottom: '4px' }}>No dieticians configured yet</div>
                  <p style={{ margin: 0, fontSize: '14px' }}>Click "+ Add New Dietician" to create a login account for your dietitian.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: '12px', width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ margin: '0 0 8px 0', fontSize: '22px', color: '#1e293b' }}>
              {editingDietician ? 'Edit Dietician' : 'Add New Dietician'}
            </h2>
            <p style={{ margin: '0 0 20px 0', color: '#64748b', fontSize: '13px' }}>
              Configure clinical details and portal login credentials.
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>Dietitian Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Dt. Meghana"
                  required
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g. 9876543210"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '14px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>Qualification</label>
                  <input
                    type="text"
                    value={formData.qualification}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    placeholder="e.g. M.Sc. Clinical Nutrition, RD"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>Speciality / Focus</label>
                  <input
                    type="text"
                    value={formData.speciality}
                    onChange={(e) => setFormData({ ...formData, speciality: e.target.value })}
                    placeholder="e.g. PCOD, Weight Loss, Diabetes"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '14px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>Registration / License No.</label>
                  <input
                    type="text"
                    value={formData.medicalCouncilReg}
                    onChange={(e) => setFormData({ ...formData, medicalCouncilReg: e.target.value })}
                    placeholder="e.g. IDA/2022/1234"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>Digital Signature (Initials)</label>
                  <input
                    type="text"
                    value={formData.signature}
                    onChange={(e) => setFormData({ ...formData, signature: e.target.value })}
                    placeholder="e.g. Meghana"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                  />
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#059669', textTransform: 'uppercase' }}>
                  🔑 Portal Login Credentials
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>Email (Login Username) *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. dietician.meghana@benva.in"
                    required
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', background: 'white' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>Password *</label>
                  <input
                    type="text"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Enter login password"
                    required
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', background: 'white' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{ padding: '10px 22px', borderRadius: '8px', border: 'none', background: '#059669', color: 'white', fontWeight: 600, cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
                >
                  {isSubmitting ? 'Saving...' : 'Save Dietician'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

