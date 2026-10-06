'use client';

import React, { useState, useEffect } from 'react';

const RemarkInput = ({ req, onSave }: { req: any, onSave: (id: string, text: string) => void }) => {
  const [value, setValue] = useState(req.adminRemarks || '');
  
  useEffect(() => {
    setValue(req.adminRemarks || '');
  }, [req.adminRemarks]);

  return (
    <input
      type="text"
      value={value}
      onChange={e => setValue(e.target.value)}
      onBlur={() => {
        if (value !== (req.adminRemarks || '')) {
          onSave(req.id, value);
        }
      }}
      placeholder="Add comment..."
      style={{ padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', width: '150px' }}
    />
  );
};

export default function FreeConsultationsClient({ initialRequests }: { initialRequests: any[] }) {
  const [requests, setRequests] = useState(initialRequests);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [viewingRequest, setViewingRequest] = useState<any>(null);

  // Filters
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');

  // Helper: convert any date to local "YYYY-MM-DD" string (timezone-safe)
  const toLocalDateStr = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const filteredRequests = requests.filter(req => {
    if (typeFilter !== 'ALL' && req.type !== typeFilter) return false;
    
    // Convert the record's createdAt to local date string (handles IST timezone correctly)
    const reqLocalDate = toLocalDateStr(new Date(req.createdAt));
    
    // fromDate and toDate are already in "YYYY-MM-DD" format from the date input
    if (fromDate && reqLocalDate < fromDate) return false;
    if (toDate && reqLocalDate > toDate) return false;
    
    return true;
  });

  const handleDownloadPDF = async (targetId: string, filename: string) => {
    const element = document.getElementById(targetId);
    if (!element) return;
    
    // Create a clone to modify before printing
    const clone = element.cloneNode(true) as HTMLElement;
    
    // If we are downloading the main table, hide actions column
    if (targetId === 'consultations-table') {
      const ths = clone.querySelectorAll('th');
      if (ths.length > 0) ths[ths.length - 1].remove();
      
      const rows = clone.querySelectorAll('tbody tr');
      rows.forEach(row => {
        const tds = row.querySelectorAll('td');
        if (tds.length > 0) tds[tds.length - 1].remove();
      });
    }

    const opt = {
      margin:       0.3,
      filename:     filename,
      image:        { type: 'jpeg' as const, quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'in', format: 'letter', orientation: (targetId === 'consultations-table' ? 'landscape' : 'portrait') as 'landscape' | 'portrait' }
    };
    
    // Dynamically import to avoid SSR 'window is not defined' error
    // @ts-ignore
    const html2pdf = (await import('html2pdf.js')).default;
    html2pdf().set(opt).from(clone).save();
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    setLoadingId(id);
    try {
      const res = await fetch(`/api/admin/free-consultations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        const updated = await res.json();
        setRequests(requests.map(r => r.id === id ? updated : r));
      }
    } catch (err) {
      console.error(err);
      alert('Failed to update status');
    }
    setLoadingId(null);
  };

  const handleRemarksBlur = async (id: string, newRemarks: string) => {
    try {
      const res = await fetch(`/api/admin/free-consultations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminRemarks: newRemarks })
      });
      if (res.ok) {
        const updated = await res.json();
        setRequests(requests.map(r => r.id === id ? updated : r));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>From Date</label>
            <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} style={{ padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>To Date</label>
            <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} style={{ padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Type</label>
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={{ padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}>
              <option value="ALL">All Types</option>
              <option value="GENERAL">General</option>
              <option value="CORPORATE">Corporate</option>
            </select>
          </div>
          {(fromDate || toDate || typeFilter !== 'ALL') && (
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '100%', marginTop: '20px' }}>
               <button onClick={() => { setFromDate(''); setToDate(''); setTypeFilter('ALL'); }} style={{ background: 'none', border: 'none', color: '#ef4444', fontWeight: 600, cursor: 'pointer', fontSize: '13px' }}>Clear Filters</button>
            </div>
          )}
        </div>
        
        <button onClick={() => handleDownloadPDF('consultations-table', `Free_Consultations${fromDate ? `_from_${fromDate}` : ''}.pdf`)} style={{ padding: '10px 20px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          Download PDF
        </button>
      </div>
      <div id="consultations-table" style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflowX: 'auto' }}>
        <table style={{ width: '100%', minWidth: '900px', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: '#f8fafc' }}>
            <tr>
              <th style={{ padding: '16px', fontSize: '13px', color: '#64748b', borderBottom: '1px solid #e2e8f0', width: '60px' }}>S.No</th>
              <th style={{ padding: '16px', fontSize: '13px', color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>Date</th>
              <th style={{ padding: '16px', fontSize: '13px', color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>Patient Details</th>
              <th style={{ padding: '16px', fontSize: '13px', color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>Type</th>
              <th style={{ padding: '16px', fontSize: '13px', color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>Location</th>
              <th style={{ padding: '16px', fontSize: '13px', color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>Status</th>
              <th style={{ padding: '16px', fontSize: '13px', color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>Remarks</th>
              <th style={{ padding: '16px', fontSize: '13px', color: '#64748b', borderBottom: '1px solid #e2e8f0', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequests.map((req, index) => (
              <tr key={req.id}>
                <td style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', fontSize: '14px', color: '#334155', fontWeight: 500 }}>
                  {index + 1}
                </td>
                <td style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', fontSize: '14px', color: '#334155' }}>
                  {new Date(req.createdAt).toLocaleDateString()}
                </td>
                <td style={{ padding: '16px', borderBottom: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>{req.name}</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>{req.phone} | {req.email || 'N/A'}</div>
                </td>
                <td style={{ padding: '16px', borderBottom: '1px solid #e2e8f0' }}>
                  <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600, background: req.type === 'CORPORATE' ? '#eff6ff' : '#f8fafc', color: req.type === 'CORPORATE' ? '#2563eb' : '#475569' }}>
                    {req.type}
                  </span>
                  {req.type === 'CORPORATE' && <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>{req.organizationName}</div>}
                </td>
                <td style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', fontSize: '14px', color: '#334155' }}>
                  {req.district}, {req.state}
                </td>
                <td style={{ padding: '16px', borderBottom: '1px solid #e2e8f0' }}>
                  <select 
                    value={req.status} 
                    onChange={e => handleStatusChange(req.id, e.target.value)}
                    disabled={loadingId === req.id}
                    style={{ padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', background: req.status === 'COMPLETED' ? '#dcfce7' : 'white', color: req.status === 'COMPLETED' ? '#166534' : '#0f172a' }}
                  >
                    <option value="PENDING">Pending</option>
                    <option value="CONTACTED">Contacted</option>
                    <option value="SCHEDULED">Scheduled</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </td>
                <td style={{ padding: '16px', borderBottom: '1px solid #e2e8f0' }}>
                  <RemarkInput req={req} onSave={handleRemarksBlur} />
                </td>
                <td style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', textAlign: 'right' }}>
                  <button onClick={() => setViewingRequest(req)} style={{ padding: '6px 12px', borderRadius: '6px', background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}>
                    View Details
                  </button>
                </td>
              </tr>
            ))}
            {filteredRequests.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>No requests found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {viewingRequest && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: '16px', width: '100%', maxWidth: '600px', color: '#0f172a', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ margin: 0, fontSize: '20px' }}>Consultation Request Details</h2>
              <button onClick={() => setViewingRequest(null)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#64748b' }}>&times;</button>
            </div>
            
            <div id="patient-details-pdf" style={{ display: 'grid', gap: '16px', padding: '16px', background: 'white' }}>
              <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '8px' }}>
                <div style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>{viewingRequest.name}</div>
                <div style={{ fontSize: '14px', color: '#475569', marginBottom: '8px' }}>{viewingRequest.phone} | {viewingRequest.email || 'No Email provided'}</div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#2563eb', display: 'flex', gap: '12px' }}>
                  <span>Date: {new Date(viewingRequest.createdAt).toLocaleDateString()}</span>
                  <span>Type: {viewingRequest.type}</span>
                </div>
              </div>
              
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Location</div>
                <div style={{ fontSize: '15px' }}>{viewingRequest.district}, {viewingRequest.state} - {viewingRequest.pincode}</div>
              </div>

              {viewingRequest.type === 'CORPORATE' && (
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Corporate Organization</div>
                  <div style={{ fontSize: '15px' }}>{viewingRequest.organizationName}</div>
                </div>
              )}

              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>Primary Problem</div>
                <div style={{ whiteSpace: 'pre-wrap', fontSize: '15px', lineHeight: '1.5' }}>{viewingRequest.problem}</div>
              </div>

              {viewingRequest.previousMedication && (
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>Previous Medication</div>
                  <div style={{ whiteSpace: 'pre-wrap', fontSize: '15px', lineHeight: '1.5' }}>{viewingRequest.previousMedication}</div>
                </div>
              )}
            </div>
            
            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button 
                onClick={() => handleDownloadPDF('patient-details-pdf', `${viewingRequest.name.replace(/\s+/g, '_')}_Consultation.pdf`)}
                style={{ padding: '10px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                Download Patient Details PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
