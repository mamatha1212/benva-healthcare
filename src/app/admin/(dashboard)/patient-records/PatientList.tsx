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
        }
        .patient-table th {
          padding: 16px 24px;
          background: #02559d;
          color: white;
          font-size: 13px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 2px solid #013b6e;
        }
        .patient-table th:first-child {
          border-top-left-radius: 12px;
        }
        .patient-table th:last-child {
          border-top-right-radius: 12px;
        }
        .patient-row {
          border-bottom: 1px solid #e2e8f0;
          transition: all 0.2s ease;
        }
        .patient-row:hover {
          background-color: #f0f7ff;
        }
        .patient-row td {
          padding: 16px 24px;
          color: #475569;
          font-size: 14px;
        }
        .action-btn {
          background: #f1f5f9;
          border: none;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          color: #475569;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .action-btn:hover {
          background: #e2e8f0;
          color: #0f172a;
        }
        .action-btn.prescribe {
          background: #e0f2fe;
          color: #0369a1;
        }
        .action-btn.prescribe:hover {
          background: #bae6fd;
          color: #0284c7;
        }
        .search-container:focus-within svg {
          color: #2563eb !important;
        }
      `}</style>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1a202c', margin: '0 0 8px 0' }}>Patient Records</h1>
          <p style={{ color: '#64748b', margin: 0, fontSize: '15px' }}>
            Manage patient records, prescriptions, and generate invoices.
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          style={{
            background: '#2563eb',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '8px',
            border: 'none',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)'
          }}
        >
          + Add New Patient Data
        </button>
      </div>

      <div style={{ marginBottom: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
        <div className="search-container" style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
          <input 
            type="text" 
            placeholder="Search by Name, Phone, or UHID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ padding: '12px 16px 12px 42px', borderRadius: '8px', border: '1px solid #cbd5e1', width: '100%', fontSize: '14px', transition: 'all 0.2s' }}
          />
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '18px', height: '18px', color: '#94a3b8', transition: 'color 0.2s' }}>
            <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.04)', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
        <table className="patient-table">
          <thead>
            <tr>
              <th>Patient Details</th>
              <th>Contact</th>
              <th>Files</th>
              <th>Invoices</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '64px 24px', textAlign: 'center' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '80px', height: '80px', borderRadius: '50%', background: '#f0f7ff', color: '#02559d', marginBottom: '16px' }}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                  </div>
                  <h3 style={{ margin: '0 0 8px 0', color: '#0f172a', fontSize: '18px', fontWeight: 600 }}>No Patients Found</h3>
                  <p style={{ margin: 0, color: '#64748b' }}>We couldn't find any patient records matching your search.</p>
                </td>
              </tr>
            ) : (
              filteredPatients.map((patient: any) => {
                const primaryName = getPrimaryName(patient.phone, patient.id);
                return (
                <tr key={patient.id} className="patient-row">
                  <td>
                    <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '15px' }}>{patient.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                      {patient.uhid && <span style={{ fontSize: '12px', color: '#64748b', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontWeight: 500 }}>{patient.uhid}</span>}
                      <span style={{ fontSize: '13px', color: '#64748b' }}>{patient.age ? `${patient.age} Y` : ''} {patient.gender ? `/ ${patient.gender}` : ''}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#334155' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                        {patient.phone}
                      </div>
                      {primaryName && (
                        <div style={{ display: 'inline-flex', alignItems: 'center', fontSize: '11px', color: '#4338ca', background: '#e0e7ff', padding: '2px 8px', borderRadius: '12px', fontWeight: 600, width: 'fit-content' }}>
                          Primary: {primaryName}
                        </div>
                      )}
                      {patient.address && <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>{patient.address}</div>}
                    </div>
                  </td>
                  <td>
                    {patient.files && patient.files.length > 0 ? (
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {patient.files.map((file: any) => (
                          <a key={file.id} href={file.fileUrl} download={file.fileName} target="_blank" rel="noreferrer" style={{ fontSize: '13px', color: '#0284c7', textDecoration: 'underline', background: '#f0f9ff', padding: '4px 8px', borderRadius: '4px' }}>
                            {file.fileName}
                          </a>
                        ))}
                      </div>
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: '13px', fontStyle: 'italic' }}>No files</span>
                    )}
                  </td>
                  <td>
                    {patient.invoices && patient.invoices.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {patient.invoices.map((inv: any) => (
                          <button
                            key={inv.id}
                            onClick={() => setViewInvoice({ invoice: inv, patient })}
                            style={{ 
                              background: '#f8fafc',
                              border: '1px solid #e2e8f0',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '13px',
                              color: '#334155',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.borderColor = '#cbd5e1'}
                            onMouseOut={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                          >
                            <span>{inv.invoiceNo}</span>
                            <span style={{ fontWeight: 600, marginLeft: '8px', color: '#0f172a' }}>₹{inv.totalAmount}</span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: '13px', fontStyle: 'italic' }}>No invoices</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => setInvoiceModalPatient(patient)}
                      className="action-btn prescribe"
                      style={{ background: '#ecfdf5', color: '#059669' }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', marginRight: '6px', verticalAlign: 'middle' }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                      Generate Invoice
                    </button>
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
        />
      )}
    </div>
  );
}
