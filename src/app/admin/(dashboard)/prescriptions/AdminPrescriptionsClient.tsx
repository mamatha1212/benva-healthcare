'use client';

import React, { useState } from 'react';

const getFormattedPrescription = (rawText: string) => {
  try {
    const parsed = JSON.parse(rawText);
    let out = `Prescription Details\n`;
    out += `====================\n\n`;
    
    if (parsed.consultationMode) out += `Consultation Mode: ${parsed.consultationMode}\n`;
    if (parsed.clinicalSummary) out += `Clinical Summary: ${parsed.clinicalSummary}\n\n`;
    
    if (parsed.medicines && Array.isArray(parsed.medicines) && parsed.medicines.length > 0) {
      out += `Medicines:\n`;
      parsed.medicines.forEach((m: any, i: number) => {
        if(m.name) out += `${i+1}. ${m.name} - ${m.dosage} (${m.frequency}) for ${m.duration} [${m.instructions}]\n`;
      });
      out += `\n`;
    }
    
    if (parsed.investigations) out += `Investigations:\n${parsed.investigations}\n\n`;
    if (parsed.advice) out += `Advice:\n${parsed.advice}\n`;
    
    return out.trim();
  } catch(e) {
    return rawText;
  }
};

export default function AdminPrescriptionsClient({ initialPrescriptions }: { initialPrescriptions: any[] }) {
  const [prescriptions, setPrescriptions] = useState(initialPrescriptions);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingFile, setViewingFile] = useState<{ text: string, fileInfo: any } | null>(null);
  const [editingFile, setEditingFile] = useState<any>(null);
  const [editData, setEditData] = useState<any>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const filteredPrescriptions = prescriptions.filter(p => 
    p.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.patient.consultant?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewPrescription = (file: any) => {
    if (file.fileUrl.startsWith('data:')) {
      try {
        const base64Data = file.fileUrl.split(',')[1];
        const decodedText = atob(base64Data);
        setViewingFile({ text: decodedText, fileInfo: file });
      } catch (e) {
        window.open(file.fileUrl);
      }
    } else {
      window.open(file.fileUrl, '_blank');
    }
  };

  const handleDeletePrescription = async (id: string) => {
    if (!confirm('Are you sure you want to delete this prescription? This action cannot be undone.')) return;
    
    try {
      const res = await fetch(`/api/admin/prescriptions/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setPrescriptions(prev => prev.filter(p => p.id !== id));
      } else {
        alert('Failed to delete prescription');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting prescription');
    }
  };

  const handleEditClick = (file: any) => {
    if (file.fileUrl.startsWith('data:')) {
      try {
        const decodedText = atob(file.fileUrl.split(',')[1]);
        const parsed = JSON.parse(decodedText);
        setEditData(parsed);
        setEditingFile(file);
      } catch (e) {
        alert('Cannot parse prescription data for editing. It might be corrupt.');
      }
    } else {
      alert('Cannot edit external image/PDF prescriptions. Only digital prescriptions can be edited.');
    }
  };

  const handleSaveEdit = async () => {
    if (!editData) return;
    setIsSavingEdit(true);
    try {
      const encoded = 'data:text/plain;base64,' + btoa(JSON.stringify(editData));
      const res = await fetch(`/api/admin/prescriptions/${editingFile.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileUrl: encoded })
      });
      if (res.ok) {
        setPrescriptions(prev => prev.map(p => p.id === editingFile.id ? { ...p, fileUrl: encoded } : p));
        setEditingFile(null);
      } else {
        alert('Failed to save changes');
      }
    } catch (err) {
      console.error(err);
      alert('Error saving changes');
    }
    setIsSavingEdit(false);
  };

  return (
    <div style={{ padding: 'clamp(12px, 3vw, 24px)', background: '#f8fafc', minHeight: '100vh', fontFamily: 'inherit' }}>
      <div style={{ background: 'white', borderRadius: '12px', padding: 'clamp(16px, 4vw, 32px)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ flex: '1 1 min(100%, 400px)' }}>
            <h1 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: 'bold', color: '#0f172a' }}>Submitted Prescriptions</h1>
            <p style={{ margin: 0, color: '#64748b', fontSize: '15px' }}>View medical notes and prescriptions finalized by doctors.</p>
          </div>
          
          <div style={{ position: 'relative', flex: '1 1 300px', maxWidth: '100%' }}>
            <input 
              type="text" 
              placeholder="Search by patient or doctor..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ padding: '10px 16px 10px 40px', borderRadius: '8px', border: '1px solid #cbd5e1', width: '100%', fontSize: '14px' }}
            />
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#94a3b8' }}>
              <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
        </div>

        <div style={{ borderRadius: '8px', border: '1px solid #e2e8f0', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
            <thead>
              <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '16px 24px', color: '#64748b', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Patient</th>
                <th style={{ padding: '16px 24px', color: '#64748b', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Doctor</th>
                <th style={{ padding: '16px 24px', color: '#64748b', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date Submitted</th>
                <th style={{ padding: '16px 24px', color: '#64748b', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPrescriptions.map(file => (
                <tr key={file.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{file?.patient?.name || 'Unknown Patient'}</div>
                    <div style={{ fontSize: '13px', color: '#64748b' }}>{file?.patient?.phone || 'No phone'}</div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#e0e7ff', color: '#4338ca', padding: '4px 10px', borderRadius: '16px', fontSize: '13px', fontWeight: 600 }}>
                      Dr. {file?.patient?.consultant || 'Unknown'}
                    </span>
                  </td>
                  <td suppressHydrationWarning style={{ padding: '16px 24px', color: '#475569', fontSize: '14px' }}>
                    {file.createdAt ? new Date(file.createdAt).toLocaleString() : 'Unknown Date'}
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <button 
                      onClick={() => handleViewPrescription(file)}
                      style={{ background: '#3b82f6', border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, color: 'white', cursor: 'pointer', transition: 'all 0.2s', marginRight: '8px' }}
                    >
                      View
                    </button>
                    <button 
                      onClick={() => handleEditClick(file)}
                      style={{ background: '#f59e0b', border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, color: 'white', cursor: 'pointer', transition: 'all 0.2s', marginRight: '8px' }}
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeletePrescription(file.id)}
                      style={{ background: '#ef4444', border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, color: 'white', cursor: 'pointer', transition: 'all 0.2s' }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {filteredPrescriptions.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ padding: '64px 24px', textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '50%', background: '#f1f5f9', color: '#94a3b8', marginBottom: '16px' }}>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                    </div>
                    <h3 style={{ color: '#0f172a', fontSize: '16px', fontWeight: 600, margin: '0 0 8px 0' }}>No Submitted Prescriptions</h3>
                    <p style={{ color: '#64748b', margin: 0, maxWidth: '300px', marginLeft: 'auto', marginRight: 'auto', fontSize: '14px' }}>
                      {searchTerm ? 'No prescriptions match your search.' : 'There are no finalized prescriptions submitted by doctors yet.'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {viewingFile && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 'clamp(12px, 3vw, 24px)', animation: 'fadeIn 0.2s ease-out' }}>
          <div style={{ background: 'white', padding: '0', borderRadius: '16px', width: '100%', maxWidth: '700px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            
            {/* Scrollable Wrapper */}
            <div style={{ flex: 1, overflowY: 'auto', background: '#fafaf9' }}>
              
              {/* PDF Target Container */}
              <div id="prescription-pdf-content" style={{ display: 'flex', flexDirection: 'column', background: '#fafaf9' }}>
                
                {/* Header */}
                <div style={{ padding: 'clamp(16px, 4vw, 24px) clamp(16px, 5vw, 32px)', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', background: '#ffffff', gap: '12px' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h2 style={{ margin: '0 0 12px 0', fontSize: 'clamp(18px, 5vw, 22px)', fontWeight: '700', color: '#0f172a', letterSpacing: '-0.02em', wordBreak: 'break-word' }}>Prescription Details</h2>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#f8fafc', padding: '6px 12px', borderRadius: '20px', border: '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                        <span style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Patient:</span>
                        <span style={{ fontSize: '13px', color: '#0f172a', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '120px' }}>{viewingFile?.fileInfo?.patient?.name || 'Unknown'}</span>
                      </div>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#e0e7ff', padding: '6px 12px', borderRadius: '20px', border: '1px solid #c7d2fe', whiteSpace: 'nowrap' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4338ca" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
                        <span style={{ fontSize: '12px', color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Doctor:</span>
                        <span style={{ fontSize: '13px', color: '#4338ca', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '120px' }}>Dr. {viewingFile?.fileInfo?.patient?.consultant || 'Unknown'}</span>
                      </div>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#f8fafc', padding: '6px 12px', borderRadius: '20px', border: '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                        <span style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Date:</span>
                        <span style={{ fontSize: '13px', color: '#475569', fontWeight: 600 }}>{viewingFile?.fileInfo?.createdAt ? new Date(viewingFile.fileInfo.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'Unknown'}</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    data-html2canvas-ignore="true"
                    onClick={() => setViewingFile(null)}
                    style={{ flexShrink: 0, background: '#f8fafc', border: '1px solid #e2e8f0', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', cursor: 'pointer', transition: 'all 0.2s ease' }}
                    onMouseOver={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#0f172a'; }}
                    onMouseOut={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = '#64748b'; }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                </div>
                
                {/* Body */}
                <div style={{ padding: 'clamp(16px, 5vw, 32px)' }}>
                {(() => {
                const colors = {
                  headerBg: '#0f3162',
                  leftColBg: '#eaf1f8',
                  borderColor: '#8caecc',
                  textColor: 'black'
                };
              
                const renderFrequencyPDF = (freq: any) => {
                  if (!freq || typeof freq !== 'string') return <>M [   ] &nbsp; A [   ] &nbsp; N [   ]</>;
                  if (freq === 'SOS') return <span>SOS</span>;
                  const parts = freq.split('-');
                  if (parts.length === 3) {
                    const m = parts[0] === '1' ? 'X' : ' ';
                    const a = parts[1] === '1' ? 'X' : ' ';
                    const n = parts[2] === '1' ? 'X' : ' ';
                    return <>M [ {m} ] &nbsp; A [ {a} ] &nbsp; N [ {n} ]</>;
                  }
                  return <span>{freq}</span>;
                };

                try {
                  let parsed = {};
                  try { parsed = JSON.parse(viewingFile?.text || '{}'); } catch(e) {}
                  const patient = viewingFile?.fileInfo?.patient || {};
                  
                  return (
                    <div style={{ padding: 'clamp(10px, 3vw, 20px)', background: '#f8fafc', overflowX: 'auto', width: '100%' }}>
                      <div id="prescription-pdf-content" style={{ margin: '0 auto', minWidth: '210mm', width: '210mm', minHeight: '297mm', padding: '10mm', backgroundColor: 'white', fontFamily: '"Times New Roman", Times, serif', color: colors.textColor, fontSize: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                        <style dangerouslySetInnerHTML={{ __html: `
                          #prescription-pdf-content, #prescription-pdf-content * {
                            box-sizing: border-box !important;
                          }
                        ` }} />
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', borderBottom: `2px solid ${colors.headerBg}`, paddingBottom: '24px', marginBottom: '24px', paddingTop: '16px' }}>
                          <div style={{ height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                            <img src="/images/Benva%20NEW.png" alt="Benva Healthcare" style={{ width: '380px', height: 'auto', objectFit: 'contain' }} />
                          </div>
                        </div>

                        <h2 style={{ textAlign: 'center', color: colors.headerBg, fontSize: '20px', marginBottom: '20px', fontFamily: 'Arial, sans-serif' }}>TELEMEDICINE PRESCRIPTION</h2>

                        {/* Doctor Details */}
                        <div style={{ marginBottom: '20px' }}>
                          <div style={{ backgroundColor: colors.headerBg, color: 'white', padding: '8px 12px', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }}>DOCTOR DETAILS <span style={{ fontSize: '12px', fontWeight: 'normal', fontStyle: 'italic' }}>(AUTO)</span></div>
                          <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', wordWrap: 'break-word' }}>
                            <tbody>
                              <tr>
                                <td style={{ border: `1px solid ${colors.borderColor}`, padding: '8px', width: '30%', backgroundColor: colors.leftColBg, fontWeight: 'bold', color: colors.headerBg }}>Doctor Name</td>
                                <td style={{ border: `1px solid ${colors.borderColor}`, padding: '8px' }}>Dr. {patient.consultant || ''}</td>
                              </tr>
                              {viewingFile.fileInfo.doctorProfile?.qualification && (
                                <tr>
                                  <td style={{ border: `1px solid ${colors.borderColor}`, padding: '8px', backgroundColor: colors.leftColBg, fontWeight: 'bold', color: colors.headerBg }}>Qualification</td>
                                  <td style={{ border: `1px solid ${colors.borderColor}`, padding: '8px' }}>{viewingFile.fileInfo.doctorProfile.qualification}</td>
                                </tr>
                              )}
                              {viewingFile?.fileInfo?.doctorProfile?.speciality && (
                                <tr>
                                  <td style={{ border: `1px solid ${colors.borderColor}`, padding: '8px', backgroundColor: colors.leftColBg, fontWeight: 'bold', color: colors.headerBg }}>Speciality</td>
                                  <td style={{ border: `1px solid ${colors.borderColor}`, padding: '8px' }}>{viewingFile.fileInfo.doctorProfile.speciality}</td>
                                </tr>
                              )}
                              {viewingFile?.fileInfo?.doctorProfile?.medicalCouncilReg && (
                                <tr>
                                  <td style={{ border: `1px solid ${colors.borderColor}`, padding: '8px', backgroundColor: colors.leftColBg, fontWeight: 'bold', color: colors.headerBg }}>Medical Council Reg. No.</td>
                                  <td style={{ border: `1px solid ${colors.borderColor}`, padding: '8px' }}>{viewingFile.fileInfo.doctorProfile.medicalCouncilReg}</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                        
                        {/* Consultation Details */}
                        <div style={{ marginBottom: '20px' }}>
                          <div style={{ backgroundColor: colors.headerBg, color: 'white', padding: '8px 12px', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }}>CONSULTATION DETAILS</div>
                          <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', wordWrap: 'break-word' }}>
                            <tbody>
                              <tr>
                                <td style={{ border: `1px solid ${colors.borderColor}`, padding: '8px', width: '30%', backgroundColor: colors.leftColBg, fontWeight: 'bold', color: colors.headerBg }}>Consultation Date</td>
                                <td style={{ border: `1px solid ${colors.borderColor}`, padding: '8px' }}>
                                  {viewingFile?.fileInfo?.createdAt ? new Date(viewingFile.fileInfo.createdAt).toLocaleDateString() : 'Unknown'}
                                </td>
                              </tr>
                              <tr>
                                <td style={{ border: `1px solid ${colors.borderColor}`, padding: '8px', backgroundColor: colors.leftColBg, fontWeight: 'bold', color: colors.headerBg }}>Consultation Mode</td>
                                <td style={{ border: `1px solid ${colors.borderColor}`, padding: '8px' }}>
                                  {parsed.consultationMode || 'N/A'}
                                </td>
                              </tr>
                              <tr>
                                <td style={{ border: `1px solid ${colors.borderColor}`, padding: '8px', backgroundColor: colors.leftColBg, fontWeight: 'bold', color: colors.headerBg }}>Full Name</td>
                                <td style={{ border: `1px solid ${colors.borderColor}`, padding: '8px' }}>
                                  {patient.name || ''}
                                </td>
                              </tr>
                              <tr>
                                <td style={{ border: `1px solid ${colors.borderColor}`, padding: '0', height: '100%' }} colSpan={2}>
                                  <div style={{ display: 'flex', height: '100%' }}>
                                    <div style={{ width: '30%', padding: '8px', backgroundColor: colors.leftColBg, fontWeight: 'bold', color: colors.headerBg, borderRight: `1px solid ${colors.borderColor}` }}>Age</div>
                                    <div style={{ width: '20%', padding: '8px', borderRight: `1px solid ${colors.borderColor}` }}>
                                      {patient.age || parsed.patientAge || ''}
                                    </div>
                                    <div style={{ width: '25%', padding: '8px', backgroundColor: colors.leftColBg, fontWeight: 'bold', color: colors.headerBg, borderRight: `1px solid ${colors.borderColor}` }}>Gender</div>
                                    <div style={{ width: '25%', padding: '8px' }}>
                                      {patient.gender || parsed.patientGender || ''}
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                        
                        {/* Clinical Summary */}
                        <div style={{ marginBottom: '20px' }}>
                          <div style={{ backgroundColor: colors.headerBg, color: 'white', padding: '8px 12px', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }}>CLINICAL SUMMARY</div>
                          <div style={{ border: `1px solid ${colors.borderColor}`, padding: '12px', minHeight: '80px', backgroundColor: colors.leftColBg }}>
                            <div style={{ whiteSpace: 'pre-wrap' }}>{parsed.clinicalSummary}</div>
                          </div>
                        </div>

                        {/* Medicines */}
                        {Array.isArray(parsed.medicines) && parsed.medicines.length > 0 && parsed.medicines.some((m:any) => m && m.name) && (
                          <div style={{ marginBottom: '20px' }}>
                            <div style={{ backgroundColor: colors.headerBg, color: 'white', padding: '8px 12px', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }}>PRESCRIBED MEDICINES</div>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', tableLayout: 'fixed', wordWrap: 'break-word' }}>
                              <thead>
                                <tr style={{ backgroundColor: colors.headerBg, color: 'white' }}>
                                  <th style={{ border: `1px solid ${colors.borderColor}`, padding: '8px', width: '5%' }}>S.No</th>
                                  <th style={{ border: `1px solid ${colors.borderColor}`, padding: '8px', width: '25%' }}>Medicine Name</th>
                                  <th style={{ border: `1px solid ${colors.borderColor}`, padding: '8px', width: '10%' }}>Dosage</th>
                                  <th style={{ border: `1px solid ${colors.borderColor}`, padding: '8px', width: '20%' }}>Frequency (M / A / N)</th>
                                  <th style={{ border: `1px solid ${colors.borderColor}`, padding: '8px', width: '15%' }}>Duration</th>
                                  <th style={{ border: `1px solid ${colors.borderColor}`, padding: '8px', width: '25%' }}>Instructions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {Array.isArray(parsed.medicines) && parsed.medicines.map((med: any, idx: number) => {
                                  if (!med || typeof med !== 'object' || !med.name) return null;
                                  return (
                                    <tr key={idx}>
                                      <td style={{ border: `1px solid ${colors.borderColor}`, padding: '8px' }}>{idx + 1}</td>
                                      <td style={{ border: `1px solid ${colors.borderColor}`, padding: '8px', textAlign: 'left' }}>{med.name}</td>
                                      <td style={{ border: `1px solid ${colors.borderColor}`, padding: '8px' }}>{med.dosage}</td>
                                      <td style={{ border: `1px solid ${colors.borderColor}`, padding: '8px', whiteSpace: 'nowrap' }}>
                                        {renderFrequencyPDF(med.frequency)}
                                      </td>
                                      <td style={{ border: `1px solid ${colors.borderColor}`, padding: '8px' }}>{med.duration}</td>
                                      <td style={{ border: `1px solid ${colors.borderColor}`, padding: '8px' }}>{med.instructions}</td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}

                        {/* Investigations */}
                        {!isGeneratingPdf && parsed.investigations && (
                          <div data-html2canvas-ignore="true" style={{ marginBottom: '20px' }}>
                            <div style={{ backgroundColor: colors.headerBg, color: 'white', padding: '8px 12px', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }}>INVESTIGATIONS</div>
                            <div style={{ border: `1px solid ${colors.borderColor}`, padding: '12px', minHeight: '60px', backgroundColor: colors.leftColBg }}>
                              <div style={{ whiteSpace: 'pre-wrap' }}>{parsed.investigations}</div>
                            </div>
                          </div>
                        )}

                        {/* Advice */}
                        {!isGeneratingPdf && parsed.advice && (
                          <div data-html2canvas-ignore="true" style={{ marginBottom: '20px' }}>
                            <div style={{ backgroundColor: colors.headerBg, color: 'white', padding: '8px 12px', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }}>ADVICE</div>
                            <div style={{ border: `1px solid ${colors.borderColor}`, padding: '12px', minHeight: '60px', backgroundColor: colors.leftColBg }}>
                              <div style={{ whiteSpace: 'pre-wrap' }}>{parsed.advice}</div>
                            </div>
                          </div>
                        )}

                        <div style={{ marginBottom: '20px' }}>
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

                        <div style={{ marginBottom: '20px', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                          <div style={{ backgroundColor: colors.headerBg, color: 'white', padding: '8px 12px', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }}>DOCTOR DIGITAL SIGNATURE</div>
                          <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', wordWrap: 'break-word' }}>
                            <tbody>
                              <tr>
                                <td style={{ border: `1px solid ${colors.borderColor}`, padding: '8px', width: '30%', backgroundColor: colors.leftColBg, fontWeight: 'bold', color: colors.headerBg, height: '60px' }}>Doctor Signature</td>
                                <td style={{ border: `1px solid ${colors.borderColor}`, padding: '8px', verticalAlign: 'bottom', fontStyle: 'italic', color: colors.headerBg }}>
                                  {viewingFile?.fileInfo?.doctorProfile?.signature || ''}
                                </td>
                              </tr>
                              <tr>
                                <td style={{ border: `1px solid ${colors.borderColor}`, padding: '8px', backgroundColor: colors.leftColBg, fontWeight: 'bold', color: colors.headerBg }}>Doctor Name</td>
                                <td style={{ border: `1px solid ${colors.borderColor}`, padding: '8px' }}>Dr. {patient.consultant || ''}</td>
                              </tr>
                              {viewingFile.fileInfo.doctorProfile?.qualification && (
                                <tr>
                                  <td style={{ border: `1px solid ${colors.borderColor}`, padding: '8px', backgroundColor: colors.leftColBg, fontWeight: 'bold', color: colors.headerBg }}>Qualification</td>
                                  <td style={{ border: `1px solid ${colors.borderColor}`, padding: '8px' }}>{viewingFile.fileInfo.doctorProfile.qualification}</td>
                                </tr>
                              )}
                              {viewingFile?.fileInfo?.doctorProfile?.medicalCouncilReg && (
                                <tr>
                                  <td style={{ border: `1px solid ${colors.borderColor}`, padding: '8px', backgroundColor: colors.leftColBg, fontWeight: 'bold', color: colors.headerBg }}>Registration Number</td>
                                  <td style={{ border: `1px solid ${colors.borderColor}`, padding: '8px' }}>{viewingFile.fileInfo.doctorProfile.medicalCouncilReg}</td>
                                </tr>
                              )}
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
                  );
                } catch (e) {
                  return (
                    <div style={{ background: '#ffffff', padding: '32px', borderRadius: '12px', border: '1px solid #e2e8f0', borderLeft: '4px solid #3b82f6', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)', position: 'relative', overflow: 'hidden' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '2px solid #f1f5f9' }}>
                        <div style={{ background: '#eff6ff', padding: '8px', borderRadius: '8px' }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                        </div>
                        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>Clinical Notes & Prescription</h3>
                      </div>
                      <div style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: '15px', lineHeight: '1.8', color: '#334155' }}>
                        {viewingFile?.text}
                      </div>
                    </div>
                  );
                }
              })()}
              
              </div> {/* Close Body */}
            </div> {/* Close PDF Target Container */}
            </div> {/* Close Scrollable Wrapper */}
            
            {/* Footer */}
            <div style={{ padding: 'clamp(12px, 4vw, 16px) clamp(16px, 5vw, 32px)', borderTop: '1px solid #f1f5f9', background: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  onClick={() => {
                    if (viewingFile?.text) {
                      const formattedText = getFormattedPrescription(viewingFile.text);
                      navigator.clipboard.writeText(formattedText)
                        .then(() => alert('Prescription details copied to clipboard!'))
                        .catch(err => console.error('Failed to copy: ', err));
                    }
                  }}
                  style={{ background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', padding: '10px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '6px' }}
                  onMouseOver={(e) => { e.currentTarget.style.background = '#e2e8f0'; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = '#f1f5f9'; }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                  Copy
                </button>
                <button 
                  onClick={async () => {
                    setIsGeneratingPdf(true);
                    setTimeout(async () => {
                      try {
                        const element = document.getElementById('prescription-pdf-content');
                        if (!element) return;
                        
                        const html2pdf = (await import('html2pdf.js')).default;
                        
                        const opt = {
                          margin:       [15, 0, 15, 0] as [number, number, number, number],
                          filename:     `prescription_${viewingFile?.fileInfo?.patient?.name || 'details'}.pdf`,
                          image:        { type: 'jpeg' as const, quality: 0.98 },
                          html2canvas:  { scale: 2, useCORS: true },
                          pagebreak:    { mode: ['css', 'legacy'] },
                          jsPDF:        { unit: 'mm' as const, format: 'a4', orientation: 'portrait' as const }
                        };

                        const pdfBlob = await html2pdf().set(opt).from(element).output('blob');
                        const file = new File([pdfBlob], opt.filename, { type: 'application/pdf' });
                        
                        if (navigator.canShare && navigator.canShare({ files: [file] })) {
                          await navigator.share({
                            title: 'Prescription Details',
                            files: [file]
                          });
                        } else {
                          html2pdf().set(opt).from(element).save();
                        }
                      } catch (err) {
                        console.error('Failed to share PDF: ', err);
                        const formattedText = getFormattedPrescription(viewingFile?.text || '');
                        if (navigator.share) {
                          navigator.share({ title: 'Prescription Details', text: formattedText }).catch(console.error);
                        } else {
                          navigator.clipboard.writeText(formattedText).then(() => alert('Copied to clipboard')).catch(console.error);
                        }
                      } finally {
                        setIsGeneratingPdf(false);
                      }
                    }, 150);
                  }}
                  style={{ background: '#38bdf8', color: '#0f172a', border: 'none', padding: '10px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '6px', opacity: isGeneratingPdf ? 0.7 : 1 }}
                  disabled={isGeneratingPdf}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                  {isGeneratingPdf ? 'Generating...' : 'Share / Download PDF'}
                </button>

              </div>
              <button 
                onClick={() => setViewingFile(null)}
                style={{ background: '#0f172a', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}
                onMouseOver={(e) => { e.currentTarget.style.background = '#1e293b'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseOut={(e) => { e.currentTarget.style.background = '#0f172a'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingFile && editData && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: 'clamp(12px, 3vw, 24px)', animation: 'fadeIn 0.2s ease-out' }}>
          <div style={{ background: 'white', padding: '0', borderRadius: '16px', width: '100%', maxWidth: '700px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            
            <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#0f172a' }}>Edit Prescription</h2>
              <button 
                onClick={() => setEditingFile(null)}
                style={{ background: '#e2e8f0', border: 'none', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', cursor: 'pointer' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* Clinical Summary */}
                <div>
                  <label style={{ display: 'block', fontWeight: 600, color: '#334155', marginBottom: '8px', fontSize: '14px' }}>Clinical Summary</label>
                  <textarea 
                    value={editData.clinicalSummary || ''} 
                    onChange={e => setEditData({...editData, clinicalSummary: e.target.value})} 
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', minHeight: '80px', fontFamily: 'inherit', fontSize: '14px', resize: 'vertical' }} 
                  />
                </div>

                {/* Medicines */}
                <div>
                  <label style={{ display: 'block', fontWeight: 600, color: '#334155', marginBottom: '8px', fontSize: '14px' }}>Medicines</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {editData.medicines?.map((med: any, idx: number) => (
                      <div key={idx} style={{ display: 'flex', gap: '8px', background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e2e8f0', width: '28px', height: '28px', borderRadius: '50%', fontSize: '13px', fontWeight: 'bold', color: '#475569', marginTop: '6px' }}>{idx + 1}</div>
                        <div style={{ flex: 1, minWidth: '200px' }}>
                          <input 
                            value={med.name || ''} 
                            onChange={e => {
                              const newMeds = [...editData.medicines];
                              newMeds[idx].name = e.target.value;
                              setEditData({...editData, medicines: newMeds});
                            }} 
                            placeholder="Medicine Name" 
                            style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }} 
                          />
                        </div>
                        <div style={{ width: '100px' }}>
                          <input 
                            value={med.dosage || ''} 
                            onChange={e => {
                              const newMeds = [...editData.medicines];
                              newMeds[idx].dosage = e.target.value;
                              setEditData({...editData, medicines: newMeds});
                            }} 
                            disabled={!med.name?.trim()}
                            placeholder="Dosage" 
                            style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', backgroundColor: !med.name?.trim() ? '#f1f5f9' : 'white', cursor: !med.name?.trim() ? 'not-allowed' : 'text' }} 
                          />
                        </div>
                        <div style={{ width: '120px' }}>
                          <input 
                            value={med.frequency || ''} 
                            onChange={e => {
                              const newMeds = [...editData.medicines];
                              newMeds[idx].frequency = e.target.value;
                              setEditData({...editData, medicines: newMeds});
                            }} 
                            disabled={!med.name?.trim()}
                            placeholder="Frequency" 
                            style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', backgroundColor: !med.name?.trim() ? '#f1f5f9' : 'white', cursor: !med.name?.trim() ? 'not-allowed' : 'text' }} 
                          />
                        </div>
                        <button 
                          onClick={() => {
                            const newMeds = editData.medicines.filter((_:any, i:number) => i !== idx);
                            setEditData({...editData, medicines: newMeds});
                          }}
                          style={{ background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '6px', padding: '0 12px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                  <button 
                    onClick={() => setEditData({...editData, medicines: [...(editData.medicines || []), { name: '', dosage: '', frequency: '', duration: '', instructions: '' }]})}
                    style={{ marginTop: '12px', background: 'transparent', color: '#3b82f6', border: 'none', fontWeight: 600, fontSize: '14px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    + Add Medicine
                  </button>
                </div>

                {/* Investigations */}
                <div>
                  <label style={{ display: 'block', fontWeight: 600, color: '#334155', marginBottom: '8px', fontSize: '14px' }}>Investigations (Optional)</label>
                  <input 
                    type="text"
                    value={editData.investigations || ''} 
                    onChange={e => setEditData({...editData, investigations: e.target.value})} 
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontFamily: 'inherit', fontSize: '14px' }} 
                  />
                </div>

                {/* Advice */}
                <div>
                  <label style={{ display: 'block', fontWeight: 600, color: '#334155', marginBottom: '8px', fontSize: '14px' }}>Advice (Optional)</label>
                  <textarea 
                    value={editData.advice || ''} 
                    onChange={e => setEditData({...editData, advice: e.target.value})} 
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', minHeight: '80px', resize: 'vertical', fontFamily: 'inherit', fontSize: '14px' }} 
                  />
                </div>
              </div>
            </div>

            <div style={{ padding: '20px 24px', borderTop: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button 
                onClick={() => setEditingFile(null)} 
                disabled={isSavingEdit}
                style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveEdit} 
                disabled={isSavingEdit}
                style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: '#3b82f6', color: 'white', fontWeight: 600, cursor: isSavingEdit ? 'not-allowed' : 'pointer', opacity: isSavingEdit ? 0.7 : 1 }}
              >
                {isSavingEdit ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
