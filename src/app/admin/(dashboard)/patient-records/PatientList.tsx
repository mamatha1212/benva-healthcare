'use client';

import React, { useState } from 'react';
import AddPatientModal from './AddPatientModal';
import InvoiceGeneratorModal from './InvoiceGeneratorModal';
import InvoiceView from './InvoiceView';

export default function PatientList({ initialPatients }: { initialPatients: any[] }) {
  const [patients, setPatients] = useState(initialPatients);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [invoiceModalPatient, setInvoiceModalPatient] = useState<any>(null);
  const [viewInvoice, setViewInvoice] = useState<any>(null);

  const handlePatientAdded = (newPatient: any) => {
    setPatients([newPatient, ...patients]);
    setIsAddModalOpen(false);
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

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
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

      <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
              <th style={{ padding: '16px', color: '#475569', fontWeight: 600, fontSize: '14px' }}>Name</th>
              <th style={{ padding: '16px', color: '#475569', fontWeight: 600, fontSize: '14px' }}>Contact</th>
              <th style={{ padding: '16px', color: '#475569', fontWeight: 600, fontSize: '14px' }}>Files</th>
              <th style={{ padding: '16px', color: '#475569', fontWeight: 600, fontSize: '14px' }}>Invoices</th>
              <th style={{ padding: '16px', color: '#475569', fontWeight: 600, fontSize: '14px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {patients.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
                  No patient records found. Click "Add New Patient Data" to get started.
                </td>
              </tr>
            ) : (
              patients.map(patient => (
                <tr key={patient.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontWeight: 600, color: '#1e293b' }}>{patient.name}</div>
                    <div style={{ fontSize: '13px', color: '#64748b' }}>{patient.age ? `${patient.age} Y` : ''} {patient.gender ? `/ ${patient.gender}` : ''}</div>
                  </td>
                  <td style={{ padding: '16px', color: '#475569' }}>
                    <div>{patient.phone}</div>
                    <div style={{ fontSize: '13px' }}>{patient.address}</div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    {patient.files && patient.files.length > 0 ? (
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {patient.files.map((file: any) => (
                          <a key={file.id} href={file.fileUrl} target="_blank" rel="noreferrer" style={{ fontSize: '13px', color: '#2563eb', textDecoration: 'underline' }}>
                            {file.fileName}
                          </a>
                        ))}
                      </div>
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: '13px' }}>No files</span>
                    )}
                  </td>
                  <td style={{ padding: '16px' }}>
                    {patient.invoices && patient.invoices.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {patient.invoices.map((inv: any) => (
                          <button
                            key={inv.id}
                            onClick={() => setViewInvoice({ invoice: inv, patient })}
                            style={{ 
                              background: 'none', 
                              border: '1px solid #e2e8f0', 
                              padding: '4px 8px', 
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '13px',
                              color: '#334155',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between'
                            }}
                          >
                            <span>{inv.invoiceNo}</span>
                            <span style={{ fontWeight: 600, marginLeft: '8px' }}>₹{inv.totalAmount}</span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: '13px' }}>No invoices</span>
                    )}
                  </td>
                  <td style={{ padding: '16px' }}>
                    <button
                      onClick={() => setInvoiceModalPatient(patient)}
                      style={{
                        background: '#10b981',
                        color: 'white',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: 'none',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Generate Invoice
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isAddModalOpen && (
        <AddPatientModal 
          onClose={() => setIsAddModalOpen(false)} 
          onAdded={handlePatientAdded} 
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
