'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

const DurationSelector = ({ value, onChange }: { value: string, onChange: (v: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  let currentNum = 1;
  let currentUnit = 'Day';
  
  if (value) {
    const match = value.match(/^(\d+)\s*(.*)$/);
    if (match) {
      currentNum = parseInt(match[1], 10) || 1;
      currentUnit = match[2] || 'Day';
    } else {
      currentUnit = value || 'Day';
    }
  }

  const handleNumChange = (delta: number) => {
    const newNum = Math.max(1, currentNum + delta);
    onChange(`${newNum} ${currentUnit}`);
  };

  const handleUnitChange = (newUnit: string) => {
    onChange(`${currentNum} ${newUnit}`);
  };

  return (
    <div style={{ position: 'relative' }}>
      <input 
        type="text"
        readOnly
        onClick={() => setIsOpen(!isOpen)}
        value={value}
        placeholder="Select"
        style={{ width: '100%', minWidth: '90px', padding: '6px', border: '1px solid #e2e8f0', borderRadius: '4px', background: 'white', cursor: 'pointer', fontSize: '13px', color: '#0f172a' }}
      />

      {isOpen && (
        <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: '4px', zIndex: 50, background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)', width: 'max-content' }}>
          <div style={{ fontWeight: 600, marginBottom: '12px', color: '#475569', fontSize: '18px' }}>Duration</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', background: '#f0f9ff', borderRadius: '8px', padding: '4px 8px', minWidth: '90px', justifyContent: 'space-between' }}>
              <button type="button" onClick={() => handleNumChange(-1)} style={{ background: 'none', border: 'none', fontSize: '24px', fontWeight: 'bold', cursor: 'pointer', color: '#334155', padding: '0 8px' }}>-</button>
              <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a' }}>{currentNum}</span>
              <button type="button" onClick={() => handleNumChange(1)} style={{ background: 'none', border: 'none', fontSize: '24px', fontWeight: 'bold', cursor: 'pointer', color: '#334155', padding: '0 8px' }}>+</button>
            </div>
            <div style={{ display: 'flex', border: '2px solid #334155', borderRadius: '4px', overflow: 'hidden' }}>
              {['Day', 'Week', 'Months', 'Year'].map((u, i) => {
                const isActive = currentUnit.toLowerCase().startsWith(u.toLowerCase());
                return (
                  <button
                    key={u}
                    type="button"
                    onClick={() => handleUnitChange(u)}
                    style={{
                      padding: '8px 12px',
                      border: 'none',
                      background: isActive ? '#84cc16' : 'white',
                      color: '#0f172a',
                      fontWeight: isActive ? 'bold' : '600',
                      borderRight: i < 3 ? '2px solid #334155' : 'none',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    {u}
                  </button>
                );
              })}
            </div>
          </div>
          <div style={{ marginTop: '20px', position: 'relative' }}>
            <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#0284c7' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>
            </span>
            <input 
              type="text" 
              value={value} 
              onChange={(e) => onChange(e.target.value)} 
              placeholder="Custom duration..."
              style={{ width: '100%', padding: '12px 12px 12px 42px', border: '2px solid #0284c7', borderRadius: '6px', background: '#f0f9ff', color: '#0369a1', fontWeight: 600, fontSize: '15px', outline: 'none' }}
            />
          </div>
        </div>
      )}
      {isOpen && <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setIsOpen(false)} />}
    </div>
  );
};

const FrequencySelector = ({ value, onChange }: { value: string, onChange: (v: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const options = ['1-0-0', '0-1-0', '0-0-1', '1-0-1', '1-1-0', '0-1-1', '1-1-1', 'SOS'];

  return (
    <div style={{ position: 'relative' }}>
      <input 
        type="text"
        readOnly
        onClick={() => setIsOpen(!isOpen)}
        value={value}
        placeholder="Select"
        style={{ width: '100%', minWidth: '90px', padding: '6px', border: '1px solid #e2e8f0', borderRadius: '4px', background: 'white', cursor: 'pointer', fontSize: '13px', color: '#0f172a' }}
      />
      
      {isOpen && (
        <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '4px', zIndex: 50, background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)', width: '380px', maxWidth: '85vw' }}>
          <div style={{ fontWeight: 500, marginBottom: '16px', color: '#475569', fontSize: '18px' }}>Frequency</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: '12px' }}>
            {options.map(opt => (
              <button
                key={opt}
                type="button"
                onClick={() => onChange(opt)}
                style={{ padding: '12px 8px', border: value === opt ? '2px solid #0284c7' : '1px solid #cbd5e1', borderRadius: '6px', background: value === opt ? '#f0f9ff' : 'white', cursor: 'pointer', fontWeight: 500, fontSize: '15px', color: value === opt ? '#0369a1' : '#475569', transition: 'all 0.2s' }}
              >
                {opt}
              </button>
            ))}
          </div>
          <div style={{ marginTop: '20px', position: 'relative' }}>
            <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#0284c7' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>
            </span>
            <input 
              type="text" 
              value={value} 
              onChange={(e) => onChange(e.target.value)} 
              placeholder="Custom frequency..."
              style={{ width: '100%', padding: '12px 12px 12px 42px', border: '2px solid #0284c7', borderRadius: '6px', background: '#f0f9ff', color: '#0369a1', fontWeight: 600, fontSize: '15px', outline: 'none' }}
            />
          </div>
        </div>
      )}
      {isOpen && <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setIsOpen(false)} />}
    </div>
  );
};

const InstructionsSelector = ({ value, onChange }: { value: string, onChange: (v: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const options = ['Before meal', 'After meal', 'Any time of day', 'Before lunch', 'After lunch', 'Empty stomach', 'Severe pain', 'At night', 'With food'];

  const selectedOptions = value ? value.split(',').map(s => s.trim()).filter(Boolean) : [];

  const handleToggle = (opt: string) => {
    let newOptions = [...selectedOptions];
    if (newOptions.includes(opt)) {
      newOptions = newOptions.filter(o => o !== opt);
    } else {
      newOptions.push(opt);
    }
    onChange(newOptions.join(', '));
  };

  return (
    <div style={{ position: 'relative' }}>
      <input 
        type="text"
        readOnly
        onClick={() => setIsOpen(!isOpen)}
        value={value}
        placeholder="Select"
        style={{ width: '100%', minWidth: '110px', padding: '6px', border: '1px solid #e2e8f0', borderRadius: '4px', background: 'white', cursor: 'pointer', fontSize: '13px', color: '#0f172a' }}
      />
      
      {isOpen && (
        <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '4px', zIndex: 50, background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)', width: '480px', maxWidth: '85vw' }}>
          <div style={{ fontWeight: 500, marginBottom: '16px', color: '#475569', fontSize: '18px' }}>Timing</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '12px' }}>
            {options.map(opt => {
              const isSelected = selectedOptions.includes(opt);
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handleToggle(opt)}
                  style={{ padding: '12px 8px', border: isSelected ? '2px solid #0284c7' : '1px solid #cbd5e1', borderRadius: '6px', background: isSelected ? '#f0f9ff' : 'white', cursor: 'pointer', fontWeight: 500, fontSize: '14px', color: isSelected ? '#0369a1' : '#475569', transition: 'all 0.2s' }}
                >
                  {opt}
                </button>
              );
            })}
          </div>
          <div style={{ marginTop: '20px', position: 'relative' }}>
            <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#0284c7' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>
            </span>
            <input 
              type="text" 
              value={value} 
              onChange={(e) => onChange(e.target.value)} 
              placeholder="Custom instructions..."
              style={{ width: '100%', padding: '12px 12px 12px 42px', border: '2px solid #0284c7', borderRadius: '6px', background: '#f0f9ff', color: '#0369a1', fontWeight: 600, fontSize: '15px', outline: 'none' }}
            />
          </div>
        </div>
      )}
      {isOpen && <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setIsOpen(false)} />}
    </div>
  );
};

export default function PatientDetailClient({ initialPatient }: { initialPatient: any }) {
  const [patient, setPatient] = useState(initialPatient);
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [prescriptionData, setPrescriptionData] = useState({
    consultationMode: 'Video',
    clinicalSummary: '',
    medicines: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
    investigations: '',
    advice: ''
  });

  const [editingFileId, setEditingFileId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionType, setActionType] = useState<'SAVE' | 'SUBMIT' | null>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams?.get('action') === 'prescription') {
      setIsPrescriptionModalOpen(true);
    }
  }, [searchParams]);

  const handleAddPrescription = async (e: React.FormEvent, submitStatus: 'DRAFT' | 'SUBMITTED') => {
    e.preventDefault();
    setIsSubmitting(true);
    setActionType(submitStatus === 'SUBMITTED' ? 'SUBMIT' : 'SAVE');
    
    try {
      const isEditing = !!editingFileId;
      const url = isEditing 
        ? `/api/doctor/patients/${patient.id}/files/${editingFileId}`
        : `/api/doctor/patients/${patient.id}/files`;
        
      const method = isEditing ? 'PUT' : 'POST';

      const prescriptionJsonString = JSON.stringify(prescriptionData);

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: isEditing ? undefined : `Prescription_${new Date().toISOString().split('T')[0]}.txt`,
          fileType: 'PRESCRIPTION',
          fileContent: prescriptionJsonString,
          status: submitStatus
        })
      });
      
      if (!res.ok) throw new Error('Failed to save prescription');
      
      const savedFile = await res.json();
      
      if (isEditing) {
        setPatient({ 
          ...patient, 
          files: patient.files.map((f: any) => f.id === savedFile.id ? savedFile : f) 
        });
      } else {
        setPatient({ ...patient, files: [savedFile, ...patient.files] });
      }
      
      setIsPrescriptionModalOpen(false);
      setPrescriptionData({
        consultationMode: 'Video',
        clinicalSummary: '',
        medicines: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
        investigations: '',
        advice: ''
      });
      setEditingFileId(null);
      setActionType(null);
      
      if (searchParams?.get('action')) {
        router.replace(`/doctor/patients/${patient.id}`);
      }
    } catch (error) {
      console.error(error);
      alert('Error saving prescription');
    } finally {
      setIsSubmitting(false);
      setActionType(null);
    }
  };

  const [viewingFileText, setViewingFileText] = useState<string | null>(null);

  const handleViewPrescription = (file: any) => {
    if (file.fileUrl.startsWith('data:')) {
      router.push(`/doctor/patients/${patient.id}/prescription?fileId=${file.id}&view=true`);
    } else {
      window.open(file.fileUrl, '_blank');
    }
  };

  const handleEditPrescription = (file: any) => {
    if (file.fileUrl.startsWith('data:')) {
      router.push(`/doctor/patients/${patient.id}/prescription?fileId=${file.id}`);
    } else {
      alert("Only text notes can be edited directly.");
    }
  };

  const handleSubmitPrescription = async (fileId: string) => {
    if (!confirm('Are you sure you want to submit this prescription to the admin? It can no longer be edited after submission.')) return;
    
    try {
      const res = await fetch(`/api/doctor/patients/${patient.id}/files/${fileId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'SUBMITTED' })
      });
      if (!res.ok) throw new Error('Failed to submit');
      
      alert('Prescription submitted successfully!');
      router.refresh();
    } catch (e) {
      alert('Failed to submit prescription.');
    }
  };


  const handleOpenNewPrescription = () => {
    setPrescriptionData({
      consultationMode: 'Video',
      clinicalSummary: '',
      medicines: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
      investigations: '',
      advice: ''
    });
    setEditingFileId(null);
    setIsPrescriptionModalOpen(true);
  };

  const addMedicineRow = () => {
    setPrescriptionData(prev => ({
      ...prev,
      medicines: [...prev.medicines, { name: '', dosage: '', frequency: '', duration: '', instructions: '' }]
    }));
  };

  const updateMedicine = (index: number, field: string, value: string) => {
    const newMedicines = [...prescriptionData.medicines];
    newMedicines[index] = { ...newMedicines[index], [field]: value };
    setPrescriptionData(prev => ({ ...prev, medicines: newMedicines }));
  };

  const removeMedicineRow = (index: number) => {
    const newMedicines = prescriptionData.medicines.filter((_, i) => i !== index);
    setPrescriptionData(prev => ({ ...prev, medicines: newMedicines }));
  };

  return (
    <>
    <style>{`
      .pd-header { display: flex; align-items: flex-start; flex-wrap: wrap; gap: 16px; margin-bottom: 32px; }
      .pd-write-btn-wrap { margin-left: auto; display: flex; flex-wrap: wrap; }
      .pd-write-btn { background: #3b82f6; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; white-space: nowrap; }
      .pd-file-card { display: flex; align-items: center; flex-wrap: wrap; gap: 12px; justify-content: space-between; padding: 16px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; }
      .pd-file-info { display: flex; align-items: center; gap: 16px; min-width: 0; }
      .pd-file-actions { display: flex; gap: 8px; flex-wrap: wrap; }
      .pd-file-actions button { white-space: nowrap; }
      .pd-modal-inner { background: white; padding: 32px; border-radius: 12px; width: 100%; max-width: 800px; max-height: 90vh; overflow-y: auto; }
      .pd-view-modal-inner { background: white; padding: 32px; border-radius: 12px; width: 100%; max-width: 650px; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04); }
      .pd-med-table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
      .pd-med-table { width: 100%; border-collapse: collapse; font-size: 14px; min-width: 480px; }
      @media (max-width: 600px) {
        .pd-header { flex-direction: column; gap: 12px; margin-bottom: 20px; }
        .pd-write-btn-wrap { margin-left: 0; width: 100%; }
        .pd-write-btn { width: 100%; justify-content: center; }
        .pd-file-card { flex-direction: column; align-items: flex-start; }
        .pd-file-info { width: 100%; }
        .pd-file-actions { width: 100%; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .pd-file-actions .pd-btn-full { grid-column: 1 / -1; }
        .pd-file-actions button { padding: 10px 8px; font-size: 13px; border-radius: 8px; font-weight: 600; text-align: center; white-space: normal; }
        .pd-modal-inner { padding: 16px; border-radius: 8px; max-height: 95vh; }
        .pd-view-modal-inner { padding: 16px; border-radius: 8px; max-height: 95vh; }
      }
    `}</style>
    <div>
      <div className="pd-header">
        <Link href="/doctor/patients" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '50%', background: 'white', border: '1px solid #e2e8f0', color: '#64748b', textDecoration: 'none' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        </Link>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 4px 0' }}>{patient.name}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#64748b', fontSize: '14px' }}>
            <span>{patient.phone}</span>
            <span>•</span>
            <span>{patient.age ? `${patient.age} Yrs` : 'Age N/A'}</span>
            <span>•</span>
            <span>{patient.gender || 'Gender N/A'}</span>
          </div>
        </div>
        
        <div className="pd-write-btn-wrap">
          <button 
            onClick={() => router.push(`/doctor/patients/${patient.id}/prescription`)}
            className="pd-write-btn"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>
            Write Prescription
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
        
        {/* Prescriptions Section */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#0f172a', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            Prescriptions & Notes
          </h2>
          
          {patient.files && patient.files.length > 0 ? (
            <div style={{ display: 'grid', gap: '12px' }}>
              {patient.files.map((file: any) => (
                <div key={file.id} className="pd-file-card">
                  <div className="pd-file-info">
                    <div style={{ width: '40px', height: '40px', background: '#e0f2fe', color: '#0284c7', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '15px' }}>{file.fileName}</div>
                        {file.status === 'SUBMITTED' ? (
                          <span style={{ background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600 }}>Submitted</span>
                        ) : (
                          <span style={{ background: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600 }}>Draft</span>
                        )}
                      </div>
                      <div suppressHydrationWarning style={{ color: '#64748b', fontSize: '13px', marginTop: '2px' }}>{(() => { const d = new Date(file.createdAt); const dd = String(d.getDate()).padStart(2, '0'); const mm = String(d.getMonth() + 1).padStart(2, '0'); const yyyy = d.getFullYear(); const time = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }); return `${dd} ${mm} ${yyyy}, ${time}`; })()}</div>
                    </div>
                  </div>
                  <div className="pd-file-actions">
                    {file.status !== 'SUBMITTED' && (
                      <>
                        <button 
                          onClick={() => handleEditPrescription(file)}
                          style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: '#2563eb', padding: '8px 16px', borderRadius: '6px', fontWeight: 500, cursor: 'pointer', fontSize: '13px' }}
                        >
                          Edit Note
                        </button>
                      </>
                    )}
                    <button 
                      onClick={() => handleViewPrescription(file)}
                      style={{ background: 'white', border: '1px solid #cbd5e1', color: '#334155', padding: '8px 16px', borderRadius: '6px', fontWeight: 500, cursor: 'pointer', fontSize: '13px' }}
                    >
                      View Note
                    </button>
                    {file.status !== 'SUBMITTED' && (
                      <button 
                        onClick={() => handleSubmitPrescription(file.id)}
                        className="pd-btn-full"
                        style={{ background: '#10b981', border: 'none', color: 'white', padding: '8px 16px', borderRadius: '6px', fontWeight: 500, cursor: 'pointer', fontSize: '13px' }}
                      >
                        Submit to Admin
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
              <div style={{ background: '#f1f5f9', width: '56px', height: '56px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              </div>
              <div style={{ fontWeight: 500, color: '#475569', marginBottom: '4px' }}>No Prescriptions Yet</div>
              <div style={{ fontSize: '14px' }}>Click 'Write Prescription' to add a note for this patient.</div>
            </div>
          )}
        </div>
      </div>

      {isPrescriptionModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '24px' }}>
          <div className="pd-modal-inner">
            <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', color: '#1e293b' }}>{editingFileId ? 'Edit Telemedicine Prescription' : 'New Telemedicine Prescription'}</h2>
            <p style={{ color: '#64748b', margin: '0 0 24px 0', fontSize: '14px' }}>
              Fill in the standardized consultation details for {patient.name}.
            </p>
            
            <form style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Consultation Mode */}
              <div>
                <label style={{ display: 'block', fontWeight: 600, color: '#334155', marginBottom: '8px', fontSize: '14px' }}>Consultation Mode</label>
                <div style={{ display: 'flex', gap: '16px' }}>
                  {['Video', 'Audio', 'Chat'].map(mode => (
                    <label key={mode} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: '#475569' }}>
                      <input 
                        type="radio" 
                        name="consultationMode" 
                        checked={prescriptionData.consultationMode === mode}
                        onChange={() => setPrescriptionData(prev => ({ ...prev, consultationMode: mode }))}
                        style={{ cursor: 'pointer' }}
                      />
                      {mode}
                    </label>
                  ))}
                </div>
              </div>

              {/* Clinical Summary */}
              <div>
                <label style={{ display: 'block', fontWeight: 600, color: '#334155', marginBottom: '8px', fontSize: '14px' }}>Clinical Summary <span style={{ color: '#ef4444' }}>*</span></label>
                <textarea 
                  value={prescriptionData.clinicalSummary}
                  onChange={(e) => setPrescriptionData(prev => ({ ...prev, clinicalSummary: e.target.value }))}
                  required 
                  placeholder="E.g., Fever, Cough, Cold - Viral URTI"
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', minHeight: '80px', resize: 'vertical', fontFamily: 'inherit', fontSize: '14px' }} 
                />
              </div>

              {/* Medicines Table */}
              <style>{`
                @media (max-width: 768px) {
                  .med-table th { display: none; }
                  .med-table td { display: block; width: 100%; border-bottom: none !important; padding: 8px 12px !important; text-align: left !important; }
                  .med-table tr { display: block; border: 1px solid #cbd5e1; border-radius: 8px; margin-bottom: 16px; background: white; padding-bottom: 12px !important; }
                  .med-table tbody { background: #f1f5f9; padding: 16px 16px 0 16px; display: block; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px; }
                  .med-table td::before {
                    content: attr(data-label);
                    display: block;
                    font-weight: 600;
                    color: #475569;
                    margin-bottom: 6px;
                    font-size: 13px;
                  }
                  .med-table td.remove-btn-td {
                    display: flex;
                    justify-content: flex-end;
                  }
                  .med-table td.remove-btn-td::before {
                    display: none;
                  }
                  .med-table-wrapper { border: none !important; background: transparent !important; }
                }
              `}</style>
              <div>
                <label style={{ display: 'block', fontWeight: 600, color: '#334155', marginBottom: '8px', fontSize: '14px' }}>Prescribed Medicines <span style={{ color: '#ef4444' }}>*</span></label>
                <div className="med-table-wrapper" style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflowX: 'auto', background: 'white' }}>
                  <table className="med-table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, textAlign: 'left', fontSize: '13px' }}>
                    <thead style={{ background: '#f8fafc' }}>
                      <tr>
                        <th style={{ padding: '12px', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600, borderTopLeftRadius: '8px', width: '60px', textAlign: 'center' }}>S.No.</th>
                        <th style={{ padding: '12px', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600 }}>Medicine Name</th>
                        <th style={{ padding: '12px', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600 }}>Dosage</th>
                        <th style={{ padding: '12px', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600 }}>Freq (M/A/N)</th>
                        <th style={{ padding: '12px', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600 }}>Duration</th>
                        <th style={{ padding: '12px', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600 }}>Instructions</th>
                        <th style={{ padding: '12px', borderBottom: '1px solid #e2e8f0', width: '40px', borderTopRightRadius: '8px' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {prescriptionData.medicines.map((med, index) => (
                        <tr key={index}>
                          <td data-label="S.No." style={{ padding: '8px', borderBottom: '1px solid #e2e8f0', verticalAlign: 'top', color: '#475569', fontWeight: 600, textAlign: 'center', paddingTop: '14px' }}>
                            {index + 1}
                          </td>
                          <td data-label="Medicine Name" style={{ padding: '8px', borderBottom: '1px solid #e2e8f0', verticalAlign: 'top' }}>
                            <input type="text" value={med.name} onChange={(e) => updateMedicine(index, 'name', e.target.value)} style={{ width: '100%', padding: '6px', border: '1px solid #e2e8f0', borderRadius: '4px' }} placeholder="E.g. Paracetamol 650mg" />
                          </td>
                          <td data-label="Dosage" style={{ padding: '8px', borderBottom: '1px solid #e2e8f0', verticalAlign: 'top' }}>
                            <input type="text" value={med.dosage} onChange={(e) => updateMedicine(index, 'dosage', e.target.value)} style={{ width: '100%', padding: '6px', border: '1px solid #e2e8f0', borderRadius: '4px' }} placeholder="1 Tab" />
                          </td>
                          <td data-label="Frequency" style={{ padding: '8px', borderBottom: '1px solid #e2e8f0', verticalAlign: 'top' }}>
                            <FrequencySelector 
                              value={med.frequency}
                              onChange={(val) => updateMedicine(index, 'frequency', val)}
                            />
                          </td>
                          <td data-label="Duration" style={{ padding: '8px', borderBottom: '1px solid #e2e8f0', verticalAlign: 'top' }}>
                            <DurationSelector 
                              value={med.duration} 
                              onChange={(val) => updateMedicine(index, 'duration', val)} 
                            />
                          </td>
                          <td data-label="Instructions" style={{ padding: '8px', borderBottom: '1px solid #e2e8f0', verticalAlign: 'top' }}>
                            <InstructionsSelector 
                              value={med.instructions}
                              onChange={(val) => updateMedicine(index, 'instructions', val)}
                            />
                          </td>
                          <td data-label="" className="remove-btn-td" style={{ padding: '8px', borderBottom: '1px solid #e2e8f0', textAlign: 'center' }}>
                            {prescriptionData.medicines.length > 1 && (
                              <button type="button" onClick={() => removeMedicineRow(index)} style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#ef4444', borderRadius: '6px', cursor: 'pointer', padding: '6px 12px', fontSize: '13px', fontWeight: 600 }}>✕ Remove</button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div style={{ padding: '8px', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                    <button type="button" onClick={addMedicineRow} style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      + Add Medicine
                    </button>
                  </div>
                </div>
              </div>

              {/* Investigations */}
              <div>
                <label style={{ display: 'block', fontWeight: 600, color: '#334155', marginBottom: '8px', fontSize: '14px' }}>Investigations (Optional)</label>
                <input 
                  type="text"
                  value={prescriptionData.investigations}
                  onChange={(e) => setPrescriptionData(prev => ({ ...prev, investigations: e.target.value }))}
                  placeholder="Doctor to write in the tests required, if any (e.g. CBC, Lipid Profile)"
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontFamily: 'inherit', fontSize: '14px' }} 
                />
              </div>

              {/* Advice */}
              <div>
                <label style={{ display: 'block', fontWeight: 600, color: '#334155', marginBottom: '8px', fontSize: '14px' }}>Advice (Optional)</label>
                <textarea 
                  value={prescriptionData.advice}
                  onChange={(e) => setPrescriptionData(prev => ({ ...prev, advice: e.target.value }))}
                  placeholder="Drink plenty of water, adequate rest, steam inhalation"
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', minHeight: '60px', resize: 'vertical', fontFamily: 'inherit', fontSize: '14px' }} 
                />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px', borderTop: '1px solid #e2e8f0', paddingTop: '24px' }}>
                <button type="button" onClick={() => setIsPrescriptionModalOpen(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', color: '#475569', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button 
                  type="button" 
                  onClick={(e) => handleAddPrescription(e, 'DRAFT')}
                  disabled={isSubmitting || !prescriptionData.clinicalSummary.trim()} 
                  style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #3b82f6', background: 'white', color: '#3b82f6', fontWeight: 600, cursor: isSubmitting || !prescriptionData.clinicalSummary.trim() ? 'not-allowed' : 'pointer', opacity: isSubmitting || !prescriptionData.clinicalSummary.trim() ? 0.7 : 1 }}
                >
                  {isSubmitting && actionType === 'SAVE' ? 'Saving...' : editingFileId ? 'Save Draft' : 'Save as Draft'}
                </button>
                <button 
                  type="button" 
                  onClick={(e) => handleAddPrescription(e, 'SUBMITTED')}
                  disabled={isSubmitting || !prescriptionData.clinicalSummary.trim()} 
                  style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#3b82f6', color: 'white', fontWeight: 600, cursor: isSubmitting || !prescriptionData.clinicalSummary.trim() ? 'not-allowed' : 'pointer', opacity: isSubmitting || !prescriptionData.clinicalSummary.trim() ? 0.7 : 1 }}
                >
                  {isSubmitting && actionType === 'SUBMIT' ? 'Submitting...' : 'Submit to Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {viewingFileText && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '24px' }}>
          <div className="pd-view-modal-inner">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #e2e8f0' }}>
              <div>
                <h2 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: 'bold', color: '#0f172a' }}>Prescription Details</h2>
                <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: '#64748b' }}>
                  <span><strong style={{ color: '#475569' }}>Patient:</strong> {patient.name}</span>
                </div>
              </div>
              <button 
                onClick={() => setViewingFileText(null)}
                style={{ background: '#f1f5f9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', cursor: 'pointer' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            
            <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              {(() => {
                try {
                  const parsed = JSON.parse(viewingFileText);
                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
                        <div>
                          <span style={{ color: '#64748b', fontSize: '13px', textTransform: 'uppercase', fontWeight: 600 }}>Consultation Mode</span>
                          <div style={{ fontWeight: 600, color: '#0f172a', marginTop: '4px' }}>{parsed.consultationMode || 'N/A'}</div>
                        </div>
                      </div>

                      <div>
                        <span style={{ color: '#64748b', fontSize: '13px', textTransform: 'uppercase', fontWeight: 600 }}>Clinical Summary</span>
                        <div style={{ color: '#1e293b', marginTop: '4px', whiteSpace: 'pre-wrap' }}>{parsed.clinicalSummary || 'None'}</div>
                      </div>

                      {parsed.medicines && parsed.medicines.length > 0 && parsed.medicines.some((m:any) => m.name) && (
                        <div>
                          <span style={{ color: '#64748b', fontSize: '13px', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Prescribed Medicines</span>
                          <div className="pd-med-table-wrap">
                          <table className="pd-med-table">
                            <thead>
                              <tr style={{ background: '#f1f5f9', color: '#475569', textAlign: 'left' }}>
                                <th style={{ padding: '8px 12px', fontWeight: 600, border: '1px solid #e2e8f0' }}>Medicine Name</th>
                                <th style={{ padding: '8px 12px', fontWeight: 600, border: '1px solid #e2e8f0' }}>Dosage</th>
                                <th style={{ padding: '8px 12px', fontWeight: 600, border: '1px solid #e2e8f0' }}>Freq</th>
                                <th style={{ padding: '8px 12px', fontWeight: 600, border: '1px solid #e2e8f0' }}>Duration</th>
                                <th style={{ padding: '8px 12px', fontWeight: 600, border: '1px solid #e2e8f0' }}>Instructions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {parsed.medicines.filter((m:any) => m.name).map((med: any, idx: number) => (
                                <tr key={idx} style={{ background: 'white' }}>
                                  <td style={{ padding: '8px 12px', border: '1px solid #e2e8f0', color: '#0f172a' }}>{med.name}</td>
                                  <td style={{ padding: '8px 12px', border: '1px solid #e2e8f0', color: '#475569' }}>{med.dosage}</td>
                                  <td style={{ padding: '8px 12px', border: '1px solid #e2e8f0', color: '#475569' }}>{med.frequency}</td>
                                  <td style={{ padding: '8px 12px', border: '1px solid #e2e8f0', color: '#475569' }}>{med.duration}</td>
                                  <td style={{ padding: '8px 12px', border: '1px solid #e2e8f0', color: '#475569' }}>{med.instructions}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          </div>
                        </div>
                      )}

                      {parsed.investigations && (
                        <div>
                          <span style={{ color: '#64748b', fontSize: '13px', textTransform: 'uppercase', fontWeight: 600 }}>Investigations</span>
                          <div style={{ color: '#1e293b', marginTop: '4px', whiteSpace: 'pre-wrap' }}>{parsed.investigations}</div>
                        </div>
                      )}

                      {parsed.advice && (
                        <div>
                          <span style={{ color: '#64748b', fontSize: '13px', textTransform: 'uppercase', fontWeight: 600 }}>Advice</span>
                          <div style={{ color: '#1e293b', marginTop: '4px', whiteSpace: 'pre-wrap' }}>{parsed.advice}</div>
                        </div>
                      )}
                    </div>
                  );
                } catch (e) {
                  return (
                    <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '15px', lineHeight: '1.6', color: '#1e293b' }}>
                      {viewingFileText}
                    </pre>
                  );
                }
              })()}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button 
                onClick={() => setViewingFileText(null)}
                style={{ background: '#f1f5f9', color: '#475569', border: 'none', padding: '10px 24px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
