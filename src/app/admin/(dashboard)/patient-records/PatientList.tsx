'use client';

import React, { useState } from 'react';
import AddPatientModal from './AddPatientModal';
import InvoiceGeneratorModal from './InvoiceGeneratorModal';
import InvoiceView from './InvoiceView';
import RevenueStatementModal from './RevenueStatementModal';

export default function PatientList({ initialPatients, doctors }: { initialPatients: any[], doctors: any[] }) {
  const [patients, setPatients] = useState(initialPatients);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [invoiceModalPatient, setInvoiceModalPatient] = useState<any>(null);
  const [viewInvoice, setViewInvoice] = useState<any>(null);
  const [deletingPatientId, setDeletingPatientId] = useState<string | null>(null);
  const [deletingFileId, setDeletingFileId] = useState<string | null>(null);

  // Date Filter & Statement States
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [datePreset, setDatePreset] = useState<'all' | 'this-month' | 'last-month' | 'last-30'>('all');
  const [isStatementModalOpen, setIsStatementModalOpen] = useState(false);

  const handleSelectPreset = (preset: 'all' | 'this-month' | 'last-month' | 'last-30') => {
    setDatePreset(preset);
    const now = new Date();
    if (preset === 'all') {
      setFromDate('');
      setToDate('');
    } else if (preset === 'this-month') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      setFromDate(firstDay.toISOString().split('T')[0]);
      setToDate(lastDay.toISOString().split('T')[0]);
    } else if (preset === 'last-month') {
      const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth(), 0);
      setFromDate(firstDay.toISOString().split('T')[0]);
      setToDate(lastDay.toISOString().split('T')[0]);
    } else if (preset === 'last-30') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(now.getDate() - 30);
      setFromDate(thirtyDaysAgo.toISOString().split('T')[0]);
      setToDate(now.toISOString().split('T')[0]);
    }
  };

  const isInvoiceInDateRange = (inv: any) => {
    if (!fromDate && !toDate) return true;
    const invDateStr = inv.billDate || inv.createdAt;
    if (!invDateStr) return true;
    const invDate = new Date(invDateStr).toISOString().split('T')[0];
    if (fromDate && invDate < fromDate) return false;
    if (toDate && invDate > toDate) return false;
    return true;
  };

  // Compute Revenue Summary & Statement Transactions
  const transactions: any[] = [];
  let totalGross = 0;
  let totalDiscount = 0;
  let totalNetRevenue = 0;
  let totalPaid = 0;
  let totalDue = 0;
  const patientIdsWithInvoices = new Set<string>();

  patients.forEach((patient: any) => {
    (patient.invoices || []).forEach((inv: any) => {
      if (isInvoiceInDateRange(inv)) {
        patientIdsWithInvoices.add(patient.id);
        const gross = (Number(inv.totalAmount) || 0) + (Number(inv.discount) || 0);
        const disc = Number(inv.discount) || 0;
        const net = Number(inv.totalAmount) || 0;
        const paid = Number(inv.paidAmount) || net;
        const due = Number(inv.dueAmount) || 0;

        totalGross += gross;
        totalDiscount += disc;
        totalNetRevenue += net;
        totalPaid += paid;
        totalDue += due;

        const dateFormatted = new Date(inv.billDate || inv.createdAt).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        });

        transactions.push({
          sNo: transactions.length + 1,
          date: dateFormatted,
          patientName: patient.name,
          uhid: patient.uhid || 'N/A',
          phone: patient.phone,
          invoiceNo: inv.invoiceNo,
          payMode: inv.payMode || 'UPI',
          grossAmount: gross,
          discount: disc,
          netRevenue: net,
          paidAmount: paid,
          dueAmount: due,
        });
      }
    });
  });

  const revenueSummary = {
    totalGross,
    totalDiscount,
    totalNetRevenue,
    totalPaid,
    totalDue,
    invoiceCount: transactions.length,
    patientCount: patientIdsWithInvoices.size,
  };

  const getPatientRevenue = (patient: any) => {
    const matchingInvoices = (patient.invoices || []).filter(isInvoiceInDateRange);
    if (matchingInvoices.length === 0) return null;

    let gross = 0;
    let disc = 0;
    let net = 0;
    let due = 0;

    matchingInvoices.forEach((inv: any) => {
      gross += (Number(inv.totalAmount) || 0) + (Number(inv.discount) || 0);
      disc += Number(inv.discount) || 0;
      net += Number(inv.totalAmount) || 0;
      due += Number(inv.dueAmount) || 0;
    });

    return { gross, disc, net, due, count: matchingInvoices.length };
  };

  const getDateRangeLabel = () => {
    if (datePreset === 'this-month') return 'This Month';
    if (datePreset === 'last-month') return 'Last Month';
    if (datePreset === 'last-30') return 'Last 30 Days';
    if (fromDate && toDate) return `${fromDate} to ${toDate}`;
    if (fromDate) return `From ${fromDate}`;
    if (toDate) return `Up to ${toDate}`;
    return 'All Time';
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
        }
        .patient-table th {
          padding: 16px 20px;
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
          padding: 16px 20px;
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
          background: #ecfdf5;
          color: #059669;
        }
        .action-btn.prescribe:hover {
          background: #d1fae5;
          color: #047857;
        }
        .action-btn.delete-btn {
          background: #fef2f2;
          color: #dc2626;
          border: 1px solid #fee2e2;
        }
        .action-btn.delete-btn:hover:not(:disabled) {
          background: #fee2e2;
          color: #b91c1c;
          border-color: #fca5a5;
        }
        .action-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .search-container:focus-within svg {
          color: #2563eb !important;
        }
        
        .header-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          gap: 16px;
        }

        .revenue-card {
          background: white;
          border-radius: 12px;
          padding: 18px 20px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 2px 4px rgba(0,0,0,0.02);
          display: flex;
          flex-direction: column;
          gap: 4px;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .revenue-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(0,0,0,0.05);
        }
        .revenue-card.primary {
          background: linear-gradient(135deg, #065f46 0%, #047857 100%);
          border-color: #059669;
          color: white;
        }

        .preset-btn {
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          border: 1px solid #cbd5e1;
          background: white;
          color: #475569;
          transition: all 0.15s;
        }
        .preset-btn:hover {
          background: #f1f5f9;
          color: #0f172a;
        }
        .preset-btn.active {
          background: #02559d;
          color: white;
          border-color: #02559d;
        }
        
        .table-responsive {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.04);
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
          .patient-table th, .patient-row td {
            padding: 12px 14px;
            font-size: 13px;
          }
          .patient-table th {
            white-space: nowrap;
          }
        }
      `}</style>

      {/* Main Page Title & Add Button */}
      <div className="header-container">
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1a202c', margin: '0 0 6px 0' }}>
            Patient Records & Benva Revenue
          </h1>
          <p style={{ color: '#64748b', margin: 0, fontSize: '15px' }}>
            Manage patient records, prescriptions, invoices, and download revenue statements.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setIsStatementModalOpen(true)}
            style={{
              background: '#047857',
              color: 'white',
              padding: '10px 18px',
              borderRadius: '8px',
              border: 'none',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 6px -1px rgba(4, 120, 87, 0.25)',
              whiteSpace: 'nowrap'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            Download Bank Statement
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            style={{
              background: '#02559d',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer',
              boxShadow: '0 4px 6px -1px rgba(2, 85, 157, 0.25)',
              whiteSpace: 'nowrap'
            }}
          >
            + Add New Patient Data
          </button>
        </div>
      </div>

      {/* Benva Revenue Summary Cards (Paina vachey options / Top metrics) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '20px' }}>
        {/* 1. Benva Net Revenue (Featured Card) */}
        <div className="revenue-card primary">
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 0.9, fontWeight: 700 }}>
            ★ Benva Net Revenue (Anni Ponu)
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, marginTop: '2px' }}>
            ₹{revenueSummary.totalNetRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '11px', opacity: 0.85 }}>
            Net profit/revenue collected after all deductions
          </div>
        </div>

        {/* 2. Total Gross Billed */}
        <div className="revenue-card">
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748b', fontWeight: 600 }}>
            Total Gross Billed
          </div>
          <div style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
            ₹{revenueSummary.totalGross.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '11px', color: '#64748b' }}>
            Total invoices billing value
          </div>
        </div>

        {/* 3. Deductions & Discounts */}
        <div className="revenue-card" style={{ borderLeft: '4px solid #ef4444' }}>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#dc2626', fontWeight: 600 }}>
            Total Deductions / Discounts
          </div>
          <div style={{ fontSize: '22px', fontWeight: 700, color: '#dc2626', marginTop: '2px' }}>
            -₹{revenueSummary.totalDiscount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '11px', color: '#991b1b' }}>
            Discounts deducted from gross
          </div>
        </div>

        {/* 4. Total Amount Received */}
        <div className="revenue-card" style={{ borderLeft: '4px solid #10b981' }}>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#059669', fontWeight: 600 }}>
            Total Amount Received
          </div>
          <div style={{ fontSize: '22px', fontWeight: 700, color: '#059669', marginTop: '2px' }}>
            ₹{revenueSummary.totalPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '11px', color: '#047857' }}>
            Successfully collected payments
          </div>
        </div>

        {/* 5. Balance Due */}
        <div className="revenue-card" style={{ borderLeft: '4px solid #f59e0b' }}>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#d97706', fontWeight: 600 }}>
            Balance Due / Pending
          </div>
          <div style={{ fontSize: '22px', fontWeight: 700, color: '#d97706', marginTop: '2px' }}>
            ₹{revenueSummary.totalDue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '11px', color: '#b45309' }}>
            {revenueSummary.invoiceCount} invoices across {revenueSummary.patientCount} patients
          </div>
        </div>
      </div>

      {/* Date Filter & Quick Range Selectors Toolbar */}
      <div
        style={{
          background: 'white',
          borderRadius: '12px',
          padding: '14px 18px',
          border: '1px solid #e2e8f0',
          marginBottom: '20px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '14px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>
            Filter Statement Period:
          </span>
          <button
            onClick={() => handleSelectPreset('all')}
            className={`preset-btn ${datePreset === 'all' ? 'active' : ''}`}
          >
            All Time
          </button>
          <button
            onClick={() => handleSelectPreset('this-month')}
            className={`preset-btn ${datePreset === 'this-month' ? 'active' : ''}`}
          >
            This Month
          </button>
          <button
            onClick={() => handleSelectPreset('last-month')}
            className={`preset-btn ${datePreset === 'last-month' ? 'active' : ''}`}
          >
            Last Month
          </button>
          <button
            onClick={() => handleSelectPreset('last-30')}
            className={`preset-btn ${datePreset === 'last-30' ? 'active' : ''}`}
          >
            Last 30 Days
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>From:</span>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
                setDatePreset('all');
              }}
              style={{
                padding: '6px 10px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                color: '#334155'
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>To:</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value);
                setDatePreset('all');
              }}
              style={{
                padding: '6px 10px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                color: '#334155'
              }}
            />
          </div>

          {(fromDate || toDate) && (
            <button
              onClick={() => handleSelectPreset('all')}
              style={{
                background: '#f1f5f9',
                border: 'none',
                padding: '6px 10px',
                borderRadius: '6px',
                fontSize: '12px',
                color: '#64748b',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Search Input */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '16px', alignItems: 'center' }}>
        <div className="search-container" style={{ position: 'relative', width: '100%', maxWidth: '440px' }}>
          <input 
            type="text" 
            placeholder="Search by Patient Name, Phone, or UHID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ padding: '12px 16px 12px 42px', borderRadius: '8px', border: '1px solid #cbd5e1', width: '100%', fontSize: '14px', transition: 'all 0.2s' }}
          />
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '18px', height: '18px', color: '#94a3b8', transition: 'color 0.2s' }}>
            <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>
      </div>

      {/* Patient Table with Benva Revenue Column and Delete Action */}
      <div className="table-responsive">
        <table className="patient-table">
          <thead>
            <tr>
              <th>Patient Details</th>
              <th>Contact</th>
              <th>Files</th>
              <th>Invoices</th>
              <th style={{ background: '#01447e' }}>Benva Revenue (Net)</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '64px 24px', textAlign: 'center' }}>
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
                const rev = getPatientRevenue(patient);

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
                          <div
                            key={file.id}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              background: '#f0f9ff',
                              borderRadius: '6px',
                              border: '1px solid #bae6fd',
                              overflow: 'hidden'
                            }}
                          >
                            <a
                              href={file.fileUrl}
                              download={file.fileName}
                              target="_blank"
                              rel="noreferrer"
                              style={{ fontSize: '13px', color: '#0284c7', textDecoration: 'underline', padding: '4px 8px' }}
                            >
                              {file.fileName}
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
                                padding: '4px 6px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                              onMouseOver={(e) => e.currentTarget.style.background = '#fee2e2'}
                              onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                              </svg>
                            </button>
                          </div>
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

                  {/* Benva Revenue Column ("Anni ponu each user dantlo") */}
                  <td style={{ verticalAlign: 'middle' }}>
                    {rev ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <div style={{ fontSize: '16px', fontWeight: 800, color: '#059669' }}>
                          ₹{rev.net.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b', display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <span>Gross: ₹{rev.gross.toLocaleString('en-IN')}</span>
                          {rev.disc > 0 && <span style={{ color: '#dc2626' }}>(-₹{rev.disc.toLocaleString('en-IN')})</span>}
                        </div>
                        {rev.due > 0 && (
                          <div style={{ fontSize: '11px', color: '#d97706', fontWeight: 600 }}>
                            Due: ₹{rev.due.toLocaleString('en-IN')}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: '13px', fontStyle: 'italic' }}>₹0.00</span>
                    )}
                  </td>

                  {/* Actions Column (Generate Invoice + Delete Patient Record) */}
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                      <button
                        onClick={() => setInvoiceModalPatient(patient)}
                        className="action-btn prescribe"
                        style={{ background: '#ecfdf5', color: '#059669', display: 'inline-flex', alignItems: 'center' }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', marginRight: '6px', verticalAlign: 'middle' }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                        Generate Invoice
                      </button>
                      <button
                        onClick={() => handleDeletePatient(patient)}
                        disabled={deletingPatientId === patient.id}
                        className="action-btn delete-btn"
                        style={{ display: 'inline-flex', alignItems: 'center' }}
                        title="Delete Patient Record"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', marginRight: '6px', verticalAlign: 'middle' }}><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                        {deletingPatientId === patient.id ? 'Deleting...' : 'Delete'}
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

      {/* Official Bank Statement Modal */}
      {isStatementModalOpen && (
        <RevenueStatementModal
          onClose={() => setIsStatementModalOpen(false)}
          transactions={transactions}
          summary={revenueSummary}
          dateRange={{
            from: fromDate,
            to: toDate,
            label: getDateRangeLabel()
          }}
        />
      )}
    </div>
  );
}
