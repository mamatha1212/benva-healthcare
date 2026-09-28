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
  const [prescriptions] = useState(initialPrescriptions);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingFile, setViewingFile] = useState<{ text: string, fileInfo: any } | null>(null);

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
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{file.patient.name}</div>
                    <div style={{ fontSize: '13px', color: '#64748b' }}>{file.patient.phone}</div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#e0e7ff', color: '#4338ca', padding: '4px 10px', borderRadius: '16px', fontSize: '13px', fontWeight: 600 }}>
                      Dr. {file.patient.consultant}
                    </span>
                  </td>
                  <td suppressHydrationWarning style={{ padding: '16px 24px', color: '#475569', fontSize: '14px' }}>
                    {new Date(file.createdAt).toLocaleString()}
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <button 
                      onClick={() => handleViewPrescription(file)}
                      style={{ background: '#3b82f6', border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, color: 'white', cursor: 'pointer', transition: 'all 0.2s' }}
                    >
                      View Prescription
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
                        <span style={{ fontSize: '13px', color: '#0f172a', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '120px' }}>{viewingFile.fileInfo.patient.name}</span>
                      </div>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#e0e7ff', padding: '6px 12px', borderRadius: '20px', border: '1px solid #c7d2fe', whiteSpace: 'nowrap' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4338ca" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
                        <span style={{ fontSize: '12px', color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Doctor:</span>
                        <span style={{ fontSize: '13px', color: '#4338ca', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '120px' }}>Dr. {viewingFile.fileInfo.patient.consultant}</span>
                      </div>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#f8fafc', padding: '6px 12px', borderRadius: '20px', border: '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                        <span style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Date:</span>
                        <span style={{ fontSize: '13px', color: '#475569', fontWeight: 600 }}>{new Date(viewingFile.fileInfo.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
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
                try {
                  const parsed = JSON.parse(viewingFile.text);
                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                      
                      {/* Grid for top info */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                        <div style={{ flex: '1 1 min(100%, 250px)', background: '#ffffff', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <div style={{ background: '#f1f5f9', padding: '6px', borderRadius: '8px', color: '#475569' }}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
                            </div>
                            <span style={{ color: '#64748b', fontSize: '12px', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Consultation Mode</span>
                          </div>
                          <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '15px' }}>{parsed.consultationMode || 'N/A'}</div>
                        </div>

                        <div style={{ flex: '1 1 min(100%, 250px)', background: '#ffffff', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <div style={{ background: '#f0fdf4', padding: '6px', borderRadius: '8px', color: '#16a34a' }}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                            </div>
                            <span style={{ color: '#64748b', fontSize: '12px', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Status</span>
                          </div>
                          <div style={{ fontWeight: 600, color: '#16a34a', fontSize: '15px' }}>Completed</div>
                        </div>
                      </div>

                      {/* Clinical Summary */}
                      <div style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                          <span style={{ color: '#0f172a', fontSize: '14px', fontWeight: 700 }}>Clinical Summary</span>
                        </div>
                        <div style={{ color: '#334155', fontSize: '14px', lineHeight: '1.6', whiteSpace: 'pre-wrap', background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>{parsed.clinicalSummary || 'None'}</div>
                      </div>

                      {/* Medicines */}
                      {parsed.medicines && parsed.medicines.length > 0 && parsed.medicines.some((m:any) => m.name) && (
                        <div style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="8" width="18" height="4" rx="1"></rect><path d="M12 8v13"></path><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"></path><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"></path></svg>
                            <span style={{ color: '#0f172a', fontSize: '14px', fontWeight: 700 }}>Prescribed Medicines</span>
                          </div>
                          
                          <div style={{ borderRadius: '8px', border: '1px solid #e2e8f0', overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: '600px' }}>
                              <thead>
                                <tr style={{ background: '#f8fafc', color: '#475569', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
                                  <th style={{ padding: '12px 16px', fontWeight: 600, whiteSpace: 'nowrap' }}>Medicine Name</th>
                                  <th style={{ padding: '12px 16px', fontWeight: 600, whiteSpace: 'nowrap' }}>Dosage</th>
                                  <th style={{ padding: '12px 16px', fontWeight: 600, whiteSpace: 'nowrap' }}>Freq</th>
                                  <th style={{ padding: '12px 16px', fontWeight: 600, whiteSpace: 'nowrap' }}>Duration</th>
                                  <th style={{ padding: '12px 16px', fontWeight: 600, whiteSpace: 'nowrap' }}>Instructions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {parsed.medicines.filter((m:any) => m.name).map((med: any, idx: number) => (
                                  <tr key={idx} style={{ background: idx % 2 === 0 ? 'white' : '#fafaf9', borderBottom: idx !== parsed.medicines.filter((m:any) => m.name).length -1 ? '1px solid #f1f5f9' : 'none' }}>
                                    <td style={{ padding: '12px 16px', color: '#0f172a', fontWeight: 500, whiteSpace: 'nowrap' }}>{med.name}</td>
                                    <td style={{ padding: '12px 16px', color: '#475569', whiteSpace: 'nowrap' }}>{med.dosage}</td>
                                    <td style={{ padding: '12px 16px', color: '#475569', whiteSpace: 'nowrap' }}>
                                      <span style={{ background: '#e2e8f0', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap' }}>{med.frequency}</span>
                                    </td>
                                    <td style={{ padding: '12px 16px', color: '#475569', whiteSpace: 'nowrap' }}>{med.duration}</td>
                                    <td style={{ padding: '12px 16px', color: '#475569', whiteSpace: 'nowrap' }}>{med.instructions}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* Investigations & Advice */}
                      {/* Investigations & Advice */}
                      {parsed.investigations && (
                        <div style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                            <span style={{ color: '#0f172a', fontSize: '14px', fontWeight: 700 }}>Investigations</span>
                          </div>
                          <div style={{ color: '#334155', fontSize: '14px', lineHeight: '1.6', whiteSpace: 'pre-wrap', background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>{parsed.investigations}</div>
                        </div>
                      )}

                      {parsed.advice && (
                        <div style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                            <span style={{ color: '#0f172a', fontSize: '14px', fontWeight: 700 }}>Advice</span>
                          </div>
                          <div style={{ color: '#334155', fontSize: '14px', lineHeight: '1.6', whiteSpace: 'pre-wrap', background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>{parsed.advice}</div>
                        </div>
                      )}

                    </div>
                  );
                } catch (e) {
                  return (
                    <div style={{ background: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
                      <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '14px', lineHeight: '1.6', color: '#1e293b' }}>
                        {viewingFile.text}
                      </pre>
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
                    try {
                      const element = document.getElementById('prescription-pdf-content');
                      if (!element) return;
                      
                      const html2pdf = (await import('html2pdf.js')).default;
                      
                      const opt = {
                        margin:       10,
                        filename:     `prescription_${viewingFile?.fileInfo?.patient?.name || 'details'}.pdf`,
                        image:        { type: 'jpeg', quality: 0.98 },
                        html2canvas:  { scale: 2, useCORS: true },
                        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
                      };

                      const pdfBlob = await html2pdf().set(opt).from(element).output('blob');
                      const file = new File([pdfBlob], opt.filename, { type: 'application/pdf' });
                      
                      if (navigator.canShare && navigator.canShare({ files: [file] })) {
                        await navigator.share({
                          title: 'Prescription Details',
                          files: [file]
                        });
                      } else {
                        // Fallback: download if sharing files isn't supported
                        html2pdf().set(opt).from(element).save();
                      }
                    } catch (err) {
                      console.error('Failed to share PDF: ', err);
                      // Absolute fallback to text
                      const formattedText = getFormattedPrescription(viewingFile?.text || '');
                      navigator.clipboard.writeText(formattedText)
                        .then(() => alert('Prescription details copied to clipboard (PDF sharing not supported on this device)!'))
                        .catch(e => console.error('Failed to copy: ', e));
                    }
                  }}
                  style={{ background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', padding: '10px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '6px' }}
                  onMouseOver={(e) => { e.currentTarget.style.background = '#dbeafe'; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = '#eff6ff'; }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                  Share
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
    </div>
  );
}
