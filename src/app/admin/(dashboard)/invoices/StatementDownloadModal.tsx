'use client';

import React, { useState } from 'react';

interface Props {
  invoices: any[];
  isOpen: boolean;
  onClose: () => void;
}

export default function StatementDownloadModal({ invoices, isOpen, onClose }: Props) {
  const [downloadType, setDownloadType] = useState<'STATEMENT' | 'MONTH' | 'CUSTOM'>('STATEMENT');
  const [selectedMonth, setSelectedMonth] = useState('2026-11');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedModule, setSelectedModule] = useState('ALL');

  if (!isOpen) return null;

  // Filter invoices based on selected options
  let filtered = [...invoices];

  if (selectedModule !== 'ALL') {
    filtered = filtered.filter(i => i.module === selectedModule);
  }

  if (downloadType === 'MONTH') {
    filtered = filtered.filter(i => {
      const d = new Date(i.billDate || i.createdAt);
      const mStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      return mStr === selectedMonth;
    });
  } else if (downloadType === 'CUSTOM') {
    if (fromDate) {
      const from = new Date(fromDate).getTime();
      filtered = filtered.filter(i => new Date(i.billDate || i.createdAt).getTime() >= from);
    }
    if (toDate) {
      const to = new Date(toDate).getTime() + 86400000;
      filtered = filtered.filter(i => new Date(i.billDate || i.createdAt).getTime() <= to);
    }
  }

  // Totals
  const totalInvoices = filtered.length;
  const totalBusiness = filtered.reduce((acc, i) => acc + (Number(i.totalAmount) || 0), 0);
  const totalPaid = filtered.reduce((acc, i) => acc + (Number(i.paidAmount) || 0), 0);
  const totalPending = filtered.reduce((acc, i) => acc + (Number(i.dueAmount) || 0), 0);
  const totalBenvaRevenue = filtered.reduce((acc, i) => acc + (Number(i.benvaRevenue) || 0), 0);

  // CSV Export
  const handleExportCSV = () => {
    const headers = [
      'Invoice Number',
      'Invoice Date',
      'Customer / Patient',
      'UHID',
      'Mobile Number',
      'Billing Module',
      'Bill Type',
      'Total Amount (₹)',
      'Paid Amount (₹)',
      'Pending Amount (₹)',
      'Payment Status',
      'Invoice Status',
      'Benva Revenue (₹)'
    ];

    const rows = filtered.map(i => [
      `"${i.invoiceNo}"`,
      `"${new Date(i.billDate || i.createdAt).toLocaleDateString()}"`,
      `"${i.patient?.name || 'Customer'}"`,
      `"${i.patient?.uhid || 'N/A'}"`,
      `"${i.patient?.phone || ''}"`,
      `"${i.module || 'MEDICINES'}"`,
      `"${i.billType || 'GST'}"`,
      Number(i.totalAmount || 0).toFixed(2),
      Number(i.paidAmount || 0).toFixed(2),
      Number(i.dueAmount || 0).toFixed(2),
      `"${i.paymentStatus || 'PAID'}"`,
      `"${i.invoiceStatus || 'GENERATED'}"`,
      Number(i.benvaRevenue || 0).toFixed(2)
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Benva_Billing_Statement_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print PDF Statement
  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(4px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '850px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#f8fafc'
        }}>
          <div>
            <h2 style={{ fontSize: '17px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
              📥 Download Statements & Financial Reports
            </h2>
            <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>
              Statement-Wise • Month-Wise • Custom Range in PDF & Excel
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '22px',
              color: '#64748b',
              cursor: 'pointer'
            }}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Download Options Switch */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            {[
              { key: 'STATEMENT', label: '1. Statement-Wise', desc: 'All invoices in period' },
              { key: 'MONTH', label: '2. Month-Wise', desc: 'Select specific billing month' },
              { key: 'CUSTOM', label: '3. Custom Range', desc: 'Filter by start & end date' },
            ].map(tab => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setDownloadType(tab.key as any)}
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  border: downloadType === tab.key ? '2px solid #0284c7' : '1px solid #cbd5e1',
                  backgroundColor: downloadType === tab.key ? '#f0f9ff' : '#ffffff',
                  color: downloadType === tab.key ? '#0369a1' : '#334155',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <div style={{ fontWeight: '700', fontSize: '13px' }}>{tab.label}</div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{tab.desc}</div>
              </button>
            ))}
          </div>

          {/* Filter Inputs */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: downloadType === 'CUSTOM' ? '1fr 1fr 1fr' : '1fr 1fr',
            gap: '12px',
            backgroundColor: '#f8fafc',
            padding: '14px',
            borderRadius: '8px',
            border: '1px solid #e2e8f0'
          }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>
                Module Filter
              </label>
              <select
                value={selectedModule}
                onChange={(e) => setSelectedModule(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', fontSize: '13px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
              >
                <option value="ALL">All 4 Billing Modules</option>
                <option value="MEDICINES">Medicines</option>
                <option value="LAB_TESTS">Lab Tests & Packages</option>
                <option value="DOCTOR">Doctor Consultations</option>
                <option value="DIETITIAN">Dietitian Plans</option>
              </select>
            </div>

            {downloadType === 'MONTH' && (
              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>
                  Select Month
                </label>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', fontSize: '13px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                />
              </div>
            )}

            {downloadType === 'CUSTOM' && (
              <>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>
                    From Date
                  </label>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', fontSize: '13px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>
                    To Date
                  </label>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', fontSize: '13px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  />
                </div>
              </>
            )}
          </div>

          {/* Statement Financial Summary */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '10px',
            backgroundColor: '#0f172a',
            padding: '14px',
            borderRadius: '8px',
            color: '#ffffff'
          }}>
            <div>
              <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>Invoices</div>
              <div style={{ fontSize: '18px', fontWeight: '800' }}>{totalInvoices}</div>
            </div>
            <div>
              <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>Total Business</div>
              <div style={{ fontSize: '18px', fontWeight: '800', color: '#38bdf8' }}>₹{totalBusiness.toFixed(0)}</div>
            </div>
            <div>
              <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>Paid Amount</div>
              <div style={{ fontSize: '18px', fontWeight: '800', color: '#4ade80' }}>₹{totalPaid.toFixed(0)}</div>
            </div>
            <div>
              <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>Pending Amount</div>
              <div style={{ fontSize: '18px', fontWeight: '800', color: '#f87171' }}>₹{totalPending.toFixed(0)}</div>
            </div>
            <div>
              <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>Benva Revenue</div>
              <div style={{ fontSize: '18px', fontWeight: '800', color: '#facc15' }}>₹{totalBenvaRevenue.toFixed(0)}</div>
            </div>
          </div>

          {/* Table Preview */}
          <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #cbd5e1', borderRadius: '6px' }}>
            <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ backgroundColor: '#f1f5f9', position: 'sticky', top: 0 }}>
                <tr>
                  <th style={{ padding: '6px 8px' }}>Inv #</th>
                  <th style={{ padding: '6px 8px' }}>Customer (UHID)</th>
                  <th style={{ padding: '6px 8px' }}>Module</th>
                  <th style={{ padding: '6px 8px', textAlign: 'right' }}>Total (₹)</th>
                  <th style={{ padding: '6px 8px', textAlign: 'right' }}>Paid (₹)</th>
                  <th style={{ padding: '6px 8px', textAlign: 'right' }}>Benva Rev (₹)</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 15).map((inv, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '6px 8px', fontWeight: '700' }}>{inv.invoiceNo}</td>
                    <td style={{ padding: '6px 8px' }}>{inv.patient?.name || 'Customer'} ({inv.patient?.uhid || 'N/A'})</td>
                    <td style={{ padding: '6px 8px' }}>{inv.module}</td>
                    <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: '600' }}>₹{Number(inv.totalAmount).toFixed(2)}</td>
                    <td style={{ padding: '6px 8px', textAlign: 'right', color: '#16a34a' }}>₹{Number(inv.paidAmount).toFixed(2)}</td>
                    <td style={{ padding: '6px 8px', textAlign: 'right', color: '#0284c7', fontWeight: '700' }}>₹{Number(inv.benvaRevenue).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Download Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '8px' }}>
            <button
              type="button"
              onClick={handlePrintPDF}
              style={{
                padding: '10px 18px',
                backgroundColor: '#ffffff',
                color: '#0284c7',
                border: '1.5px solid #0284c7',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>🖨️</span> Print / Save as PDF
            </button>
            <button
              type="button"
              onClick={handleExportCSV}
              style={{
                padding: '10px 22px',
                backgroundColor: '#16a34a',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '800',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>📊</span> Download Excel (CSV)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
