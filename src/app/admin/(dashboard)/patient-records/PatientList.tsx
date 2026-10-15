'use client';

import React, { useState } from 'react';
import AddPatientModal from './AddPatientModal';
import InvoiceGeneratorModal from './InvoiceGeneratorModal';
import InvoiceView from './InvoiceView';

export default function PatientList({ initialPatients, doctors }: { initialPatients: any[], doctors: any[] }) {
  const [patients, setPatients] = useState(initialPatients);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [invoiceModalPatient, setInvoiceModalPatient] = useState<any>(null);
  const [viewInvoice, setViewInvoice] = useState<any>(null);
  const [deletingPatientId, setDeletingPatientId] = useState<string | null>(null);
  const [deletingFileId, setDeletingFileId] = useState<string | null>(null);

  // Consignment States
  const [editingConsignmentPatient, setEditingConsignmentPatient] = useState<any>(null);
  const [isSavingConsignment, setIsSavingConsignment] = useState(false);

  const handleSaveConsignment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingConsignmentPatient) return;
    setIsSavingConsignment(true);
    try {
      const form = e.currentTarget;
      const formData = new FormData(form);
      formData.set('id', editingConsignmentPatient.id);

      const res = await fetch('/api/admin/patients', {
        method: 'PUT',
        body: formData
      });
      if (!res.ok) throw new Error('Failed to update consignment details');
      const updated = await res.json();

      setPatients(prev => prev.map(p => p.id === updated.id ? { ...p, consignmentNo: updated.consignmentNo, consignmentImage: updated.consignmentImage } : p));
      setEditingConsignmentPatient(null);
    } catch (err: any) {
      alert(err.message || 'Error updating consignment');
    } finally {
      setIsSavingConsignment(false);
    }
  };



  const handleDeletePatient = async (patient: any) => {
    const confirmMsg = `Are you sure you want to delete patient "${patient.name}" (${patient.uhid || patient.phone})?\n\nThis will permanently delete this patient record along with all attached files and invoices.`;
    if (!window.confirm(confirmMsg)) return;

    setDeletingPatientId(patient.id);
    try {
      const res = await fetch(`/api/admin/patients?id=${patient.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete patient');
      setPatients(prev => prev.filter(p => p.id !== patient.id));
    } catch (err: any) {
      alert(err.message || 'Error deleting patient');
    } finally {
      setDeletingPatientId(null);
    }
  };

  const handleDeleteFile = async (patientId: string, fileId: string, fileName: string) => {
    if (!window.confirm(`Are you sure you want to delete file "${fileName}"?`)) return;

    setDeletingFileId(fileId);
    try {
      const res = await fetch(`/api/admin/patients?fileId=${fileId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete file');
      setPatients(prev => prev.map(p => {
        if (p.id === patientId) {
          return {
            ...p,
            files: (p.files || []).filter((f: any) => f.id !== fileId)
          };
        }
        return p;
      }));
    } catch (err: any) {
      alert(err.message || 'Error deleting file');
    } finally {
      setDeletingFileId(null);
    }
  };

  const handleInvoiceDeleted = (deletedInvoiceId: string) => {
    setPatients(prev => prev.map(p => ({
      ...p,
      invoices: (p.invoices || []).filter((inv: any) => inv.id !== deletedInvoiceId)
    })));
  };

  const handlePatientAdded = (newPatient: any, action: 'save' | 'save-and-add' = 'save') => {
    setPatients(prev => [newPatient, ...prev]);
    if (action !== 'save-and-add') {
      setIsAddModalOpen(false);
    }
  };

  const handleInvoiceGenerated = (newInvoice: any) => {
    setPatients(patients.map(p => {
      if (p.id === newInvoice.patientId) {
        return {
          ...p,
          invoices: [newInvoice, ...(p.invoices || [])]
        };
      }
      return p;
    }));
    setInvoiceModalPatient(null);
  };

  const filteredPatients = patients.filter((p: any) => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.phone.includes(searchTerm) ||
    (p.uhid && p.uhid.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getPrimaryName = (phone: string, currentId: string) => {
    const family = patients.filter((p: any) => p.phone === phone);
    if (family.length <= 1) return null;
    const primary = [...family].sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())[0];
    if (primary.id === currentId) return null;
    return primary.name;
  };

  return (
    <div>
      <style>{`
        .patient-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          table-layout: fixed;
        }
        .patient-table th {
          padding: 14px 18px;
          background: #02559d;
          color: white;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          border-bottom: 2px solid #013b6e;
          white-space: nowrap;
        }
        .patient-table th:first-child {
          border-top-left-radius: 12px;
        }
        .patient-table th:last-child {
          border-top-right-radius: 12px;
        }
        .patient-row {
          border-bottom: 1px solid #e2e8f0;
          transition: all 0.15s ease;
        }
        .patient-row:hover {
          background-color: #f8faff;
        }
        .patient-row td {
          padding: 14px 18px;
          color: #475569;
          font-size: 13px;
          vertical-align: middle;
        }
        .action-btn {
          border: none;
          padding: 7px 12px;
          border-radius: 7px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          white-space: nowrap;
        }
        .action-btn.prescribe {
          background: #ecfdf5;
          color: #047857;
          border: 1px solid #a7f3d0;
          box-shadow: 0 1px 2px rgba(4, 120, 87, 0.05);
        }
        .action-btn.prescribe:hover {
          background: #d1fae5;
          border-color: #6ee7b7;
          color: #065f46;
          transform: translateY(-1px);
        }
        .action-btn.delete-btn {
          background: #fef2f2;
          color: #dc2626;
          border: 1px solid #fecaca;
        }
        .action-btn.delete-btn:hover:not(:disabled) {
          background: #fee2e2;
          border-color: #fca5a5;
          color: #b91c1c;
          transform: translateY(-1px);
        }
        .action-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .header-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          gap: 16px;
        }
        .stat-card {
          background: white;
          border-radius: 12px;
          padding: 16px 20px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 1px 3px rgba(0,0,0,0.03);
          display: flex;
          align-items: center;
          gap: 16px;
          transition: all 0.2s ease;
        }
        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.06);
          border-color: #cbd5e1;
        }
        .stat-icon {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .table-responsive {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.04);
          border: 1px solid #e2e8f0;
          width: 100%;
          overflow-x: auto;
        }
        @media (max-width: 900px) {
          .header-container {
            flex-direction: column;
            align-items: stretch;
          }
          .header-container button {
            width: 100%;
          }
          .patient-table {
            table-layout: auto;
          }
        }
      `}</style>

      {/* Main Page Title & Add Button */}
      <div className="header-container">
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>Patient Records</span>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#0284c7', background: '#e0f2fe', padding: '3px 10px', borderRadius: '20px' }}>
              {patients.length} Registered
            </span>
          </h1>
          <p style={{ color: '#64748b', margin: 0, fontSize: '14px' }}>
            Manage registered patient profiles, medical documents, invoices & courier consignments.
          </p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          style={{
            background: '#02559d',
            color: 'white',
            padding: '11px 22px',
            borderRadius: '9px',
            border: 'none',
            fontWeight: 700,
            fontSize: '14px',
            cursor: 'pointer',
            boxShadow: '0 4px 10px rgba(2, 85, 157, 0.28)',
            transition: 'all 0.2s',
            whiteSpace: 'nowrap',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add New Patient Data
        </button>
      </div>

      {/* Operational Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '14px', marginBottom: '22px' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', fontWeight: 600 }}>Total Patients</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>{patients.length}</div>
            <div style={{ fontSize: '11px', color: '#059669', fontWeight: 500 }}>Active patient records</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#dcfce7', color: '#16a34a' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', fontWeight: 600 }}>Medical Files</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
              {patients.reduce((acc, p) => acc + (p.files?.length || 0), 0)}
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>Prescriptions & docs</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="5" width="20" height="14" rx="2"></rect>
              <line x1="2" y1="10" x2="22" y2="10"></line>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', fontWeight: 600 }}>Invoices Created</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
              {patients.reduce((acc, p) => acc + (p.invoices?.length || 0), 0)}
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>Bills generated</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#f3e8ff', color: '#9333ea' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="3" width="15" height="13"></rect>
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
              <circle cx="5.5" cy="18.5" r="2.5"></circle>
              <circle cx="18.5" cy="18.5" r="2.5"></circle>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', fontWeight: 600 }}>Consignments</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
              {patients.filter((p: any) => p.consignmentNo).length}
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>Tracked courier parcels</div>
          </div>
        </div>
      </div>

      {/* Search & Counter Toolbar */}
      <div style={{ marginBottom: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: '440px' }}>
          <input 
            type="text" 
            placeholder="Search by patient name, phone, or UHID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '11px 16px 11px 40px',
              borderRadius: '9px',
              border: '1px solid #cbd5e1',
              width: '100%',
              fontSize: '14px',
              background: 'white',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
              boxSizing: 'border-box',
              outline: 'none',
              transition: 'border-color 0.2s, box-shadow 0.2s'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#0284c7';
              e.target.style.boxShadow = '0 0 0 3px rgba(2, 132, 199, 0.15)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#cbd5e1';
              e.target.style.boxShadow = '0 1px 2px rgba(0,0,0,0.03)';
            }}
          />
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', width: '17px', height: '17px', color: '#94a3b8' }}>
            <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                fontSize: '18px',
                cursor: 'pointer',
                padding: '2px 6px'
              }}
            >
              ×
            </button>
          )}
        </div>

        <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>
          Showing <span style={{ color: '#0f172a' }}>{filteredPatients.length}</span> of {patients.length} patients
        </div>
      </div>

      {/* Patient Table */}
      <div className="table-responsive">
        <table className="patient-table">
          <thead>
            <tr>
              <th style={{ width: '30%' }}>Patient Details</th>
              <th style={{ width: '24%' }}>Contact & Address</th>
              <th style={{ width: '14%' }}>Medical Files</th>
              <th style={{ width: '14%' }}>Invoices</th>
              <th style={{ width: '18%', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '64px 24px', textAlign: 'center' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '70px', height: '70px', borderRadius: '50%', background: '#f0f7ff', color: '#02559d', marginBottom: '14px' }}>
                    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                  </div>
                  <h3 style={{ margin: '0 0 6px 0', color: '#0f172a', fontSize: '17px', fontWeight: 700 }}>No Patients Found</h3>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>We couldn't find any patient records matching your search query.</p>
                </td>
              </tr>
            ) : (
              filteredPatients.map((patient: any) => {
                const primaryName = getPrimaryName(patient.phone, patient.id);

                return (
                <tr key={patient.id} className="patient-row">
                  {/* 1. Patient Details */}
                  <td>
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '15px' }}>{patient.name}</div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '5px', flexWrap: 'wrap' }}>
                      {patient.uhid && (
                        <span style={{ fontSize: '11px', color: '#0284c7', background: '#e0f2fe', border: '1px solid #bae6fd', padding: '2px 7px', borderRadius: '5px', fontWeight: 700, fontFamily: 'monospace' }}>
                          {patient.uhid}
                        </span>
                      )}
                      {(patient.age || patient.gender) && (
                        <span style={{ fontSize: '11px', color: '#475569', background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '2px 6px', borderRadius: '5px', fontWeight: 500 }}>
                          {patient.age ? `${patient.age}Y` : ''}{patient.age && patient.gender ? ' / ' : ''}{patient.gender || ''}
                        </span>
                      )}
                    </div>

                    {/* Consignment Tracking & Slip */}
                    <div style={{ marginTop: '7px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      {patient.consignmentNo ? (
                        <>
                          <span style={{ fontSize: '11px', color: '#1e40af', background: '#dbeafe', border: '1px solid #bfdbfe', padding: '2px 7px', borderRadius: '5px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            📦 {patient.consignmentNo}
                          </span>
                          {patient.consignmentImage && (
                            <a
                              href={patient.consignmentImage}
                              target="_blank"
                              rel="noreferrer"
                              style={{ fontSize: '11px', color: '#047857', background: '#dcfce7', border: '1px solid #86efac', padding: '2px 6px', borderRadius: '5px', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                              title="Click to view consignment receipt slip"
                            >
                              📷 Slip
                            </a>
                          )}
                          <button
                            onClick={() => setEditingConsignmentPatient(patient)}
                            title="Edit consignment"
                            style={{
                              background: '#f8fafc',
                              border: '1px solid #cbd5e1',
                              borderRadius: '4px',
                              padding: '2px 6px',
                              fontSize: '11px',
                              color: '#475569',
                              cursor: 'pointer',
                              fontWeight: 600
                            }}
                          >
                            Edit
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setEditingConsignmentPatient(patient)}
                          title="Add Courier / Consignment Number"
                          style={{
                            background: '#f8fafc',
                            border: '1px dashed #cbd5e1',
                            borderRadius: '5px',
                            padding: '3px 8px',
                            fontSize: '11px',
                            color: '#64748b',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontWeight: 500
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.borderColor = '#0284c7';
                            e.currentTarget.style.color = '#0284c7';
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.borderColor = '#cbd5e1';
                            e.currentTarget.style.color = '#64748b';
                          }}
                        >
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                          + Add Tracking
                        </button>
                      )}
                    </div>
                  </td>

                  {/* 2. Contact & Address */}
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#1e293b', fontWeight: 600, fontSize: '13px' }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                        {patient.phone}
                      </div>

                      {primaryName && (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '11px', color: '#4338ca', background: '#eef2ff', border: '1px solid #c7d2fe', padding: '1px 7px', borderRadius: '10px', fontWeight: 600, width: 'fit-content' }}>
                          Primary: {primaryName}
                        </div>
                      )}

                      {patient.address && (
                        <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'flex-start', gap: '4px', marginTop: '2px', lineHeight: 1.3 }}>
                          <span style={{ color: '#94a3b8' }}>📍</span>
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }} title={patient.address}>
                            {patient.address}
                          </span>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* 3. Medical Files */}
                  <td>
                    {patient.files && patient.files.length > 0 ? (
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {patient.files.map((file: any) => (
                          <div
                            key={file.id}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              background: '#f0f9ff',
                              borderRadius: '6px',
                              border: '1px solid #bae6fd',
                              overflow: 'hidden',
                              fontSize: '12px'
                            }}
                          >
                            <a
                              href={file.fileUrl}
                              download={file.fileName}
                              target="_blank"
                              rel="noreferrer"
                              style={{ color: '#0284c7', textDecoration: 'none', padding: '3px 7px', fontWeight: 500, maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                              title={file.fileName}
                            >
                              📄 {file.fileName}
                            </a>
                            <button
                              type="button"
                              onClick={() => handleDeleteFile(patient.id, file.id, file.fileName)}
                              disabled={deletingFileId === file.id}
                              title={`Delete file ${file.fileName}`}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                borderLeft: '1px solid #bae6fd',
                                color: '#ef4444',
                                cursor: 'pointer',
                                padding: '3px 5px',
                                display: 'inline-flex',
                                alignItems: 'center'
                              }}
                              onMouseOver={(e) => e.currentTarget.style.background = '#fee2e2'}
                              onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: '12px', fontStyle: 'italic' }}>— No files —</span>
                    )}
                  </td>

                  {/* 4. Invoices */}
                  <td>
                    {patient.invoices && patient.invoices.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {patient.invoices.map((inv: any) => (
                          <button
                            key={inv.id}
                            onClick={() => setViewInvoice({ invoice: inv, patient })}
                            style={{ 
                              background: '#f8fafc',
                              border: '1px solid #cbd5e1',
                              padding: '5px 9px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              color: '#334155',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '6px',
                              transition: 'all 0.15s'
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.borderColor = '#0284c7';
                              e.currentTarget.style.background = '#f0f9ff';
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.borderColor = '#cbd5e1';
                              e.currentTarget.style.background = '#f8fafc';
                            }}
                          >
                            <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{inv.invoiceNo}</span>
                            <span style={{ fontWeight: 700, color: '#059669' }}>₹{inv.totalAmount}</span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: '12px', fontStyle: 'italic' }}>— No invoices —</span>
                    )}
                  </td>

                  {/* 5. Actions (Never Wraps) */}
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => setInvoiceModalPatient(patient)}
                        className="action-btn prescribe"
                        title="Generate Tax Invoice"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                          <polyline points="14 2 14 8 20 8"></polyline>
                          <line x1="16" y1="13" x2="8" y2="13"></line>
                          <line x1="16" y1="17" x2="8" y2="17"></line>
                          <polyline points="10 9 9 9 8 9"></polyline>
                        </svg>
                        <span>Generate Invoice</span>
                      </button>

                      <button
                        onClick={() => handleDeletePatient(patient)}
                        disabled={deletingPatientId === patient.id}
                        className="action-btn delete-btn"
                        title="Delete Patient Record"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                        <span>{deletingPatientId === patient.id ? '...' : 'Delete'}</span>
                      </button>
                    </div>
                  </td>
                </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {isAddModalOpen && (
        <AddPatientModal 
          onClose={() => setIsAddModalOpen(false)} 
          onAdded={handlePatientAdded} 
          doctors={doctors}
        />
      )}

      {invoiceModalPatient && (
        <InvoiceGeneratorModal
          patient={invoiceModalPatient}
          onClose={() => setInvoiceModalPatient(null)}
          onGenerated={handleInvoiceGenerated}
        />
      )}

      {viewInvoice && (
        <InvoiceView
          invoice={viewInvoice.invoice}
          patient={viewInvoice.patient}
          onClose={() => setViewInvoice(null)}
          onDeleted={handleInvoiceDeleted}
        />
      )}



      {/* Edit / Add Consignment Details Modal */}
      {editingConsignmentPatient && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2100, padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '480px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
                  Consignment & Dispatch Details
                </h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#64748b' }}>
                  Patient: <span style={{ fontWeight: 600, color: '#0284c7' }}>{editingConsignmentPatient.name}</span> ({editingConsignmentPatient.uhid || editingConsignmentPatient.phone})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingConsignmentPatient(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            <form onSubmit={handleSaveConsignment}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Consignment / Tracking Number
                </label>
                <input
                  type="text"
                  name="consignmentNo"
                  defaultValue={editingConsignmentPatient.consignmentNo || ''}
                  placeholder="e.g. DTDC123456789 / SPEEDPOST123"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Consignment Image / Slip Photo
                </label>
                {editingConsignmentPatient.consignmentImage && (
                  <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img
                      src={editingConsignmentPatient.consignmentImage}
                      alt="Consignment Slip"
                      style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                    <a
                      href={editingConsignmentPatient.consignmentImage}
                      target="_blank"
                      rel="noreferrer"
                      style={{ fontSize: '12px', color: '#0284c7', textDecoration: 'underline' }}
                    >
                      View Current Slip
                    </a>
                  </div>
                )}
                <input
                  type="file"
                  name="consignmentImageFile"
                  accept="image/*"
                  style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px dashed #cbd5e1', background: '#f8fafc', fontSize: '13px' }}
                />
                <span style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', display: 'block' }}>
                  Upload photo of courier receipt, parcel label, or consignment slip.
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setEditingConsignmentPatient(null)}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', color: '#475569', fontWeight: 600, cursor: 'pointer', fontSize: '13px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingConsignment}
                  style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', background: '#02559d', color: 'white', fontWeight: 600, cursor: isSavingConsignment ? 'not-allowed' : 'pointer', fontSize: '13px', opacity: isSavingConsignment ? 0.7 : 1 }}
                >
                  {isSavingConsignment ? 'Saving...' : 'Save Consignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
