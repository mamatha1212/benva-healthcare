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
      html2canvas:  { scale: 2, windowWidth: 1024 },
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
      <style>{`
        @media (max-width: 640px) {
          #patient-details-pdf {
            padding: 20px !important;
          }
          #patient-details-pdf table, 
          #patient-details-pdf tbody, 
          #patient-details-pdf tr, 
          #patient-details-pdf td {
            display: block !important;
            width: 100% !important;
            text-align: left !important;
            border-right: none !important;
          }
          #patient-details-pdf td {
            padding-bottom: 12px !important;
          }
        }
      `}</style>
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
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>Age: {req.age || 'N/A'} | Gender: {req.gender || 'N/A'}</div>
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
            
            <div id="patient-details-pdf" style={{ padding: '40px', background: 'white', color: '#000000', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
              
              {/* Header / Branding */}
              <div style={{ borderBottom: '2px solid #2563eb', paddingBottom: '20px', marginBottom: '30px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    <tr>
                      <td style={{ verticalAlign: 'middle', width: '50%' }}>
                        <div style={{ fontSize: '28px', fontWeight: 900, color: '#1e3a8a', letterSpacing: '-0.5px' }}>Benva Healthcare</div>
                        <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Patient Consultation Record</div>
                      </td>
                      <td style={{ verticalAlign: 'middle', width: '50%', textAlign: 'right' }}>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#334155' }}>Date: {new Date(viewingRequest.createdAt).toLocaleDateString()}</div>
                        <div style={{ marginTop: '8px' }}>
                          <span style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 800, background: viewingRequest.type === 'CORPORATE' ? '#e0e7ff' : '#f1f5f9', color: viewingRequest.type === 'CORPORATE' ? '#4338ca' : '#475569', display: 'inline-block', border: `1px solid ${viewingRequest.type === 'CORPORATE' ? '#c7d2fe' : '#e2e8f0'}` }}>
                            {viewingRequest.type} CONSULTATION
                          </span>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Patient Details Section */}
              <div style={{ marginBottom: '30px' }}>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>
                  <span style={{ color: '#3b82f6', marginRight: '8px' }}>■</span>
                  Patient Information
                </div>
                
                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e2e8f0' }}>
                  <tbody>
                    <tr>
                      <td style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0', width: '50%', background: '#f8fafc' }}>
                        <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Full Name</div>
                        <div style={{ fontSize: '16px', color: '#0f172a', fontWeight: 700 }}>{viewingRequest.name}</div>
                      </td>
                      <td style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', width: '50%', background: '#ffffff' }}>
                        <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Contact Details</div>
                        <div style={{ fontSize: '14px', color: '#334155', fontWeight: 500 }}>{viewingRequest.phone}</div>
                        <div style={{ fontSize: '14px', color: '#334155', fontWeight: 500 }}>{viewingRequest.email || 'N/A'}</div>
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0', width: '50%', background: '#ffffff' }}>
                        <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Age & Gender</div>
                        <div style={{ fontSize: '14px', color: '#334155', fontWeight: 600 }}>{viewingRequest.age ? `${viewingRequest.age} years` : 'N/A'} • {viewingRequest.gender || 'N/A'}</div>
                      </td>
                      <td style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', width: '50%', background: '#f8fafc' }}>
                        <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Location</div>
                        <div style={{ fontSize: '14px', color: '#334155', fontWeight: 600 }}>{viewingRequest.district}, {viewingRequest.state} - {viewingRequest.pincode}</div>
                      </td>
                    </tr>
                    {viewingRequest.type === 'CORPORATE' && (
                      <tr>
                        <td colSpan={2} style={{ padding: '16px', background: '#e0e7ff' }}>
                          <div style={{ fontSize: '11px', fontWeight: 800, color: '#4338ca', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Corporate Organization</div>
                          <div style={{ fontSize: '15px', color: '#312e81', fontWeight: 700 }}>{viewingRequest.organizationName}</div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Medical Details Section */}
              <div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>
                  <span style={{ color: '#ef4444', marginRight: '8px' }}>■</span>
                  Medical Details
                </div>
                
                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #fecdd3' }}>
                  <tbody>
                    <tr>
                      <td style={{ padding: '20px', background: '#fff1f2', borderBottom: viewingRequest.previousMedication ? '1px solid #fecdd3' : 'none' }}>
                        <div style={{ fontSize: '12px', fontWeight: 800, color: '#be123c', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Primary Problem</div>
                        <div style={{ whiteSpace: 'pre-wrap', fontSize: '15px', lineHeight: '1.6', color: '#4c0519', fontWeight: 500 }}>{viewingRequest.problem}</div>
                      </td>
                    </tr>
                    {viewingRequest.previousMedication && (
                      <tr>
                        <td style={{ padding: '20px', background: '#eff6ff', border: '1px solid #bfdbfe' }}>
                          <div style={{ fontSize: '12px', fontWeight: 800, color: '#1d4ed8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Previous Medication</div>
                          <div style={{ whiteSpace: 'pre-wrap', fontSize: '15px', lineHeight: '1.6', color: '#1e3a8a', fontWeight: 500 }}>{viewingRequest.previousMedication}</div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Footer Stamp */}
              <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px dashed #cbd5e1', textAlign: 'center', fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>
                This is a computer-generated document and requires no physical signature.
              </div>
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
