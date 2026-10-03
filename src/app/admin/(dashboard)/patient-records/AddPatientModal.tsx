'use client';

import React, { useState, useRef } from 'react';

export default function AddPatientModal({ onClose, onAdded, doctors = [] }: { onClose: () => void, onAdded: (patient: any, action?: "save" | "save-and-add") => void, doctors?: any[] }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [familyMembers, setFamilyMembers] = useState<any[]>([]);
  const formRef = useRef<HTMLFormElement>(null);
  const submitActionRef = useRef<'save' | 'save-and-add'>('save');

  const [selectedName, setSelectedName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRef.current) return;
    
    setIsSubmitting(true);
    setFormError('');
    try {
      const formData = new FormData(formRef.current);
      const res = await fetch('/api/admin/patients', {
        method: 'POST',
        body: formData
      });
      
      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.error || 'Failed to add patient');
      }
      
      const newPatient = await res.json();
      
      onAdded(newPatient, submitActionRef.current);
      
      if (submitActionRef.current === 'save-and-add') {
        if (formRef.current) {
          const nameInput = formRef.current.elements.namedItem('name') as HTMLInputElement;
          const ageInput = formRef.current.elements.namedItem('age') as HTMLInputElement;
          const genderSelect = formRef.current.elements.namedItem('gender') as HTMLSelectElement;
          nameInput.value = '';
          ageInput.value = '';
          genderSelect.value = '';
          setSelectedName('');
          
          const phoneInput = formRef.current.elements.namedItem('phone') as HTMLInputElement;
          fetch(`/api/patients/by-phone?phone=${encodeURIComponent(phoneInput.value)}`)
            .then(res => res.ok ? res.json() : [])
            .then(data => { if(data && data.length > 0) setFamilyMembers(data); })
            .catch(() => {});
        }
        setFormError('Patient saved successfully. You can add another family member.');
      }
    } catch (error: any) {
      console.error(error);
      setFormError(error.message || 'Error adding patient');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: 'white', padding: '32px', borderRadius: '12px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ margin: 0, fontSize: '24px', color: '#1e293b' }}>Add New Patient Data (Live)</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#64748b' }}>&times;</button>
        </div>
        
        <form ref={formRef} onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {formError && (
            <div style={{ backgroundColor: '#fee2e2', color: '#ef4444', padding: '12px', borderRadius: '8px', fontSize: '14px', fontWeight: 500 }}>
              {formError}
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#475569' }}>Phone Number *</label>
              <input type="tel" name="phone" required onChange={(e) => {
                const newPhone = e.target.value.trim();
                if (newPhone.length >= 10 && formRef.current) {
                  fetch(`/api/patients/by-phone?phone=${encodeURIComponent(newPhone)}`)
                    .then(res => res.ok ? res.json() : [])
                    .then((data: any[]) => {
                      if (data && data.length > 0 && formRef.current) {
                        setFamilyMembers(data);
                        const primary = data[0];
                        const form = formRef.current;
                        const nameInput = form.elements.namedItem('name') as HTMLInputElement;
                        const ageInput = form.elements.namedItem('age') as HTMLInputElement;
                        const genderSelect = form.elements.namedItem('gender') as HTMLSelectElement;
                        
                        if (nameInput && !nameInput.value) { nameInput.value = primary.name; setSelectedName(primary.name); }
                        if (ageInput && !ageInput.value) ageInput.value = primary.age;
                        if (genderSelect && !genderSelect.value) genderSelect.value = primary.gender;
                        
                        setFormError(`Found ${data.length} family member(s) with this number. Auto-filled primary member.`);
                      } else {
                        setFamilyMembers([]);
                      }
                    })
                    .catch(() => { setFamilyMembers([]); });
                } else if (newPhone.length < 10) {
                  setFamilyMembers([]);
                }
              }} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
            </div>

            {familyMembers.length > 0 && (
              <div style={{ gridColumn: '1 / -1', backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>Select Family Member or Add New:</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {familyMembers.map((member, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        if (formRef.current) {
                          const form = formRef.current;
                          const nameInput = form.elements.namedItem('name') as HTMLInputElement;
                          const ageInput = form.elements.namedItem('age') as HTMLInputElement;
                          const genderSelect = form.elements.namedItem('gender') as HTMLSelectElement;
                          nameInput.value = member.name;
                          ageInput.value = member.age;
                          genderSelect.value = member.gender;
                          setSelectedName(member.name);
                        }
                        setFormError(`Selected ${member.name} (UHID: ${member.uhid || 'Pending'}).`);
                      }}
                      style={{ padding: '6px 12px', borderRadius: '16px', border: '1px solid #cbd5e1', background: selectedName === member.name ? '#0ea5e9' : 'white', color: selectedName === member.name ? 'white' : '#0f172a', fontSize: '13px', cursor: 'pointer' }}
                    >
                      {member.name}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      if (formRef.current) {
                        const form = formRef.current;
                        const nameInput = form.elements.namedItem('name') as HTMLInputElement;
                        const ageInput = form.elements.namedItem('age') as HTMLInputElement;
                        const genderSelect = form.elements.namedItem('gender') as HTMLSelectElement;
                        nameInput.value = '';
                        ageInput.value = '';
                        genderSelect.value = '';
                        setSelectedName('');
                      }
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
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#475569' }}>Name *</label>
              <input type="text" name="name" required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#475569' }}>Age</label>
              <input type="number" name="age" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#475569' }}>Gender</label>
              <select name="gender" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#475569' }}>Address</label>
            <textarea name="address" rows={2} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#475569' }}>Consultant</label>
            <select name="consultant" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'white' }}>
              <option value="">Select Consultant</option>
              {doctors.map(doc => (
                <option key={doc.id} value={doc.name}>{doc.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#475569' }}>Upload Prescriptions / Bills (Optional)</label>
            <input type="file" name="files" multiple onChange={(e) => {
              if (e.target.files) {
                const files = Array.from(e.target.files);
                const fileListElement = document.getElementById('selected-files-list');
                const uploadIndicator = document.getElementById('uploading-indicator');
                if (fileListElement) {
                  fileListElement.innerHTML = files.length > 0 ? `Selected ${files.length} file(s):<ul style="margin: 4px 0 0 0; padding-left: 20px;">${files.map(f => `<li>${f.name}</li>`).join('')}</ul>` : '';
                }
                if (uploadIndicator && files.length > 0) {
                  uploadIndicator.style.display = isSubmitting ? 'block' : 'none';
                }
              }
            }} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px dashed #cbd5e1', background: '#f8fafc' }} />
            <div id="selected-files-list" style={{ marginTop: '8px', fontSize: '13px', color: '#64748b' }}></div>
            {isSubmitting && (
              <div id="uploading-indicator" style={{ marginTop: '8px', fontSize: '13px', color: '#2563eb', fontWeight: 600 }}>
                Uploading files and saving data...
              </div>
            )}
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            <button type="button" onClick={onClose} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', color: '#475569', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
            <button 
              type="submit" 
              onClick={() => { submitActionRef.current = 'save-and-add'; }}
              disabled={isSubmitting} 
              style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #2563eb', background: 'white', color: '#2563eb', fontWeight: 600, cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1 }}
            >
              {isSubmitting && submitActionRef.current === 'save-and-add' ? 'Saving...' : 'Save & Add Another'}
            </button>
            <button 
              type="submit" 
              onClick={() => { submitActionRef.current = 'save'; }}
              disabled={isSubmitting} 
              style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#2563eb', color: 'white', fontWeight: 600, cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1 }}
            >
              {isSubmitting && submitActionRef.current === 'save' ? 'Saving...' : 'Save Patient Data'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
