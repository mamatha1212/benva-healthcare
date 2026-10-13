'use client';

import React from 'react';

interface InvoiceTransaction {
  sNo: number;
  date: string;
  patientName: string;
  uhid: string;
  phone: string;
  invoiceNo: string;
  payMode: string;
  grossAmount: number;
  discount: number;
  netRevenue: number;
  paidAmount: number;
  dueAmount: number;
}

interface RevenueSummary {
  totalGross: number;
  totalDiscount: number;
  totalNetRevenue: number;
  totalPaid: number;
  totalDue: number;
  invoiceCount: number;
  patientCount: number;
}

interface RevenueStatementModalProps {
  onClose: () => void;
  transactions: InvoiceTransaction[];
  summary: RevenueSummary;
  dateRange: {
    from: string;
    to: string;
    label: string;
  };
}

export default function RevenueStatementModal({
  onClose,
  transactions,
  summary,
  dateRange
}: RevenueStatementModalProps) {
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCSV = () => {
    const headers = [
      'S.No',
      'Date',
      'Patient Name',
      'UHID',
      'Phone',
      'Invoice No',
      'Pay Mode',
      'Gross Amount (INR)',
      'Deductions/Discount (INR)',
      'Net Benva Revenue (INR)',
      'Paid Amount (INR)',
      'Due Amount (INR)'
    ];

    const rows = transactions.map(t => [
      t.sNo,
      `"${t.date}"`,
      `"${t.patientName.replace(/"/g, '""')}"`,
      `"${t.uhid}"`,
      `"${t.phone}"`,
      `"${t.invoiceNo}"`,
      `"${t.payMode || 'N/A'}"`,
      t.grossAmount,
      t.discount,
      t.netRevenue,
      t.paidAmount,
      t.dueAmount
    ]);

    // Summary row
    rows.push([
      'TOTAL',
      '',
      '',
      '',
      '',
      '',
      '',
      summary.totalGross,
      summary.totalDiscount,
      summary.totalNetRevenue,
      summary.totalPaid,
      summary.totalDue
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        `"BENVA HEALTHCARE - OFFICIAL REVENUE STATEMENT"`,
        `"Statement Period: ${dateRange.label} (${dateRange.from || 'Beginning'} to ${dateRange.to || 'Present'})"`,
        `"Generated On: ${new Date().toLocaleString('en-IN')}"`,
        '',
        headers.join(','),
        ...rows.map(e => e.join(','))
      ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Benva_Revenue_Statement_${dateRange.from || 'Start'}_to_${dateRange.to || 'Now'}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatCurrency = (amt: number) => {
    return '₹' + Number(amt || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div
      id="statement-modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        padding: '20px'
      }}
    >
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #statement-modal-overlay,
          #printable-statement,
          #printable-statement * {
            visibility: visible !important;
          }
          #statement-modal-overlay {
            position: absolute !important;
            inset: 0 !important;
            background: white !important;
            padding: 0 !important;
            display: block !important;
          }
          #printable-statement {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            padding: 20px !important;
            background: white !important;
            box-shadow: none !important;
          }
          .no-print {
            display: none !important;
          }
          @page {
            size: A4 landscape;
            margin: 10mm;
          }
        }
      `}</style>

      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '1100px',
          maxHeight: '94vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden'
        }}
      >
        {/* Header Actions (hidden on print) */}
        <div
          className="no-print"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 24px',
            borderBottom: '1px solid #e2e8f0',
            background: '#f8fafc'
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', color: '#0f172a', fontWeight: 700 }}>
              Benva Healthcare — Revenue Statement
            </h2>
            <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#64748b' }}>
              Period: <span style={{ fontWeight: 600, color: '#0284c7' }}>{dateRange.label}</span> ({dateRange.from || 'Start'} to {dateRange.to || 'Today'})
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              onClick={handlePrint}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '8px',
                background: '#02559d',
                color: 'white',
                border: 'none',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 6 2 18 2 18 9"></polyline>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                <rect x="6" y="14" width="12" height="8"></rect>
              </svg>
              Print / Save PDF
            </button>

            <button
              onClick={handleDownloadCSV}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '8px',
                background: '#059669',
                color: 'white',
                border: 'none',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              Export CSV / Excel
            </button>

            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: '#64748b',
                padding: '6px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        {/* Statement Printable Canvas */}
        <div
          id="printable-statement"
          style={{
            padding: '36px 40px',
            overflowY: 'auto',
            background: '#ffffff',
            color: '#1e293b',
            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          }}
        >
          {/* Statement Letterhead / Bank Statement Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #02559d', paddingBottom: '20px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <img
                src="/images/Benva%20NEW.png"
                alt="Benva Healthcare"
                style={{ height: '56px', width: 'auto', objectFit: 'contain' }}
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div>
                <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#02559d', letterSpacing: '-0.5px' }}>
                  BENVA HEALTHCARE
                </h1>
                <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                  Official Financial Revenue Statement & Account Summary
                </p>
                <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#94a3b8' }}>
                  Website: www.benvahealthcare.in | Support: +91 97059 51369
                </p>
              </div>
            </div>

            <div style={{ textAlign: 'right', background: '#f8fafc', padding: '12px 18px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748b', fontWeight: 600, letterSpacing: '0.5px' }}>
                Statement Period
              </div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
                {dateRange.label}
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                {dateRange.from || 'Start'} to {dateRange.to || 'Present'}
              </div>
              <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>
                Generated: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>

          {/* Account Summary Cards - Bank Statement Style */}
          <div style={{ marginBottom: '28px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', color: '#02559d', letterSpacing: '0.05em', marginBottom: '12px' }}>
              Account Summary (Paina vachey options / Overall Totals)
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
              {/* Benva Net Revenue (Highlighted) */}
              <div style={{ background: 'linear-gradient(135deg, #065f46 0%, #047857 100%)', color: 'white', padding: '16px', borderRadius: '10px', boxShadow: '0 4px 6px -1px rgba(5, 150, 105, 0.2)' }}>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', opacity: 0.9, fontWeight: 600, letterSpacing: '0.5px' }}>
                  ★ Benva Net Revenue (Anni Ponu)
                </div>
                <div style={{ fontSize: '24px', fontWeight: 800, marginTop: '6px' }}>
                  {formatCurrency(summary.totalNetRevenue)}
                </div>
                <div style={{ fontSize: '11px', opacity: 0.85, marginTop: '4px' }}>
                  Net earnings after discounts & deductions
                </div>
              </div>

              {/* Total Gross Billed */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '16px', borderRadius: '10px' }}>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748b', fontWeight: 600 }}>
                  Total Gross Billed
                </div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', marginTop: '6px' }}>
                  {formatCurrency(summary.totalGross)}
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                  Total invoice billing value
                </div>
              </div>

              {/* Total Deductions / Discounts */}
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '16px', borderRadius: '10px' }}>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#991b1b', fontWeight: 600 }}>
                  Total Deductions / Discounts
                </div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#dc2626', marginTop: '6px' }}>
                  {formatCurrency(summary.totalDiscount)}
                </div>
                <div style={{ fontSize: '11px', color: '#991b1b', marginTop: '4px' }}>
                  Total discounts given
                </div>
              </div>

              {/* Total Paid / Received */}
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '16px', borderRadius: '10px' }}>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#166534', fontWeight: 600 }}>
                  Total Amount Received
                </div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#15803d', marginTop: '6px' }}>
                  {formatCurrency(summary.totalPaid)}
                </div>
                <div style={{ fontSize: '11px', color: '#166534', marginTop: '4px' }}>
                  Collected via UPI / Cash / Online
                </div>
              </div>

              {/* Balance Due */}
              <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', padding: '16px', borderRadius: '10px' }}>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#92400e', fontWeight: 600 }}>
                  Balance Due / Pending
                </div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#d97706', marginTop: '6px' }}>
                  {formatCurrency(summary.totalDue)}
                </div>
                <div style={{ fontSize: '11px', color: '#92400e', marginTop: '4px' }}>
                  Pending from patients
                </div>
              </div>

              {/* Records count */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '16px', borderRadius: '10px' }}>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748b', fontWeight: 600 }}>
                  Total Transactions
                </div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', marginTop: '6px' }}>
                  {summary.invoiceCount} Invoices
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                  Across {summary.patientCount} Patients
                </div>
              </div>
            </div>
          </div>

          {/* Itemized Transactions Table */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', color: '#02559d', letterSpacing: '0.05em' }}>
                Itemized Statement of Patient Invoices
              </div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                Showing {transactions.length} record{transactions.length === 1 ? '' : 's'}
              </div>
            </div>

            <div style={{ overflowX: 'auto', border: '1px solid #cbd5e1', borderRadius: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#02559d', color: 'white' }}>
                    <th style={{ padding: '10px 12px', fontWeight: 600 }}>S.No</th>
                    <th style={{ padding: '10px 12px', fontWeight: 600 }}>Date</th>
                    <th style={{ padding: '10px 12px', fontWeight: 600 }}>Patient Details</th>
                    <th style={{ padding: '10px 12px', fontWeight: 600 }}>Invoice No.</th>
                    <th style={{ padding: '10px 12px', fontWeight: 600 }}>Mode</th>
                    <th style={{ padding: '10px 12px', fontWeight: 600, textAlign: 'right' }}>Gross (₹)</th>
                    <th style={{ padding: '10px 12px', fontWeight: 600, textAlign: 'right' }}>Deduction (₹)</th>
                    <th style={{ padding: '10px 12px', fontWeight: 600, textAlign: 'right', background: '#034177' }}>Net Revenue (₹)</th>
                    <th style={{ padding: '10px 12px', fontWeight: 600, textAlign: 'right' }}>Paid (₹)</th>
                    <th style={{ padding: '10px 12px', fontWeight: 600, textAlign: 'right' }}>Due (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan={10} style={{ padding: '32px', textAlign: 'center', color: '#64748b', fontStyle: 'italic' }}>
                        No transactions recorded for the selected date range.
                      </td>
                    </tr>
                  ) : (
                    transactions.map((tx, idx) => (
                      <tr
                        key={tx.invoiceNo + idx}
                        style={{
                          borderBottom: '1px solid #e2e8f0',
                          background: idx % 2 === 0 ? '#ffffff' : '#f8fafc'
                        }}
                      >
                        <td style={{ padding: '10px 12px', color: '#64748b' }}>{tx.sNo}</td>
                        <td style={{ padding: '10px 12px', whiteSpace: 'nowrap', color: '#334155' }}>{tx.date}</td>
                        <td style={{ padding: '10px 12px' }}>
                          <div style={{ fontWeight: 600, color: '#0f172a' }}>{tx.patientName}</div>
                          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                            {tx.uhid ? `${tx.uhid} • ` : ''}{tx.phone}
                          </div>
                        </td>
                        <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontWeight: 600, color: '#0284c7' }}>
                          {tx.invoiceNo}
                        </td>
                        <td style={{ padding: '10px 12px', color: '#475569' }}>
                          <span style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 500 }}>
                            {tx.payMode || 'UPI'}
                          </span>
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', color: '#475569' }}>
                          {tx.grossAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', color: tx.discount > 0 ? '#dc2626' : '#94a3b8' }}>
                          {tx.discount > 0 ? `-${tx.discount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '0.00'}
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#047857', background: '#f0fdf4' }}>
                          {tx.netRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', color: '#166534', fontWeight: 600 }}>
                          {tx.paidAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', color: tx.dueAmount > 0 ? '#d97706' : '#94a3b8', fontWeight: tx.dueAmount > 0 ? 600 : 400 }}>
                          {tx.dueAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                {transactions.length > 0 && (
                  <tfoot>
                    <tr style={{ background: '#f1f5f9', borderTop: '2px solid #02559d', fontWeight: 700, color: '#0f172a' }}>
                      <td colSpan={5} style={{ padding: '12px', textAlign: 'right', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.5px' }}>
                        Total Summary:
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        {formatCurrency(summary.totalGross)}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right', color: '#dc2626' }}>
                        {formatCurrency(summary.totalDiscount)}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right', color: '#047857', background: '#dcfce7', fontSize: '13px' }}>
                        {formatCurrency(summary.totalNetRevenue)}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right', color: '#15803d' }}>
                        {formatCurrency(summary.totalPaid)}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right', color: '#d97706' }}>
                        {formatCurrency(summary.totalDue)}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>

          {/* Statement Footer */}
          <div style={{ marginTop: '36px', borderTop: '1px solid #e2e8f0', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: '11px', color: '#94a3b8' }}>
            <div>
              <div>This is a computer-generated official revenue statement issued by Benva Healthcare.</div>
              <div>No physical signature is required. For discrepancies, contact finance@benvahealthcare.in.</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 600, color: '#02559d', fontSize: '12px' }}>BENV HEALTHCARE PVT LTD</div>
              <div>Authorized Administrative Ledger</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
