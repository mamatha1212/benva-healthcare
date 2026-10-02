'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DoctorPatientsClient({ initialPatients, doctorName }: { initialPatients: any[], doctorName: string }) {
  const [patients, setPatients] = useState(initialPatients);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', age: '', gender: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [formError, setFormError] = useState('');
  const [familyMembers, setFamilyMembers] = useState<any[]>([]);
  const submitActionRef = React.useRef<'save' | 'save-and-add'>('save');
  
  const router = useRouter();

  const handleOpenModal = (patient: any = null) => {
    if (patient) {
      setEditingPatient(patient);
      setFormData({ name: patient.name, phone: patient.phone, age: patient.age || '', gender: patient.gender || '' });
    } else {
      setEditingPatient(null);
      setFormData({ name: '', phone: '', age: '', gender: '' });
    }
    setFormError('');
    setFamilyMembers([]);
    setIsModalOpen(true);
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError('');
    
    try {
      const url = editingPatient ? `/api/doctor/patients/${editingPatient.id}` : '/api/doctor/patients';
      const method = editingPatient ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, consultant: doctorName })
      });
      if (!res.ok) {
        let errMsg = 'Failed to save patient';
        try {
          const errData = await res.json();
          if (errData.error) errMsg = errData.error;
        } catch (e) {}
        throw new Error(errMsg);
      }
      
      const savedPatient = await res.json();
      
      if (editingPatient) {
        setPatients(patients.map(p => p.id === savedPatient.id ? savedPatient : p));
      } else {
        setPatients(prev => [savedPatient, ...prev]);
      }
      
      if (submitActionRef.current === 'save-and-add') {
        // Keep phone, clear others
        setFormData(prev => ({ ...prev, name: '', age: '', gender: '' }));
        // Also refresh family members list
        fetch(`/api/patients/by-phone?phone=${encodeURIComponent(formData.phone)}`)
          .then(res => res.ok ? res.json() : [])
          .then(data => { if(data && data.length > 0) setFamilyMembers(data); })
          .catch(() => {});
        setFormError('Patient saved. You can add another family member.');
      } else {
        setIsModalOpen(false);
      }
    } catch (error: any) {
      console.error(error);
      setFormError(error.message || 'Error saving patient');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.phone.includes(searchTerm) ||
    (p.uhid && p.uhid.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getPrimaryName = (phone: string, currentId: string) => {
    const family = patients.filter((p: any) => p.phone === phone);
    if (family.length <= 1) return null;
    const primary = [...family].sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())[0];
    if (primary.id === currentId) return null; // don't show for the primary themselves
    return primary.name;
  };

  return (
    <div>
      <style>{`
        .patient-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }
        .patient-table th {
          padding: 16px 24px;
          background: #02559d;
          color: white;
          font-size: 13px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 2px solid #013b6e;
        }
        .patient-table th:first-child {
          border-top-left-radius: 12px;
        }
        .patient-table th:last-child {
          border-top-right-radius: 12px;
        }
        .patient-row {
          border-bottom: 1px solid #e2e8f0;
          transition: all 0.2s ease;
        }
        .patient-row:hover {
          background-color: #f0f7ff;
        }
        .patient-row td {
          padding: 16px 24px;
          color: #475569;
          font-size: 14px;
        }
        .action-btn {
          background: #f1f5f9;
          border: none;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          color: #475569;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .action-btn:hover {
          background: #e2e8f0;
          color: #0f172a;
        }
        .action-btn.edit {
          color: #02559d;
          background: #e6f0fa;
        }
        .action-btn.edit:hover {
          background: #cce0f5;
        }
        .action-btn.prescribe {
          background: #02559d;
          color: white;
          display: flex;
          align-items: center;
          gap: 4px;
          box-shadow: 0 2px 4px rgba(2, 85, 157, 0.2);
        }
        .action-btn.prescribe:hover {
          background: #013b6e;
          transform: translateY(-1px);
          box-shadow: 0 4px 6px rgba(2, 85, 157, 0.3);
        }
        .add-patient-btn {
          background: linear-gradient(135deg, #02559d 0%, #013b6e 100%);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 4px 12px rgba(2, 85, 157, 0.25);
          transition: all 0.2s ease;
        }
        .add-patient-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(2, 85, 157, 0.35);
        }
        .search-input:focus {
          outline: none;
          border-color: #02559d !important;
          box-shadow: 0 0 0 3px rgba(2, 85, 157, 0.1);
        }
      `}</style>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>My Patients</h1>
          <p style={{ color: '#64748b', margin: 0, fontSize: '15px' }}>View and manage your assigned patients and consultation history.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', width: '100%' }}>
          <div style={{ position: 'relative', flex: '1 1 min(100%, 300px)' }}>
            <input 
              type="text" 
              className="search-input"
              placeholder="Search patients by name, phone, or UHID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ padding: '12px 16px 12px 42px', borderRadius: '8px', border: '1px solid #cbd5e1', width: '100%', fontSize: '14px', transition: 'all 0.2s' }}
            />
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '18px', height: '18px', color: '#94a3b8' }}>
              <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
          <button onClick={() => handleOpenModal()} className="add-patient-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px' }}><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Add New Patient
          </button>
        </div>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflowX: 'auto', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
        <table className="patient-table">
          <thead>
            <tr>
              <th style={{ width: '60px', textAlign: 'center' }}>S.No</th>
              <th>Patient Details</th>
              <th>Contact</th>
              <th>Demographics</th>
              <th>Added On</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.map((patient: any, index: number) => {
              const primaryName = getPrimaryName(patient.phone, patient.id);
              return (
                <tr key={patient.id} className="patient-row">
                  <td style={{ textAlign: 'center', fontWeight: '600', color: '#94a3b8' }}>{index + 1}</td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '15px' }}>{patient.name}</div>
                    {patient.uhid && <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', display: 'inline-block', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontWeight: 500 }}>{patient.uhid}</div>}
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                        {patient.phone}
                      </div>
                      {primaryName && (
                        <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>
                          Primary: {primaryName}
                        </div>
                      )}
                    </div>
                  </td>
                <td>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#f8fafc', padding: '4px 10px', borderRadius: '20px', border: '1px solid #e2e8f0', fontSize: '13px' }}>
                    <span style={{ fontWeight: 600, color: '#334155' }}>{patient.age ? `${patient.age} Yrs` : '-'}</span>
                    <span style={{ color: '#cbd5e1' }}>|</span>
                    <span style={{ color: '#475569' }}>{patient.gender || '-'}</span>
                  </div>
                </td>
                <td suppressHydrationWarning>
                  <div style={{ fontSize: '13px', color: '#64748b' }}>
                    {new Date(patient.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </div>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <button onClick={() => router.push(`/doctor/patients/${patient.id}`)} className="action-btn">View</button>
                    <button onClick={() => handleOpenModal(patient)} className="action-btn edit">Edit</button>
                    <button onClick={() => router.push(`/doctor/patients/${patient.id}`)} className="action-btn prescribe">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>
                      Prescriptions
                    </button>
                  </div>
                </td>
              </tr>
              );
            })}
            {filteredPatients.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '64px 24px', textAlign: 'center' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '80px', height: '80px', borderRadius: '50%', background: '#f0f7ff', color: '#02559d', marginBottom: '16px' }}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                  </div>
                  <h3 style={{ color: '#0f172a', fontSize: '18px', fontWeight: 600, margin: '0 0 8px 0' }}>No Patients Found</h3>
                  <p style={{ color: '#64748b', margin: 0, maxWidth: '350px', marginLeft: 'auto', marginRight: 'auto', lineHeight: '1.5' }}>
                    {searchTerm ? 'No patients match your search criteria. Try a different term or clear the search.' : 'You currently have no patients assigned to you. Click "Add New Patient" to get started.'}
                  </p>
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
              {editingPatient ? 'Edit Patient' : 'Add New Patient'}
            </h2>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {formError && (
                <div style={{ backgroundColor: '#fee2e2', color: '#ef4444', padding: '12px', borderRadius: '8px', fontSize: '14px', fontWeight: 500 }}>
                  {formError}
                </div>
              )}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#475569' }}>Phone Number *</label>
                <input 
                  type="tel" 
                  value={formData.phone}
                  onChange={(e) => {
                    const newPhone = e.target.value;
                    setFormData({...formData, phone: newPhone});
                    
                    if (newPhone.trim().length >= 10 && !editingPatient) {
                      const phone = newPhone.trim();
                      fetch(`/api/patients/by-phone?phone=${encodeURIComponent(phone)}`)
                        .then(res => res.ok ? res.json() : [])
                        .then((data: any[]) => {
                          if (data && data.length > 0) {
                            setFamilyMembers(data);
                            const primary = data[0];
                            setFormData(prev => ({
                              ...prev,
                              name: prev.name || primary.name,
                              age: prev.age || primary.age,
                              gender: prev.gender || primary.gender
                            }));
                            setFormError(`Found ${data.length} family member(s) with this number. Auto-filled primary member.`);
                          } else {
                            setFamilyMembers([]);
                          }
                        })
                        .catch(() => { setFamilyMembers([]); });
                    } else if (newPhone.trim().length < 10) {
                      setFamilyMembers([]);
                    }
                  }}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} 
                />
              </div>

              {familyMembers.length > 0 && (
                <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>Select Family Member or Add New:</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {familyMembers.map((member, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, name: member.name, age: member.age, gender: member.gender }));
                          setFormError(`Selected ${member.name} (UHID: ${member.uhid || 'Pending'}).`);
                        }}
                        style={{ padding: '6px 12px', borderRadius: '16px', border: '1px solid #cbd5e1', background: formData.name === member.name ? '#0ea5e9' : 'white', color: formData.name === member.name ? 'white' : '#0f172a', fontSize: '13px', cursor: 'pointer' }}
                      >
                        {member.name}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, name: '', age: '', gender: '' }));
                        setFormError('');
                      }}
                      style={{ padding: '6px 12px', borderRadius: '16px', border: '1px dashed #3b82f6', background: '#eff6ff', color: '#1d4ed8', fontSize: '13px', cursor: 'pointer', fontWeight: 500 }}
                    >
                      + Add New Member
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#475569' }}>Patient Name *</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required 
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} 
                />
              </div>
              
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#475569' }}>Age</label>
                  <input 
                    type="number" 
                    value={formData.age}
                    onChange={(e) => setFormData({...formData, age: e.target.value})}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} 
                  />
                </div>
                
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#475569' }}>Gender</label>
                  <select 
                    value={formData.gender}
                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', color: '#475569', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                
                {!editingPatient && (
                  <button 
                    type="submit" 
                    onClick={() => { submitActionRef.current = 'save-and-add'; }}
                    disabled={isSubmitting} 
                    style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #3b82f6', background: 'white', color: '#3b82f6', fontWeight: 600, cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1 }}
                  >
                    {isSubmitting && submitActionRef.current === 'save-and-add' ? 'Saving...' : 'Save & Add Another'}
                  </button>
                )}

                <button 
                  type="submit" 
                  onClick={() => { submitActionRef.current = 'save'; }}
                  disabled={isSubmitting} 
                  style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#3b82f6', color: 'white', fontWeight: 600, cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1 }}
                >
                  {isSubmitting && submitActionRef.current === 'save' ? 'Saving...' : editingPatient ? 'Save Changes' : 'Save Patient'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
