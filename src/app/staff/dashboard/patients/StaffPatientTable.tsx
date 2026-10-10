'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function StaffPatientTable({ 
  patients, 
  fieldAccess, 
  canAdd,
  canEdit, 
  canDelete 
}: { 
  patients: any[]; 
  fieldAccess: any; 
  canAdd?: boolean;
  canEdit: boolean; 
  canDelete: boolean;
}) {
  const router = useRouter();
  const [editingPatient, setEditingPatient] = useState<any>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [familyMembers, setFamilyMembers] = useState<any[]>([]);
  const [phoneMessage, setPhoneMessage] = useState('');
  const [formError, setFormError] = useState('');

  const handlePhoneChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const phone = e.target.value.trim();
    if (phone.length >= 10) {
      try {
        const res = await fetch(`/api/patients/by-phone?phone=${encodeURIComponent(phone)}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setFamilyMembers(data);
            setPhoneMessage(`Found ${data.length} existing patient(s) with this number. Please verify if you intend to add a new family member.`);
          } else {
            setFamilyMembers([]);
            setPhoneMessage('');
          }
        }
      } catch (err) {
        setFamilyMembers([]);
      }
    } else {
      setFamilyMembers([]);
      setPhoneMessage('');
    }
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const form = e.target as HTMLFormElement;
    
    // Build payload
    const payload: any = { id: editingPatient.id };
    const elements = form.elements as any;
    if (elements.name) payload.name = elements.name.value;
    if (elements.phone) payload.phone = elements.phone.value;
    if (elements.address) payload.address = elements.address.value;
    if (elements.medicalHistory) payload.medicalHistory = elements.medicalHistory.value;

    try {
      const res = await fetch('/api/admin/patients', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        window.location.reload();
      } else {
        const data = await res.json();
        alert('Error updating patient: ' + (data.error || 'Unknown error'));
        setIsSubmitting(false);
      }
    } catch (error) {
      alert('Network error while updating patient.');
      setIsSubmitting(false);
    }
  };
  
  const handleAddSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    try {
      const res = await fetch('/api/admin/patients', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        // We use window.location.reload() to guarantee a hard fresh fetch
        // bypassing Next.js aggressive client cache for this demo
        window.location.reload(); 
      } else {
        const data = await res.json();
        alert('Error adding patient: ' + (data.error || 'Unknown error'));
        setIsSubmitting(false);
      }
    } catch (error) {
      alert('Network error while adding patient.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Header and Add Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px', padding: '24px 24px 0' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0, color: '#0f172a' }}>Patients Database</h1>
        
        {/* Action Security Check: Only show ADD button if they have permission! */}
        {canAdd && (
          <button 
            onClick={() => setIsAdding(true)}
            style={{ background: '#2563eb', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
            + Add Patient
          </button>
        )}
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
            <th style={{ padding: '16px', fontSize: '12px', color: '#64748b', fontWeight: 600 }}>UHID</th>
            <th style={{ padding: '16px', fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Name</th>
            <th style={{ padding: '16px', fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Phone</th>
            <th style={{ padding: '16px', fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Address</th>
            {fieldAccess.medicalHistory !== false && (
              <th style={{ padding: '16px', fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Medical History</th>
            )}
            <th style={{ padding: '16px', fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {patients.length === 0 ? (
            <tr>
              <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>No patients found</td>
            </tr>
          ) : patients.map(patient => (
            <tr key={patient.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
              <td style={{ padding: '16px', fontSize: '14px', color: '#334155' }}>{patient.uhid || '-'}</td>
              <td style={{ padding: '16px', fontSize: '14px', fontWeight: 500, color: '#0f172a' }}>
                {patient.name === undefined ? <span style={{color:'#ef4444', fontWeight: 700}}>Blocked</span> : (patient.name && patient.name.trim().length > 0 ? patient.name.trim() : <span style={{color:'#94a3b8', fontStyle:'italic'}}>[No Name]</span>)}
              </td>
              <td style={{ padding: '16px', fontSize: '14px', color: '#334155' }}>
                {patient.phone === undefined ? <span style={{color:'#ef4444', fontWeight: 700}}>Blocked</span> : (patient.phone && patient.phone.trim().length > 0 ? patient.phone.trim() : <span style={{color:'#94a3b8', fontStyle:'italic'}}>[No Phone]</span>)}
              </td>
              <td style={{ padding: '16px', fontSize: '14px', color: '#334155' }}>
                {patient.address === undefined ? <span style={{color:'#ef4444', fontWeight: 700}}>Blocked</span> : (patient.address && patient.address.trim().length > 0 ? patient.address.trim() : <span style={{color:'#94a3b8', fontStyle:'italic'}}>[No Address]</span>)}
              </td>
              {fieldAccess.medicalHistory !== false && (
                <td style={{ padding: '16px', fontSize: '14px', color: '#334155' }}>{patient.medicalHistory}</td>
              )}
              <td style={{ padding: '16px' }}>
                {canEdit && (
                  <button 
                    onClick={() => setEditingPatient(patient)}
                    style={{ marginRight: '8px', padding: '4px 8px', fontSize: '12px', border: '1px solid #cbd5e1', background: 'white', borderRadius: '4px', cursor: 'pointer' }}>
                    Edit
                  </button>
                )}
                {canDelete && (
                  <button style={{ padding: '4px 8px', fontSize: '12px', border: '1px solid #fecaca', background: '#fef2f2', color: '#ef4444', borderRadius: '4px', cursor: 'pointer' }}>
                    Delete
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Edit Modal Popup */}
      {editingPatient && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'white', padding: '24px', borderRadius: '8px', width: '400px', maxWidth: '90%' }}>
            <h3 style={{ marginTop: 0, marginBottom: '16px', color: '#0f172a' }}>Edit Patient</h3>
            <form onSubmit={handleEditSave}>
              {fieldAccess.patientName !== false && (
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Name</label>
                  <input name="name" type="text" defaultValue={editingPatient.name} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', color: 'black' }} />
                </div>
              )}
              {fieldAccess.mobileNumber !== false && (
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Phone</label>
                  <input name="phone" type="text" defaultValue={editingPatient.phone} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', color: 'black' }} />
                </div>
              )}
              {fieldAccess.address !== false && (
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Address</label>
                  <input name="address" type="text" defaultValue={editingPatient.address} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', color: 'black' }} />
                </div>
              )}
              {fieldAccess.medicalHistory !== false && (
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Medical History</label>
                  <input name="medicalHistory" type="text" defaultValue={editingPatient.medicalHistory} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', color: 'black' }} />
                </div>
              )}
              
              <div style={{ display: 'flex', gap: '8px', marginTop: '24px' }}>
                <button type="button" onClick={() => setEditingPatient(null)} disabled={isSubmitting} style={{ flex: 1, padding: '8px', border: '1px solid #cbd5e1', background: 'white', borderRadius: '4px', cursor: 'pointer', color: 'black' }}>Cancel</button>
                <button type="submit" disabled={isSubmitting} style={{ flex: 1, padding: '8px', border: 'none', background: '#dc2626', color: 'white', borderRadius: '4px', cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1 }}>
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Add Modal Popup */}
      {isAdding && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'white', padding: '24px', borderRadius: '8px', width: '400px', maxWidth: '90%' }}>
            <h3 style={{ marginTop: 0, marginBottom: '16px', color: '#0f172a' }}>Add Patient (Staff Mode)</h3>
            <form onSubmit={handleAddSave}>
              {fieldAccess.mobileNumber !== false && (
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Phone</label>
                  <input name="phone" type="text" onChange={handlePhoneChange} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', color: 'black' }} required />
                  {phoneMessage && (
                    <div style={{ marginTop: '8px', padding: '8px', backgroundColor: '#e0f2fe', color: '#0369a1', fontSize: '12px', borderRadius: '4px', border: '1px solid #bae6fd' }}>
                      <strong>Note:</strong> {phoneMessage}
                    </div>
                  )}
                  {familyMembers.length > 0 && (
                    <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {familyMembers.map((m, i) => (
                        <span key={i} style={{ fontSize: '11px', background: '#f1f5f9', padding: '4px 8px', borderRadius: '12px', border: '1px solid #cbd5e1', color: '#475569' }}>
                          {m.name} ({m.uhid || 'No UHID'})
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {fieldAccess.patientName !== false && (
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Name</label>
                  <input name="name" type="text" style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', color: 'black' }} required />
                </div>
              )}
              {fieldAccess.address !== false && (
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Address</label>
                  <input name="address" type="text" style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', color: 'black' }} />
                </div>
              )}
              {fieldAccess.medicalHistory !== false && (
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Medical History</label>
                  <input name="medicalHistory" type="text" style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', color: 'black' }} />
                </div>
              )}
              
              <div style={{ display: 'flex', gap: '8px', marginTop: '24px' }}>
                <button type="button" onClick={() => setIsAdding(false)} disabled={isSubmitting} style={{ flex: 1, padding: '8px', border: '1px solid #cbd5e1', background: 'white', borderRadius: '4px', cursor: 'pointer', color: 'black' }}>Cancel</button>
                <button type="submit" disabled={isSubmitting} style={{ flex: 1, padding: '8px', border: 'none', background: '#dc2626', color: 'white', borderRadius: '4px', cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1 }}>
                  {isSubmitting ? 'Adding...' : 'Add Patient'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
