'use client';

import React, { useState, useEffect } from 'react';

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

const formatDoctorName = (name?: string) => {
  if (!name) return 'Unknown';
  const clean = name.trim();
  if (clean.toLowerCase().startsWith('dr.') || clean.toLowerCase().startsWith('dr ')) {
    return clean;
  }
  return `Dr. ${clean}`;
};

export default function AdminPrescriptionsClient({ initialPrescriptions }: { initialPrescriptions: any[] }) {
  const [prescriptions, setPrescriptions] = useState(initialPrescriptions);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SUBMITTED' | 'DRAFT'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingFile, setViewingFile] = useState<{ text: string, fileInfo: any } | null>(null);
  const [editingFile, setEditingFile] = useState<any>(null);
  const [editData, setEditData] = useState<any>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfAction, setPdfAction] = useState<'share' | 'download' | null>(null);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [isBulkSubmitting, setIsBulkSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'fit' | 'full'>('fit');
  const [customZoom, setCustomZoom] = useState<number>(1);
  const previewAreaRef = React.useRef<HTMLDivElement>(null);
  const [previewAreaWidth, setPreviewAreaWidth] = useState<number>(800);

  useEffect(() => {
    if (!viewingFile) return;
    const updateAreaWidth = () => {
      if (previewAreaRef.current) {
        setPreviewAreaWidth(previewAreaRef.current.clientWidth);
      }
    };
    updateAreaWidth();
    window.addEventListener('resize', updateAreaWidth);
    return () => window.removeEventListener('resize', updateAreaWidth);
  }, [viewingFile]);

  const calculatedFitScale = Math.min(1, Math.max(0.35, (previewAreaWidth - 24) / 794));

  const fetchPrescriptions = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/admin/prescriptions', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setPrescriptions(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const filteredPrescriptions = prescriptions.filter(p => {
    const matchesSearch = 
      p.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.patient.consultant?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    if (statusFilter === 'SUBMITTED') return p.status === 'SUBMITTED';
    if (statusFilter === 'DRAFT') return p.status !== 'SUBMITTED';
    return true;
  });

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

  const draftCount = prescriptions.filter(p => p.status !== 'SUBMITTED').length;

  const handleMarkSubmitted = async (fileId: string) => {
    setSubmittingId(fileId);
    try {
      const res = await fetch(`/api/admin/prescriptions/${fileId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'SUBMITTED' })
      });
      if (res.ok) {
        setPrescriptions(prev => prev.map(p => p.id === fileId ? { ...p, status: 'SUBMITTED' } : p));
        await fetchPrescriptions();
      } else {
        alert('Failed to mark prescription as submitted.');
      }
    } catch (e) {
      console.error(e);
      alert('Error updating status.');
    } finally {
      setSubmittingId(null);
    }
  };

  const handleBulkSubmitDrafts = async () => {
    if (draftCount === 0) {
      alert('All prescriptions are already submitted!');
      return;
    }
    if (!confirm(`Are you sure you want to mark all ${draftCount} draft prescription(s) as Submitted to Admin?`)) return;

    setIsBulkSubmitting(true);
    try {
      const res = await fetch('/api/admin/prescriptions/bulk-submit', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setPrescriptions(prev => prev.map(p => ({ ...p, status: 'SUBMITTED' })));
        await fetchPrescriptions();
        alert(`Successfully submitted ${data.count || draftCount} prescription(s) to admin!`);
      } else {
        alert('Failed to bulk submit prescriptions.');
      }
    } catch (e) {
      console.error(e);
      alert('Error submitting drafts.');
    } finally {
      setIsBulkSubmitting(false);
    }
  };

  return (
    <div style={{ padding: 'clamp(12px, 3vw, 24px)', background: '#f8fafc', minHeight: '100vh', fontFamily: 'inherit' }}>
      <div style={{ background: 'white', borderRadius: '12px', padding: 'clamp(16px, 4vw, 32px)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ flex: '1 1 min(100%, 400px)' }}>
            <h1 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: 'bold', color: '#0f172a' }}>Prescriptions</h1>
            <p style={{ margin: 0, color: '#64748b', fontSize: '15px' }}>View all medical notes and prescriptions created by doctors.</p>
          </div>
          
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flex: '1 1 360px', maxWidth: '100%' }}>
            <div style={{ position: 'relative', flex: 1 }}>
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
            <button
              type="button"
              onClick={fetchPrescriptions}
              disabled={isRefreshing}
              title="Refresh prescriptions"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: 'white',
                color: '#475569',
                fontSize: '13px',
                fontWeight: 600,
                cursor: isRefreshing ? 'not-allowed' : 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              <svg style={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Filter Tabs and Bulk Submit */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button 
              type="button"
              onClick={() => setStatusFilter('ALL')} 
              style={{ 
                padding: '6px 16px', 
                borderRadius: '20px', 
                border: 'none', 
                background: statusFilter === 'ALL' ? '#02559d' : '#f1f5f9', 
                color: statusFilter === 'ALL' ? 'white' : '#475569', 
                fontWeight: 600, 
                fontSize: '13px', 
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              All ({prescriptions.length})
            </button>
            <button 
              type="button"
              onClick={() => setStatusFilter('SUBMITTED')} 
              style={{ 
                padding: '6px 16px', 
                borderRadius: '20px', 
                border: 'none', 
                background: statusFilter === 'SUBMITTED' ? '#16a34a' : '#f1f5f9', 
                color: statusFilter === 'SUBMITTED' ? 'white' : '#475569', 
                fontWeight: 600, 
                fontSize: '13px', 
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Submitted ({prescriptions.filter(p => p.status === 'SUBMITTED').length})
            </button>
            <button 
              type="button"
              onClick={() => setStatusFilter('DRAFT')} 
              style={{ 
                padding: '6px 16px', 
                borderRadius: '20px', 
                border: 'none', 
                background: statusFilter === 'DRAFT' ? '#d97706' : '#f1f5f9', 
                color: statusFilter === 'DRAFT' ? 'white' : '#475569', 
                fontWeight: 600, 
                fontSize: '13px', 
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Drafts / Saved ({draftCount})
            </button>
          </div>

          {draftCount > 0 && (
            <button
              type="button"
              onClick={handleBulkSubmitDrafts}
              disabled={isBulkSubmitting}
              title="Submit all existing doctor drafts to admin"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 18px',
                borderRadius: '8px',
                border: 'none',
                background: '#16a34a',
                color: 'white',
                fontWeight: 600,
                fontSize: '13px',
                cursor: isBulkSubmitting ? 'not-allowed' : 'pointer',
                opacity: isBulkSubmitting ? 0.7 : 1,
                boxShadow: '0 2px 4px rgba(22, 163, 74, 0.25)',
                transition: 'all 0.2s'
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              {isBulkSubmitting ? 'Submitting...' : `Submit All Drafts (${draftCount})`}
            </button>
          )}
        </div>

        <style dangerouslySetInnerHTML={{ __html: `
          @media (max-width: 767px) {
            .prescriptions-table-desktop { display: none !important; }
            .prescriptions-cards-mobile { display: flex !important; }
          }
          @media (min-width: 768px) {
            .prescriptions-table-desktop { display: block !important; }
            .prescriptions-cards-mobile { display: none !important; }
          }
        ` }} />

        {/* Desktop Table View */}
        <div className="prescriptions-table-desktop" style={{ borderRadius: '8px', border: '1px solid #e2e8f0', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
            <thead>
              <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '16px 24px', color: '#64748b', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Patient</th>
                <th style={{ padding: '16px 24px', color: '#64748b', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Doctor</th>
                <th style={{ padding: '16px 24px', color: '#64748b', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                <th style={{ padding: '16px 24px', color: '#64748b', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</th>
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
                      {formatDoctorName(file?.patient?.consultant)}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    {file.status === 'SUBMITTED' ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#dcfce7', color: '#166534', padding: '3px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 600 }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a' }}></span>
                        Submitted
                      </span>
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#fef3c7', color: '#92400e', padding: '3px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 600 }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#d97706' }}></span>
                        Draft
                      </span>
                    )}
                  </td>
                  <td suppressHydrationWarning style={{ padding: '16px 24px', color: '#475569', fontSize: '14px' }}>
                    {file.createdAt ? new Date(file.createdAt).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }) : 'Unknown Date'}
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                    {file.status !== 'SUBMITTED' && (
                      <button
                        type="button"
                        onClick={() => handleMarkSubmitted(file.id)}
                        disabled={submittingId === file.id}
                        title="Mark as Submitted to Admin"
                        style={{
                          background: '#16a34a',
                          border: 'none',
                          padding: '8px 14px',
                          borderRadius: '6px',
                          fontSize: '13px',
                          fontWeight: 600,
                          color: 'white',
                          cursor: submittingId === file.id ? 'not-allowed' : 'pointer',
                          opacity: submittingId === file.id ? 0.7 : 1,
                          transition: 'all 0.2s',
                          marginRight: '8px'
                        }}
                      >
                        {submittingId === file.id ? 'Submitting...' : 'Mark Submitted'}
                      </button>
                    )}
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
                  <td colSpan={5} style={{ padding: '64px 24px', textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '50%', background: '#f1f5f9', color: '#94a3b8', marginBottom: '16px' }}>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                    </div>
                    <h3 style={{ color: '#0f172a', fontSize: '16px', fontWeight: 600, margin: '0 0 8px 0' }}>No Prescriptions Found</h3>
                    <p style={{ color: '#64748b', margin: 0, maxWidth: '300px', marginLeft: 'auto', marginRight: 'auto', fontSize: '14px' }}>
                      {searchTerm ? 'No prescriptions match your search.' : 'There are no prescriptions recorded yet.'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards View */}
        <div className="prescriptions-cards-mobile" style={{ display: 'none', flexDirection: 'column', gap: '12px' }}>
          {filteredPrescriptions.map(file => (
            <div key={file.id} style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '15px', color: '#0f172a' }}>{file?.patient?.name || 'Unknown Patient'}</div>
                  <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>{file?.patient?.phone || 'No phone'}</div>
                </div>
                <div>
                  {file.status === 'SUBMITTED' ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#dcfce7', color: '#166534', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 700 }}>
                      <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#16a34a' }}></span>
                      Submitted
                    </span>
                  ) : (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#fef3c7', color: '#92400e', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 700 }}>
                      <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#d97706' }}></span>
                      Draft
                    </span>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', color: '#475569', flexWrap: 'wrap', gap: '6px' }}>
                <span style={{ fontWeight: 600, color: '#4338ca' }}>{formatDoctorName(file?.patient?.consultant)}</span>
                <span suppressHydrationWarning style={{ color: '#64748b' }}>
                  {file.createdAt ? new Date(file.createdAt).toLocaleDateString('en-US', { timeZone: 'Asia/Kolkata', month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown Date'}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', paddingTop: '4px' }}>
                {file.status !== 'SUBMITTED' && (
                  <button
                    type="button"
                    onClick={() => handleMarkSubmitted(file.id)}
                    disabled={submittingId === file.id}
                    style={{ flex: '1 1 100%', background: '#16a34a', border: 'none', padding: '8px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, color: 'white', cursor: 'pointer' }}
                  >
                    {submittingId === file.id ? 'Submitting...' : 'Mark Submitted'}
                  </button>
                )}
                <button 
                  onClick={() => handleViewPrescription(file)}
                  style={{ flex: 1, background: '#3b82f6', border: 'none', padding: '8px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, color: 'white', cursor: 'pointer', textAlign: 'center' }}
                >
                  View
                </button>
                <button 
                  onClick={() => handleEditClick(file)}
                  style={{ flex: 1, background: '#f59e0b', border: 'none', padding: '8px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, color: 'white', cursor: 'pointer', textAlign: 'center' }}
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDeletePrescription(file.id)}
                  style={{ flex: 1, background: '#fee2e2', color: '#ef4444', border: 'none', padding: '8px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', textAlign: 'center' }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}

          {filteredPrescriptions.length === 0 && (
            <div style={{ padding: '36px 16px', textAlign: 'center', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
              <p style={{ color: '#64748b', margin: 0, fontSize: '14px' }}>
                {searchTerm ? 'No prescriptions match your search.' : 'There are no prescriptions recorded yet.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {viewingFile && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: 'clamp(0px, 2vw, 16px)', animation: 'fadeIn 0.2s ease-out' }}>
          <div style={{ background: 'white', padding: '0', borderRadius: 'clamp(8px, 2vw, 16px)', width: '100%', maxWidth: '1200px', maxHeight: '96dvh', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            
            {/* Header */}
            <div style={{ padding: 'clamp(10px, 2.5vw, 16px) clamp(12px, 3vw, 24px)', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', gap: '8px', flexShrink: 0 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h2 style={{ margin: '0 0 6px 0', fontSize: 'clamp(16px, 4vw, 20px)', fontWeight: '700', color: '#0f172a', letterSpacing: '-0.02em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Prescription Details</h2>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#f8fafc', padding: '3px 8px', borderRadius: '16px', border: '1px solid #e2e8f0', fontSize: '11px' }}>
                    <span style={{ color: '#64748b', fontWeight: 600 }}>PATIENT:</span>
                    <span style={{ color: '#0f172a', fontWeight: 600, maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{viewingFile?.fileInfo?.patient?.name || 'Unknown'}</span>
                  </div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#e0e7ff', padding: '3px 8px', borderRadius: '16px', border: '1px solid #c7d2fe', fontSize: '11px' }}>
                    <span style={{ color: '#6366f1', fontWeight: 600 }}>DOCTOR:</span>
                    <span style={{ color: '#4338ca', fontWeight: 700, maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{formatDoctorName(viewingFile?.fileInfo?.patient?.consultant)}</span>
                  </div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#f8fafc', padding: '3px 8px', borderRadius: '16px', border: '1px solid #e2e8f0', fontSize: '11px' }}>
                    <span style={{ color: '#64748b', fontWeight: 600 }}>DATE:</span>
                    <span style={{ color: '#475569', fontWeight: 600 }}>{viewingFile?.fileInfo?.createdAt ? new Date(viewingFile.fileInfo.createdAt).toLocaleDateString('en-US', { timeZone: 'Asia/Kolkata', year: 'numeric', month: 'short', day: 'numeric' }) : 'Unknown'}</span>
                  </div>
                </div>
              </div>
              <button 
                data-html2canvas-ignore="true"
                onClick={() => setViewingFile(null)}
                style={{ flexShrink: 0, background: '#f8fafc', border: '1px solid #e2e8f0', width: '34px', height: '34px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', cursor: 'pointer', transition: 'all 0.2s ease' }}
                onMouseOver={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#0f172a'; }}
                onMouseOut={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = '#64748b'; }}
                title="Close"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            {/* Mobile / Responsive Zoom & View Toolbar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px clamp(12px, 3vw, 24px)', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '8px', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => setViewMode('fit')}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: viewMode === 'fit' ? '1px solid #0284c7' : '1px solid #cbd5e1',
                    background: viewMode === 'fit' ? '#e0f2fe' : 'white',
                    color: viewMode === 'fit' ? '#0369a1' : '#475569',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <span>📱</span> Fit to Screen
                </button>
                <button
                  type="button"
                  onClick={() => { setViewMode('full'); setCustomZoom(1); }}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: viewMode === 'full' && customZoom === 1 ? '1px solid #0284c7' : '1px solid #cbd5e1',
                    background: viewMode === 'full' && customZoom === 1 ? '#e0f2fe' : 'white',
                    color: viewMode === 'full' && customZoom === 1 ? '#0369a1' : '#475569',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <span>📄</span> 100% Size
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('full');
                    setCustomZoom(prev => Math.max(0.35, Number((prev - 0.1).toFixed(2))));
                  }}
                  title="Zoom Out"
                  style={{ width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', border: '1px solid #cbd5e1', background: 'white', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', color: '#334155' }}
                >
                  -
                </button>
                <span style={{ fontSize: '11px', color: '#64748b', minWidth: '40px', textAlign: 'center', fontWeight: 700 }}>
                  {Math.round((isGeneratingPdf ? 1 : (viewMode === 'fit' ? calculatedFitScale : customZoom)) * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('full');
                    setCustomZoom(prev => Math.min(2, Number((prev + 0.1).toFixed(2))));
                  }}
                  title="Zoom In"
                  style={{ width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', border: '1px solid #cbd5e1', background: 'white', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', color: '#334155' }}
                >
                  +
                </button>
              </div>
            </div>
            
            {/* Scrollable Document Area */}
            <div 
              ref={previewAreaRef}
              style={{ 
                flex: 1, 
                overflowY: 'auto', 
                overflowX: 'auto', 
                WebkitOverflowScrolling: 'touch', 
                background: '#e2e8f0', 
                padding: 'clamp(8px, 2vw, 24px)', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center' 
              }}
            >
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
                  let parsed: any = {};
                  try { parsed = JSON.parse(viewingFile?.text || '{}'); } catch(e) {}
                  const patient = viewingFile?.fileInfo?.patient || {};
                  const activeScale = isGeneratingPdf ? 1 : (viewMode === 'fit' ? calculatedFitScale : customZoom);
                  
                  return (
                    <div 
                      id="prescription-pdf-content" 
                      style={{ 
                        margin: '0 auto', 
                        minWidth: '210mm', 
                        width: '210mm', 
                        height: 'auto',
                        minHeight: 'auto', 
                        padding: '12mm 15mm 20mm 15mm', 
                        backgroundColor: 'white', 
                        fontFamily: '"Times New Roman", Times, serif', 
                        color: colors.textColor, 
                        fontSize: '15px', 
                        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                        zoom: activeScale,
                        transformOrigin: 'top center',
                        boxSizing: 'border-box'
                      }}
                    >
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
                              <td style={{ border: `1px solid ${colors.borderColor}`, padding: '8px' }}>{formatDoctorName(patient.consultant)}</td>
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
                              <td style={{ border: `1px solid ${colors.borderColor}`, padding: '8px', width: '30%', backgroundColor: colors.leftColBg, fontWeight: 'bold', color: colors.headerBg }}>UHID Number</td>
                              <td style={{ border: `1px solid ${colors.borderColor}`, padding: '8px', fontWeight: 'bold' }}>
                                {patient.uhid || parsed.patientUhid || 'PENDING'}
                              </td>
                            </tr>
                            <tr>
                              <td style={{ border: `1px solid ${colors.borderColor}`, padding: '8px', width: '30%', backgroundColor: colors.leftColBg, fontWeight: 'bold', color: colors.headerBg }}>Consultation Date</td>
                              <td style={{ border: `1px solid ${colors.borderColor}`, padding: '8px' }}>
                                {viewingFile?.fileInfo?.createdAt ? new Date(viewingFile.fileInfo.createdAt).toLocaleDateString('en-US', { timeZone: 'Asia/Kolkata' }) : 'Unknown'}
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
                              <td style={{ border: `1px solid ${colors.borderColor}`, padding: '8px' }}>{formatDoctorName(patient.consultant)}</td>
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
                  );
                } catch (e) {
                  return (
                    <div style={{ background: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', borderLeft: '4px solid #3b82f6', width: '100%', maxWidth: '800px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', paddingBottom: '12px', borderBottom: '2px solid #f1f5f9' }}>
                        <div style={{ background: '#eff6ff', padding: '8px', borderRadius: '8px' }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                        </div>
                        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>Clinical Notes & Prescription</h3>
                      </div>
                      <div style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: '14px', lineHeight: '1.7', color: '#334155' }}>
                        {viewingFile?.text}
                      </div>
                    </div>
                  );
                }
              })()}
            </div>
            
            {/* Modal Responsive Footer */}
            <div style={{ padding: '12px clamp(12px, 3vw, 24px)', borderTop: '1px solid #f1f5f9', background: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', flexShrink: 0 }}>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                <button 
                  onClick={() => {
                    if (viewingFile?.text) {
                      const formattedText = getFormattedPrescription(viewingFile.text);
                      navigator.clipboard.writeText(formattedText)
                        .then(() => alert('Prescription details copied to clipboard!'))
                        .catch(err => console.error('Failed to copy: ', err));
                    }
                  }}
                  style={{ background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', padding: '9px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', flex: '0 0 auto' }}
                  onMouseOver={(e) => { e.currentTarget.style.background = '#e2e8f0'; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = '#f1f5f9'; }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                  Copy Text
                </button>
                {/* Share Button */}
                <button 
                  onClick={async () => {
                    setIsGeneratingPdf(true);
                    setPdfAction('share');
                    setTimeout(async () => {
                      try {
                        const element = document.getElementById('prescription-pdf-content');
                        if (!element) return;
                        
                        const html2pdf = (await import('html2pdf.js')).default;
                        
                        let patientUhid = viewingFile?.fileInfo?.patient?.uhid || '';
                        if (!patientUhid) {
                          try { patientUhid = JSON.parse(viewingFile?.text || '{}').patientUhid || ''; } catch(e) {}
                        }
                        const cleanUhid = patientUhid ? patientUhid.replace(/BENVA-UHID-0+/, 'BENVA-UHID-') : 'PENDING';
                        
                        const opt = {
                          margin:       [15, 0, 15, 0] as [number, number, number, number],
                          filename:     `${viewingFile?.fileInfo?.patient?.name || 'Patient'}_${cleanUhid}.pdf`,
                          image:        { type: 'jpeg' as const, quality: 0.98 },
                          html2canvas:  { scale: 2, useCORS: true, windowWidth: 1024, scrollX: 0, scrollY: 0 },
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
                          const formattedText = getFormattedPrescription(viewingFile?.text || '');
                          if (navigator.share) {
                            await navigator.share({ title: 'Prescription Details', text: formattedText });
                          } else {
                            await navigator.clipboard.writeText(formattedText);
                            alert('Direct file sharing is not supported on this browser. Prescription text copied to clipboard!');
                          }
                        }
                      } catch (err: any) {
                        if (err?.name !== 'AbortError') {
                          console.error('Failed to share PDF: ', err);
                          const formattedText = getFormattedPrescription(viewingFile?.text || '');
                          if (navigator.share) {
                            navigator.share({ title: 'Prescription Details', text: formattedText }).catch(() => {});
                          } else {
                            navigator.clipboard.writeText(formattedText).then(() => alert('Copied prescription text to clipboard')).catch(() => {});
                          }
                        }
                      } finally {
                        setIsGeneratingPdf(false);
                        setPdfAction(null);
                      }
                    }, 200);
                  }}
                  style={{ background: '#0284c7', color: 'white', border: 'none', padding: '9px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', flex: '0 0 auto', opacity: isGeneratingPdf ? 0.7 : 1 }}
                  disabled={isGeneratingPdf}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                  {isGeneratingPdf && pdfAction === 'share' ? 'Sharing...' : 'Share'}
                </button>

                {/* Download PDF Button */}
                <button 
                  onClick={async () => {
                    setIsGeneratingPdf(true);
                    setPdfAction('download');
                    setTimeout(async () => {
                      try {
                        const element = document.getElementById('prescription-pdf-content');
                        if (!element) return;
                        
                        const html2pdf = (await import('html2pdf.js')).default;
                        
                        let patientUhid = viewingFile?.fileInfo?.patient?.uhid || '';
                        if (!patientUhid) {
                          try { patientUhid = JSON.parse(viewingFile?.text || '{}').patientUhid || ''; } catch(e) {}
                        }
                        const cleanUhid = patientUhid ? patientUhid.replace(/BENVA-UHID-0+/, 'BENVA-UHID-') : 'PENDING';

                        const opt = {
                          margin:       [15, 0, 15, 0] as [number, number, number, number],
                          filename:     `${viewingFile?.fileInfo?.patient?.name || 'Patient'}_${cleanUhid}.pdf`,
                          image:        { type: 'jpeg' as const, quality: 0.98 },
                          html2canvas:  { scale: 2, useCORS: true, windowWidth: 1024, scrollX: 0, scrollY: 0 },
                          pagebreak:    { mode: ['css', 'legacy'] },
                          jsPDF:        { unit: 'mm' as const, format: 'a4', orientation: 'portrait' as const }
                        };

                        await html2pdf().set(opt).from(element).save();
                      } catch (err) {
                        console.error('Failed to download PDF: ', err);
                        alert('Failed to download PDF.');
                      } finally {
                        setIsGeneratingPdf(false);
                        setPdfAction(null);
                      }
                    }, 200);
                  }}
                  style={{ background: '#059669', color: 'white', border: 'none', padding: '9px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', flex: '0 0 auto', opacity: isGeneratingPdf ? 0.7 : 1 }}
                  disabled={isGeneratingPdf}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                  {isGeneratingPdf && pdfAction === 'download' ? 'Downloading...' : 'Download PDF'}
                </button>
              </div>
              <button 
                onClick={() => setViewingFile(null)}
                style={{ background: '#0f172a', color: 'white', border: 'none', padding: '9px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', flex: '0 0 auto', marginLeft: 'auto', whiteSpace: 'nowrap' }}
                onMouseOver={(e) => { e.currentTarget.style.background = '#1e293b'; }}
                onMouseOut={(e) => { e.currentTarget.style.background = '#0f172a'; }}
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingFile && editData && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10001, padding: 'clamp(0px, 2vw, 16px)', animation: 'fadeIn 0.2s ease-out' }}>
          <div style={{ background: 'white', padding: '0', borderRadius: 'clamp(8px, 2vw, 16px)', width: '100%', maxWidth: '700px', maxHeight: '96dvh', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', flexShrink: 0 }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#0f172a' }}>Edit Prescription</h2>
              <button 
                onClick={() => setEditingFile(null)}
                style={{ background: '#e2e8f0', border: 'none', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', cursor: 'pointer' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                {/* Clinical Summary */}
                <div>
                  <label style={{ display: 'block', fontWeight: 600, color: '#334155', marginBottom: '8px', fontSize: '13px' }}>Clinical Summary</label>
                  <textarea 
                    value={editData.clinicalSummary || ''} 
                    onChange={e => setEditData({...editData, clinicalSummary: e.target.value})} 
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', minHeight: '80px', fontFamily: 'inherit', fontSize: '14px', resize: 'vertical' }} 
                  />
                </div>

                {/* Medicines */}
                <div>
                  <label style={{ display: 'block', fontWeight: 600, color: '#334155', marginBottom: '8px', fontSize: '13px' }}>Medicines</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {editData.medicines?.map((med: any, idx: number) => (
                      <div key={idx} style={{ display: 'flex', gap: '8px', background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', flexWrap: 'wrap', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e2e8f0', width: '26px', height: '26px', borderRadius: '50%', fontSize: '12px', fontWeight: 'bold', color: '#475569', flexShrink: 0 }}>{idx + 1}</div>
                        <div style={{ flex: '1 1 180px' }}>
                          <input 
                            value={med.name || ''} 
                            onChange={e => {
                              const newMeds = [...editData.medicines];
                              newMeds[idx].name = e.target.value;
                              setEditData({...editData, medicines: newMeds});
                            }} 
                            placeholder="Medicine Name" 
                            style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }} 
                          />
                        </div>
                        <div style={{ flex: '1 1 90px' }}>
                          <input 
                            value={med.dosage || ''} 
                            onChange={e => {
                              const newMeds = [...editData.medicines];
                              newMeds[idx].dosage = e.target.value;
                              setEditData({...editData, medicines: newMeds});
                            }} 
                            disabled={!med.name?.trim()}
                            placeholder="Dosage" 
                            style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', backgroundColor: !med.name?.trim() ? '#f1f5f9' : 'white', cursor: !med.name?.trim() ? 'not-allowed' : 'text' }} 
                          />
                        </div>
                        <div style={{ flex: '1 1 100px' }}>
                          <input 
                            value={med.frequency || ''} 
                            onChange={e => {
                              const newMeds = [...editData.medicines];
                              newMeds[idx].frequency = e.target.value;
                              setEditData({...editData, medicines: newMeds});
                            }} 
                            disabled={!med.name?.trim()}
                            placeholder="Frequency" 
                            style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', backgroundColor: !med.name?.trim() ? '#f1f5f9' : 'white', cursor: !med.name?.trim() ? 'not-allowed' : 'text' }} 
                          />
                        </div>
                        <button 
                          onClick={() => {
                            const newMeds = editData.medicines.filter((_:any, i:number) => i !== idx);
                            setEditData({...editData, medicines: newMeds});
                          }}
                          style={{ background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '6px', padding: '6px 10px', cursor: 'pointer', fontWeight: 600, fontSize: '13px', flexShrink: 0 }}
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
