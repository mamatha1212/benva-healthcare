'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Loader2, Download, Plus, Trash2 } from 'lucide-react';
import { useSearchParams, useRouter, useParams } from 'next/navigation';

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
    setIsOpen(false);
  };

  return (
    <div style={{ position: 'relative' }}>
      <input 
        type="text"
        readOnly
        onClick={() => setIsOpen(!isOpen)}
        value={value}
        placeholder="Select"
        style={{ width: '100%', minWidth: '90px', padding: '6px', border: '1px solid #e2e8f0', borderRadius: '4px', background: 'transparent', cursor: 'pointer', fontSize: 'inherit', color: 'inherit', outline: 'none' }}
      />

      {isOpen && (
        <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: '4px', zIndex: 50, background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)', width: 'max-content', color: '#0f172a' }}>
          <div style={{ fontWeight: 600, marginBottom: '12px', color: '#475569', fontSize: '18px', textAlign: 'left' }}>Duration</div>
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
              style={{ width: '100%', padding: '12px 12px 12px 42px', border: '2px solid #0284c7', borderRadius: '6px', background: '#f0f9ff', color: '#0369a1', fontWeight: 600, fontSize: '15px', outline: 'none', boxSizing: 'border-box' }}
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
        style={{ width: '100%', minWidth: '90px', padding: '6px', border: '1px solid #e2e8f0', borderRadius: '4px', background: 'transparent', cursor: 'pointer', fontSize: 'inherit', color: 'inherit', outline: 'none' }}
      />
      
      {isOpen && (
        <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '4px', zIndex: 50, background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)', width: '380px', maxWidth: '85vw', color: '#0f172a' }}>
          <div style={{ fontWeight: 500, marginBottom: '16px', color: '#475569', fontSize: '18px', textAlign: 'left' }}>Frequency</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: '12px' }}>
            {options.map(opt => (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  onChange(opt);
                  setIsOpen(false);
                }}
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
              style={{ width: '100%', padding: '12px 12px 12px 42px', border: '2px solid #0284c7', borderRadius: '6px', background: '#f0f9ff', color: '#0369a1', fontWeight: 600, fontSize: '15px', outline: 'none', boxSizing: 'border-box' }}
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
    setIsOpen(false);
  };

  return (
    <div style={{ position: 'relative' }}>
      <input 
        type="text"
        readOnly
        onClick={() => setIsOpen(!isOpen)}
        value={value}
        placeholder="Select"
        style={{ width: '100%', minWidth: '110px', padding: '6px', border: '1px solid #e2e8f0', borderRadius: '4px', background: 'transparent', cursor: 'pointer', fontSize: 'inherit', color: 'inherit', outline: 'none' }}
      />
      
      {isOpen && (
        <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '4px', zIndex: 50, background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)', width: '480px', maxWidth: '85vw', color: '#0f172a' }}>
          <div style={{ fontWeight: 500, marginBottom: '16px', color: '#475569', fontSize: '18px', textAlign: 'left' }}>Timing</div>
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
              style={{ width: '100%', padding: '12px 12px 12px 42px', border: '2px solid #0284c7', borderRadius: '6px', background: '#f0f9ff', color: '#0369a1', fontWeight: 600, fontSize: '15px', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
        </div>
      )}
      {isOpen && <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setIsOpen(false)} />}
    </div>
  );
};

export default function PrescriptionPage() {
  const searchParams = useSearchParams();
  const params = useParams();
  const patientId = params?.id as string;
  const fileId = searchParams?.get('fileId');
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [doctorProfile, setDoctorProfile] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    consultationDate: new Date().toISOString().split('T')[0],
    consultationMode: '',
    patientName: '',
    patientAge: '',
    patientGender: 'Male',
    patientUhid: '',
    clinicalSummary: '',
    investigations: '',
    advice: ''
  });

  const [medicines, setMedicines] = useState([
    { name: '', dosage: '', frequency: '', duration: '', instructions: '' }
  ]);

  const pdfRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const isViewOnly = searchParams?.get('view') === 'true';
  const isViewMode = isGenerating || isViewOnly;

  useEffect(() => {
    fetchProfile();
    if (patientId) {
      fetchPatient(patientId, fileId);
    }
  }, [patientId, fileId]);

  const fetchPatient = async (id: string, fId: string | null) => {
    try {
      const res = await fetch(`/api/doctor/patients/${id}`);
      if (res.ok) {
        const data = await res.json();
        setFormData(prev => ({
          ...prev,
          patientName: data.name || '',
          patientAge: data.age?.toString() || '',
          patientGender: data.gender || 'Male',
          patientUhid: data.uhid || 'PENDING'
        }));

        if (fId && data.files) {
          const file = data.files.find((f: any) => f.id === fId);
          if (file && file.fileUrl.startsWith('data:')) {
            try {
              const base64Data = file.fileUrl.split(',')[1];
              const decodedText = atob(base64Data);
              const parsed = JSON.parse(decodedText);
              setFormData(prev => ({
                ...prev,
                consultationMode: parsed.consultationMode || 'Video',
                patientName: parsed.patientName || prev.patientName,
                patientAge: parsed.patientAge || prev.patientAge,
                patientGender: parsed.patientGender || prev.patientGender,
                patientUhid: parsed.patientUhid || prev.patientUhid,
                clinicalSummary: parsed.clinicalSummary || '',
                investigations: parsed.investigations || '',
                advice: parsed.advice || ''
              }));
              if (parsed.medicines && parsed.medicines.length > 0) {
                setMedicines(parsed.medicines);
              }
            } catch (e) {
              console.error('Failed to parse prescription file', e);
            }
          }
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveToRecord = async () => {
    if (!patientId) return;
    setIsSaving(true);
    try {
      const data = { ...formData, medicines };
      const method = fileId ? 'PUT' : 'POST';
      const url = fileId ? `/api/doctor/patients/${patientId}/files/${fileId}` : `/api/doctor/patients/${patientId}/files`;
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: fileId ? undefined : `Prescription_${formData.consultationDate}.txt`,
          fileType: 'PRESCRIPTION',
          fileContent: JSON.stringify(data)
        })
      });
      if (!res.ok) throw new Error('Failed');
      alert('Prescription saved as draft successfully!');
      router.refresh();
      router.push(`/doctor/patients/${patientId}`);
    } catch (e) {
      alert('Failed to save prescription.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmitToAdmin = async () => {
    if (!patientId) return;
    if (!confirm('Are you sure you want to submit this prescription? It cannot be edited after submission.')) return;
    setIsSaving(true);
    try {
      const data = { ...formData, medicines };
      const method = fileId ? 'PUT' : 'POST';
      const url = fileId ? `/api/doctor/patients/${patientId}/files/${fileId}` : `/api/doctor/patients/${patientId}/files`;
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: fileId ? undefined : `Prescription_${formData.consultationDate}.txt`,
          fileType: 'PRESCRIPTION',
          fileContent: JSON.stringify(data),
          status: 'SUBMITTED'
        })
      });
      if (!res.ok) throw new Error('Failed');
      alert('Prescription submitted to admin successfully!');
      router.refresh();
      router.push(`/doctor/patients/${patientId}`);
    } catch (e) {
      alert('Failed to submit prescription.');
    } finally {
      setIsSaving(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/doctor/profile');
      if (!res.ok) throw new Error('Failed to fetch profile');
      const data = await res.json();
      setDoctorProfile(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleMedicineChange = (index: number, field: string, value: any) => {
    const newMeds = [...medicines];
    (newMeds[index] as any)[field] = value;
    setMedicines(newMeds);
  };

  const addMedicine = () => {
    setMedicines([...medicines, { name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
  };

  const removeMedicine = (index: number) => {
    const newMeds = [...medicines];
    newMeds.splice(index, 1);
    setMedicines(newMeds);
  };

  const generatePDF = async () => {
    const element = pdfRef.current;
    if (!element) return;
    
    setIsGenerating(true);
    
    setTimeout(async () => {
      try {
        const html2pdf = (await import('html2pdf.js')).default;
        
        const opt = {
          margin:       [10, 0, 10, 0],
          filename:     `${formData.patientName || 'Patient'}_${formData.patientUhid ? formData.patientUhid.replace(/BENVA-UHID-0+/, 'BENVA-UHID-') : 'PENDING'}.pdf`,
          image:        { type: 'jpeg' as const, quality: 0.98 },
          html2canvas:  { scale: 2, useCORS: true },
          pagebreak:    { mode: ['css', 'legacy'] },
          jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
        };
        
        await html2pdf().set(opt).from(element).save();
      } finally {
        setIsGenerating(false);
      }
    }, 150);
  };

  const handleViewPDF = async () => {
    const element = pdfRef.current;
    if (!element) return;
    
    setIsGenerating(true);
    
    setTimeout(async () => {
      try {
        const html2pdf = (await import('html2pdf.js')).default;
        
        const opt = {
          margin:       [10, 0, 10, 0],
          filename:     `${formData.patientName || 'Patient'}_${formData.patientUhid ? formData.patientUhid.replace(/BENVA-UHID-0+/, 'BENVA-UHID-') : 'PENDING'}.pdf`,
          image:        { type: 'jpeg' as const, quality: 0.98 },
          html2canvas:  { scale: 2, useCORS: true },
          pagebreak:    { mode: ['css', 'legacy'] },
          jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
        };
        
        const pdfBlob = await html2pdf().set(opt).from(element).output('blob');
        const file = new File([pdfBlob], opt.filename, { type: 'application/pdf' });
        const pdfUrl = URL.createObjectURL(file);
        
        const newWindow = window.open('', '_blank');
        if (newWindow) {
          newWindow.document.title = opt.filename;
          newWindow.document.write(`
            <!DOCTYPE html>
            <html>
              <head>
                <title>${opt.filename}</title>
                <meta name="viewport" content="width=device-width, initial-scale=1">
              </head>
              <body style="margin:0; overflow:hidden; display:flex; flex-direction:column; height:100vh; background-color:#333;">
                <div style="background-color:#1e293b; padding:12px 20px; display:flex; justify-content:space-between; align-items:center; color:white; font-family:sans-serif; border-bottom:1px solid #0f172a; z-index:10;">
                  <div style="font-size:14px; opacity:0.9;">Viewing: <strong style="color:#38bdf8;">${opt.filename}</strong></div>
                  <button onclick="
                    const a = document.createElement('a');
                    a.href = '${pdfUrl}';
                    a.download = '${opt.filename}';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                  " style="background:#38bdf8; color:#0f172a; border:none; padding:8px 16px; border-radius:6px; font-weight:600; cursor:pointer; display:flex; align-items:center; gap:8px; font-size:14px; box-shadow:0 2px 4px rgba(0,0,0,0.2); transition:all 0.2s;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                    Download Prescription
                  </button>
                </div>
                <iframe width="100%" style="flex:1; border:none; background-color:#525659;" src="${pdfUrl}#toolbar=0" frameborder="0"></iframe>
              </body>
            </html>
          `);
          newWindow.document.close();
        }
      } finally {
        setIsGenerating(false);
      }
    }, 150);
  };

  if (isLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#38bdf8' }}><Loader2 className="animate-spin" /></div>;
  }

  const inputStyle = {
    border: 'none',
    background: 'transparent',
    outline: 'none',
    width: '100%',
    fontFamily: 'inherit',
    fontSize: 'inherit',
    color: 'inherit',
    padding: '0'
  };

  const textareaStyle = {
    ...inputStyle,
    resize: 'none' as const,
    minHeight: '40px'
  };

  // Light and precise colors from PDF
  const colors = {
    headerBg: '#0f3162',
    leftColBg: '#eaf1f8',
    borderColor: '#8caecc',
    textColor: 'black'
  };

  const renderFrequencyPDF = (freq: string) => {
    if (!freq) return <></>;
    if (freq === 'SOS') return <span>SOS</span>;
    const parts = freq.split('-');
    if (parts.length === 3) {
      return <span style={{ fontWeight: 600, letterSpacing: '2px' }}>{parts.join(' - ')}</span>;
    }
    return <span>{freq}</span>;
  };

  return (
    <div style={{ padding: '16px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column' }}>
      <div style={{ width: '100%', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '16px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>Create Prescription</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          {patientId && (
            <>
              <button onClick={() => router.back()} style={{ padding: '10px 20px', backgroundColor: '#f1f5f9', color: '#475569', borderRadius: '8px', fontWeight: 600, border: '1px solid #cbd5e1', cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={handleSaveToRecord} disabled={isSaving} style={{ padding: '10px 20px', backgroundColor: '#e0f2fe', color: '#0284c7', borderRadius: '8px', fontWeight: 600, border: 'none', cursor: isSaving ? 'not-allowed' : 'pointer', opacity: isSaving ? 0.7 : 1 }}>
                {isSaving ? 'Saving...' : 'Save as Draft'}
              </button>
              <button onClick={handleSubmitToAdmin} disabled={isSaving} style={{ padding: '10px 20px', backgroundColor: '#10b981', color: 'white', borderRadius: '8px', fontWeight: 600, border: 'none', cursor: isSaving ? 'not-allowed' : 'pointer', opacity: isSaving ? 0.7 : 1 }}>
                Submit to Admin
              </button>
            </>
          )}
          {fileId && (
            <>
              <button onClick={handleViewPDF} disabled={isGenerating} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: '#e2e8f0', color: '#0f172a', borderRadius: '8px', fontWeight: 600, border: 'none', cursor: isGenerating ? 'not-allowed' : 'pointer', opacity: isGenerating ? 0.7 : 1 }}>
                {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>}
                {isGenerating ? 'Wait...' : 'View PDF'}
              </button>
              <button onClick={generatePDF} disabled={isGenerating} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: '#38bdf8', color: '#0f172a', borderRadius: '8px', fontWeight: 600, border: 'none', cursor: isGenerating ? 'not-allowed' : 'pointer', opacity: isGenerating ? 0.7 : 1 }}>
                {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                {isGenerating ? 'Generating...' : 'Download PDF'}
              </button>
            </>
          )}
        </div>
      </div>

      <div style={{ width: '100%', overflowX: isGenerating ? 'visible' : 'auto', paddingBottom: '24px' }}>
        <div style={{ minWidth: '100%', width: '100%', display: 'flex', justifyContent: 'center' }}>
          <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', width: '100%', overflowX: isGenerating ? 'visible' : 'auto' }}>
            
            <div ref={pdfRef} id="pdf-content" style={{ width: '100%', padding: '0 20px 40px 20px', backgroundColor: 'white', fontFamily: '"Times New Roman", Times, serif', color: colors.textColor, fontSize: '18px' }}>
              <style dangerouslySetInnerHTML={{ __html: `
                #pdf-content, #pdf-content * {
                  box-sizing: border-box !important;
                }
              ` }} />
          
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', borderBottom: `2px solid ${colors.headerBg}`, paddingBottom: '24px', marginBottom: '24px', paddingTop: '0' }}>
            <div style={{ height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              <img src="/images/Benva%20NEW.png" alt="Benva Healthcare" style={{ width: '380px', height: 'auto', objectFit: 'contain' }} />
            </div>
          </div>

          <h2 style={{ textAlign: 'center', color: colors.headerBg, fontSize: '20px', marginBottom: '20px', fontFamily: 'Arial, sans-serif' }}>TELEMEDICINE PRESCRIPTION</h2>

          <div style={{ marginBottom: '20px' }}>
            <div style={{ backgroundColor: colors.headerBg, color: 'white', padding: '8px 12px', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }}>DOCTOR DETAILS <span style={{ fontSize: '12px', fontWeight: 'normal', fontStyle: 'italic' }}>(AUTO)</span></div>
            <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', wordWrap: 'break-word' }}>
              <tbody>
                <tr>
                  <td style={{ border: `1px solid ${colors.borderColor}`, padding: '8px', width: '30%', backgroundColor: colors.leftColBg, fontWeight: 'bold', color: colors.headerBg }}>Doctor Name</td>
                  <td style={{ border: `1px solid ${colors.borderColor}`, padding: '8px' }}>{doctorProfile?.name || ''}</td>
                </tr>
                <tr>
                  <td style={{ border: `1px solid ${colors.borderColor}`, padding: '8px', backgroundColor: colors.leftColBg, fontWeight: 'bold', color: colors.headerBg }}>Qualification</td>
                  <td style={{ border: `1px solid ${colors.borderColor}`, padding: '8px' }}>{doctorProfile?.qualification || ''}</td>
                </tr>
                <tr>
                  <td style={{ border: `1px solid ${colors.borderColor}`, padding: '8px', backgroundColor: colors.leftColBg, fontWeight: 'bold', color: colors.headerBg }}>Speciality</td>
                  <td style={{ border: `1px solid ${colors.borderColor}`, padding: '8px' }}>{doctorProfile?.speciality || ''}</td>
                </tr>
                <tr>
                  <td style={{ border: `1px solid ${colors.borderColor}`, padding: '8px', backgroundColor: colors.leftColBg, fontWeight: 'bold', color: colors.headerBg }}>Medical Council Reg. No.</td>
                  <td style={{ border: `1px solid ${colors.borderColor}`, padding: '8px' }}>{doctorProfile?.medicalCouncilReg || ''}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <div style={{ backgroundColor: colors.headerBg, color: 'white', padding: '8px 12px', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }}>CONSULTATION DETAILS</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', wordWrap: 'break-word' }}>
              <tbody>
                <tr>
                  <td style={{ border: `1px solid ${colors.borderColor}`, padding: '8px', width: '30%', backgroundColor: colors.leftColBg, fontWeight: 'bold', color: colors.headerBg }}>UHID Number</td>
                  <td style={{ border: `1px solid ${colors.borderColor}`, padding: '8px', fontWeight: 'bold' }}>{formData.patientUhid}</td>
                </tr>
                <tr>
                  <td style={{ border: `1px solid ${colors.borderColor}`, padding: '8px', backgroundColor: colors.leftColBg, fontWeight: 'bold', color: colors.headerBg }}>Consultation Date</td>
                  <td style={{ border: `1px solid ${colors.borderColor}`, padding: '8px' }}>
                    {isViewMode ? (formData.consultationDate ? formData.consultationDate.split('-').reverse().join('-') : '') : <input type="date" name="consultationDate" value={formData.consultationDate} onChange={handleInputChange} style={inputStyle} />}
                  </td>
                </tr>
                <tr>
                  <td style={{ border: `1px solid ${colors.borderColor}`, padding: '8px', backgroundColor: colors.leftColBg, fontWeight: 'bold', color: colors.headerBg }}>Consultation Mode</td>
                  <td style={{ border: `1px solid ${colors.borderColor}`, padding: '8px' }}>
                    {isViewMode ? formData.consultationMode || 'None' : (
                      <div style={{ display: 'flex', gap: '16px' }}>
                        {['Video', 'Audio', 'Chat'].map((mode) => (
                          <label key={mode} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={formData.consultationMode.includes(mode)}
                              onChange={(e) => {
                                const currentModes = formData.consultationMode ? formData.consultationMode.split(',').map(s => s.trim()).filter(Boolean) : [];
                                let newModes;
                                if (e.target.checked) {
                                  newModes = [...currentModes, mode];
                                } else {
                                  newModes = currentModes.filter(m => m !== mode);
                                }
                                setFormData(prev => ({ ...prev, consultationMode: newModes.join(', ') }));
                              }}
                              style={{ cursor: 'pointer' }}
                            />
                            {mode}
                          </label>
                        ))}
                      </div>
                    )}
                  </td>
                </tr>
                <tr>
                  <td style={{ border: `1px solid ${colors.borderColor}`, padding: '8px', backgroundColor: colors.leftColBg, fontWeight: 'bold', color: colors.headerBg }}>Full Name</td>
                  <td style={{ border: `1px solid ${colors.borderColor}`, padding: '8px' }}>
                    {isViewMode ? formData.patientName : <input name="patientName" placeholder="Enter patient name" value={formData.patientName} onChange={handleInputChange} style={inputStyle} />}
                  </td>
                </tr>
                <tr>
                  <td style={{ border: `1px solid ${colors.borderColor}`, padding: '0', height: '100%' }} colSpan={2}>
                    <div style={{ display: 'flex', height: '100%' }}>
                      <div style={{ width: '30%', padding: '8px', backgroundColor: colors.leftColBg, fontWeight: 'bold', color: colors.headerBg, borderRight: `1px solid ${colors.borderColor}` }}>Age</div>
                      <div style={{ width: '20%', padding: '8px', borderRight: `1px solid ${colors.borderColor}` }}>
                        {isViewMode ? formData.patientAge : <input name="patientAge" placeholder="e.g. 35" value={formData.patientAge} onChange={handleInputChange} style={inputStyle} />}
                      </div>
                      <div style={{ width: '25%', padding: '8px', backgroundColor: colors.leftColBg, fontWeight: 'bold', color: colors.headerBg, borderRight: `1px solid ${colors.borderColor}` }}>Gender</div>
                      <div style={{ width: '25%', padding: '8px' }}>
                        {isViewMode ? formData.patientGender : (
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {['Male', 'Female', 'Other'].map((g) => (
                              <label key={g} style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '14px' }}>
                                <input
                                  type="checkbox"
                                  checked={formData.patientGender === g}
                                  onChange={() => setFormData(prev => ({ ...prev, patientGender: g }))}
                                  style={{ cursor: 'pointer' }}
                                />
                                {g}
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {(!isGenerating || formData.clinicalSummary?.trim()) && (
            <div style={{ marginBottom: '12px' }}>
              <div style={{ backgroundColor: colors.headerBg, color: 'white', padding: '8px 12px', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }}>CLINICAL SUMMARY</div>
              <div style={{ border: `1px solid ${colors.borderColor}`, padding: '12px', minHeight: '80px', backgroundColor: colors.leftColBg }}>
                {isViewMode ? (
                  <div style={{ whiteSpace: 'pre-wrap' }}>{formData.clinicalSummary}</div>
                ) : (
                  <textarea name="clinicalSummary" placeholder="Enter clinical summary..." value={formData.clinicalSummary} onChange={handleInputChange} style={textareaStyle} rows={3}></textarea>
                )}
              </div>
            </div>
          )}

          <div style={{ marginBottom: '12px' }}>
            <div style={{ backgroundColor: colors.headerBg, color: 'white', padding: '8px 12px', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }}>PRESCRIBED MEDICINES</div>
            
            {isGenerating && medicines.filter(med => med.name.trim() || med.dosage.trim() || med.instructions.trim()).length === 0 ? (
              <div style={{ border: `1px solid ${colors.borderColor}`, padding: '12px', backgroundColor: colors.leftColBg, marginTop: '8px', textAlign: 'center', fontStyle: 'italic', color: '#64748b' }}>
                No prescribed medicines
              </div>
            ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', marginTop: '8px', tableLayout: 'fixed', wordWrap: 'break-word' }}>
              <thead>
                <tr style={{ backgroundColor: colors.headerBg, color: 'white', fontSize: '15px' }}>
                  <th style={{ border: `1px solid ${colors.borderColor}`, padding: '6px', width: '5%', whiteSpace: 'nowrap' }}>S.No</th>
                  <th style={{ border: `1px solid ${colors.borderColor}`, padding: '6px', width: '25%', whiteSpace: 'nowrap' }}>Medicine Name</th>
                  <th style={{ border: `1px solid ${colors.borderColor}`, padding: '6px', width: '10%', whiteSpace: 'nowrap' }}>Dosage</th>
                  <th style={{ border: `1px solid ${colors.borderColor}`, padding: '6px', width: '20%', whiteSpace: 'nowrap' }}>Frequency (M - A - N)</th>
                  <th style={{ border: `1px solid ${colors.borderColor}`, padding: '6px', width: '15%', whiteSpace: 'nowrap' }}>Duration</th>
                  <th style={{ border: `1px solid ${colors.borderColor}`, padding: '6px', width: '25%', whiteSpace: 'nowrap' }}>Instructions</th>
                </tr>
              </thead>
              <tbody>
                {medicines.map((med, idx) => {
                  if (isGenerating && !med.name.trim() && !med.dosage.trim() && !med.instructions.trim()) {
                    return null;
                  }
                  return (
                  <tr key={idx} style={{ position: 'relative', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                    <td style={{ border: `1px solid ${colors.borderColor}`, padding: '8px' }}>{idx + 1}</td>
                    <td style={{ border: `1px solid ${colors.borderColor}`, padding: '8px', textAlign: 'left' }}>
                      {isViewMode ? med.name : <input placeholder="Paracetamol 650mg" value={med.name} onChange={(e) => handleMedicineChange(idx, 'name', e.target.value)} style={inputStyle} />}
                    </td>
                    <td style={{ border: `1px solid ${colors.borderColor}`, padding: '8px' }}>
                      {isViewMode ? med.dosage : <input placeholder="1 Tab" value={med.dosage} onChange={(e) => handleMedicineChange(idx, 'dosage', e.target.value)} style={inputStyle} />}
                    </td>
                    <td style={{ border: `1px solid ${colors.borderColor}`, padding: '8px', whiteSpace: 'nowrap', position: 'static' }}>
                      {isViewMode ? (
                        renderFrequencyPDF(med.frequency)
                      ) : (
                        <div style={{ position: 'relative', textAlign: 'left' }}>
                           <FrequencySelector value={med.frequency} onChange={(v) => handleMedicineChange(idx, 'frequency', v)} />
                        </div>
                      )}
                    </td>
                    <td style={{ border: `1px solid ${colors.borderColor}`, padding: '8px', position: 'static' }}>
                      {isViewMode ? med.duration : (
                        <div style={{ position: 'relative', textAlign: 'left' }}>
                           <DurationSelector value={med.duration} onChange={(v) => handleMedicineChange(idx, 'duration', v)} />
                        </div>
                      )}
                    </td>
                    <td style={{ border: `1px solid ${colors.borderColor}`, padding: '8px', position: 'static' }}>
                      {isViewMode ? med.instructions : (
                        <div style={{ position: 'relative', textAlign: 'left' }}>
                           <InstructionsSelector value={med.instructions} onChange={(v) => handleMedicineChange(idx, 'instructions', v)} />
                        </div>
                      )}
                      
                      {!isGenerating && (
                        <button data-html2canvas-ignore="true" onClick={() => removeMedicine(idx)} style={{ position: 'absolute', right: '-30px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                          <Trash2 size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
            )}
            
            {!isGenerating && (
              <div data-html2canvas-ignore="true" style={{ marginTop: '8px' }}>
                <button onClick={addMedicine} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', backgroundColor: '#e0f2fe', color: '#0ea5e9', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
                  <Plus size={14} /> Add Medicine
                </button>
              </div>
            )}
            
            {!isGenerating && (
              <div data-html2canvas-ignore="true" style={{ fontSize: '12px', marginTop: '8px', color: '#64748b' }}>+ Add more medicines on a continuation sheet if required.</div>
            )}
          </div>

          {(!isGenerating || formData.investigations?.trim()) && (
            <div style={{ marginBottom: '12px', pageBreakInside: 'avoid', breakInside: 'avoid', paddingTop: '1px' }}>
              <div style={{ backgroundColor: colors.headerBg, color: 'white', padding: '8px 12px', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }}>INVESTIGATIONS</div>
              <div style={{ border: `1px solid ${colors.borderColor}`, padding: '12px', minHeight: '60px', backgroundColor: colors.leftColBg }}>
                {isViewMode ? (
                  <div style={{ whiteSpace: 'pre-wrap' }}>{formData.investigations}</div>
                ) : (
                  <textarea name="investigations" placeholder="Example: CBC, Blood Sugar, HbA1c, TSH, Lipid Profile..." value={formData.investigations} onChange={handleInputChange} style={textareaStyle} rows={2}></textarea>
                )}
              </div>
            </div>
          )}

          {(!isGenerating || formData.advice?.trim()) && (
            <div style={{ marginBottom: '12px', pageBreakInside: 'avoid', breakInside: 'avoid', paddingTop: '1px' }}>
              <div style={{ backgroundColor: colors.headerBg, color: 'white', padding: '8px 12px', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }}>ADVICE</div>
              <div style={{ border: `1px solid ${colors.borderColor}`, padding: '12px', minHeight: '60px', backgroundColor: colors.leftColBg }}>
                {isViewMode ? (
                  <div style={{ whiteSpace: 'pre-wrap' }}>{formData.advice}</div>
                ) : (
                  <textarea name="advice" placeholder='Placeholder: "Drink plenty of water, adequate rest, steam inhalation"' value={formData.advice} onChange={handleInputChange} style={textareaStyle} rows={2}></textarea>
                )}
              </div>
            </div>
          )}

          <div style={{ marginBottom: '12px', pageBreakInside: 'avoid', breakInside: 'avoid', paddingTop: '1px' }}>
            <div style={{ backgroundColor: colors.headerBg, color: 'white', padding: '8px 12px', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }}>IMPORTANT DISCLAIMER</div>
            <ul style={{ fontSize: '12px', paddingLeft: '20px', marginTop: '8px' }}>
              <li style={{ marginBottom: '4px' }}>This prescription has been generated following a telemedicine consultation.</li>
              <li style={{ marginBottom: '4px' }}>The prescription is based on information provided by the patient during the consultation.</li>
              <li style={{ marginBottom: '4px' }}>Benva Healthcare acts solely as a technology platform facilitating consultation between the patient and Registered Medical Practitioner.</li>
              <li style={{ marginBottom: '4px' }}>Medical responsibility for diagnosis, treatment and prescription rests solely with the consulting Registered Medical Practitioner.</li>
              <li style={{ marginBottom: '4px' }}>Certain medical conditions may require physical examination and in-person consultation.</li>
              <li style={{ marginBottom: '4px' }}>In case of emergency, visit the nearest hospital immediately or call the Emergency Helpline number provided.</li>
            </ul>
          </div>

          <div style={{ marginBottom: '12px', pageBreakInside: 'avoid', breakInside: 'avoid', paddingTop: '1px' }}>
            <div style={{ backgroundColor: colors.headerBg, color: 'white', padding: '8px 12px', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }}>DOCTOR DIGITAL SIGNATURE</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', wordWrap: 'break-word' }}>
              <tbody>
                <tr>
                  <td style={{ border: `1px solid ${colors.borderColor}`, padding: '8px', width: '30%', backgroundColor: colors.leftColBg, fontWeight: 'bold', color: colors.headerBg, height: '60px' }}>Doctor Signature</td>
                  <td style={{ border: `1px solid ${colors.borderColor}`, padding: '8px', verticalAlign: 'bottom', fontStyle: 'italic', color: colors.headerBg }}>
                    {doctorProfile?.signature || ''}
                  </td>
                </tr>
                <tr>
                  <td style={{ border: `1px solid ${colors.borderColor}`, padding: '8px', backgroundColor: colors.leftColBg, fontWeight: 'bold', color: colors.headerBg }}>Doctor Name</td>
                  <td style={{ border: `1px solid ${colors.borderColor}`, padding: '8px' }}>{doctorProfile?.name || ''}</td>
                </tr>
                <tr>
                  <td style={{ border: `1px solid ${colors.borderColor}`, padding: '8px', backgroundColor: colors.leftColBg, fontWeight: 'bold', color: colors.headerBg }}>Qualification</td>
                  <td style={{ border: `1px solid ${colors.borderColor}`, padding: '8px' }}>{doctorProfile?.qualification || ''}</td>
                </tr>
                <tr>
                  <td style={{ border: `1px solid ${colors.borderColor}`, padding: '8px', backgroundColor: colors.leftColBg, fontWeight: 'bold', color: colors.headerBg }}>Registration Number</td>
                  <td style={{ border: `1px solid ${colors.borderColor}`, padding: '8px' }}>{doctorProfile?.medicalCouncilReg || ''}</td>
                </tr>
              </tbody>
            </table>
            <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '14px', backgroundColor: colors.leftColBg, padding: '8px', border: `1px solid ${colors.borderColor}`, color: colors.headerBg, fontWeight: 'bold' }}>
              ✓ Digitally Signed Prescription — No Physical Signature Required
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: `2px solid ${colors.headerBg}`, paddingTop: '10px', fontSize: '12px', color: '#64748b', marginTop: '40px' }}>
            <span><strong>Website:</strong> www.benvahealthcare.in</span>
            <span><strong>Contact:</strong> +91 91111 45556</span>
            <span><strong>Emergency Helpline:</strong> +91 91111 45556</span>
          </div>
        </div>
      </div>
      </div>
      </div>
      
      <div style={{ width: '100%', maxWidth: '980px', margin: '0 auto', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: '16px', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          {patientId && !isViewOnly && (
            <>
              <button onClick={() => router.back()} style={{ padding: '10px 20px', backgroundColor: '#f1f5f9', color: '#475569', borderRadius: '8px', fontWeight: 600, border: '1px solid #cbd5e1', cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={handleSaveToRecord} disabled={isSaving} style={{ padding: '10px 20px', backgroundColor: '#e0f2fe', color: '#0284c7', borderRadius: '8px', fontWeight: 600, border: 'none', cursor: isSaving ? 'not-allowed' : 'pointer', opacity: isSaving ? 0.7 : 1 }}>
                {isSaving ? 'Saving...' : 'Save as Draft'}
              </button>
              <button onClick={handleSubmitToAdmin} disabled={isSaving} style={{ padding: '10px 20px', backgroundColor: '#10b981', color: 'white', borderRadius: '8px', fontWeight: 600, border: 'none', cursor: isSaving ? 'not-allowed' : 'pointer', opacity: isSaving ? 0.7 : 1 }}>
                Submit to Admin
              </button>
            </>
          )}
          {fileId && (
            <>
              <button onClick={handleViewPDF} disabled={isGenerating} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: '#e2e8f0', color: '#0f172a', borderRadius: '8px', fontWeight: 600, border: 'none', cursor: isGenerating ? 'not-allowed' : 'pointer', opacity: isGenerating ? 0.7 : 1 }}>
                {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>}
                {isGenerating ? 'Wait...' : 'View PDF'}
              </button>
              <button onClick={generatePDF} disabled={isGenerating} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: '#38bdf8', color: '#0f172a', borderRadius: '8px', fontWeight: 600, border: 'none', cursor: isGenerating ? 'not-allowed' : 'pointer', opacity: isGenerating ? 0.7 : 1 }}>
                {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                {isGenerating ? 'Generating...' : 'Download PDF'}
              </button>
            </>
          )}
        </div>
      </div>

    </div>
  );
}
