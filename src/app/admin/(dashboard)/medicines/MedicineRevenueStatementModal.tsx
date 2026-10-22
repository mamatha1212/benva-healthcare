'use client';

import React from 'react';

export interface MedicineOrderTransaction {
  sNo: number;
  date: string;
  patientName: string;
  uhid: string;
  phone: string;
  consignmentNo?: string;
  consignmentImage?: string;
  medicinesList: string;
  grossMrp: number;
  discount: number;
  netRevenue: number;
  actualCost?: number;
  profit?: number;
  status: string;
}

export interface MedicineRevenueSummary {
  totalGrossMrp: number;
  totalDiscount: number;
  totalNetRevenue: number;
  totalActualCost?: number;
  totalProfit?: number;
  ordersCount: number;
  activeCount: number;
}

interface MedicineRevenueStatementModalProps {
  onClose: () => void;
  transactions: MedicineOrderTransaction[];
  summary: MedicineRevenueSummary;
  dateRange: {
    from: string;
    to: string;
    label: string;
  };
}

export default function MedicineRevenueStatementModal({
  onClose,
  transactions,
  summary,
  dateRange
}: MedicineRevenueStatementModalProps) {
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCSV = () => {
    const headers = [
      'S.No',
      'Order Date',
      'Patient Name',
      'UHID',
      'Mobile Number',
      'Consignment No',
      'Medicines Prescribed / Dispatched',
      'Gross MRP (INR)',
      'Discounts / Deductions (INR)',
      'Benva Net Revenue - Anni Ponu (INR)',
      'Actual Cost Afforded (INR)',
      'Benva Profit (INR)',
      'Status'
    ];

    const rows = transactions.map(t => [
      t.sNo,
      `"${t.date}"`,
      `"${(t.patientName || '').replace(/"/g, '""')}"`,
      `"${t.uhid || ''}"`,
      `"${t.phone || ''}"`,
      `"${t.consignmentNo || 'N/A'}"`,
      `"${(t.medicinesList || '').replace(/"/g, '""')}"`,
      t.grossMrp.toFixed(2),
      t.discount.toFixed(2),
      t.netRevenue.toFixed(2),
      (t.actualCost || 0).toFixed(2),
      (t.profit || 0).toFixed(2),
      `"${t.status || 'ACTIVE'}"`
    ]);

    // Summary row
    rows.push([
      'TOTAL (ANNI PONU REVENUE)',
      '',
      '',
      '',
      '',
      '',
      '',
      summary.totalGrossMrp.toFixed(2),
      summary.totalDiscount.toFixed(2),
      summary.totalNetRevenue.toFixed(2),
      `${summary.ordersCount} Orders`
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [
        `"BENVA HEALTHCARE - MEDICINE ORDERS FINANCIAL STATEMENT"`,
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
      `Benva_Medicine_Revenue_Statement_${dateRange.from || 'Start'}_to_${dateRange.to || 'Now'}.csv`
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
          maxWidth: '1150px',
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
            <h2 style={{ margin: 0, fontSize: '18px', color: '#0f172a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>💊</span> Benva Healthcare — Medicines Revenue Statement
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
                transition: 'all 0.2s',
                boxShadow: '0 2px 4px rgba(2, 85, 157, 0.2)'
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
                transition: 'all 0.2s',
                boxShadow: '0 2px 4px rgba(5, 150, 105, 0.2)'
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
                  Pharmacy Dispatch & Medicine Orders Financial Statement
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
              Financial Summary (Paina vachey options / Overall Totals)
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              {/* Benva Net Revenue (Highlighted Anni Ponu) */}
              <div style={{ background: 'linear-gradient(135deg, #065f46 0%, #047857 100%)', color: 'white', padding: '16px', borderRadius: '10px', boxShadow: '0 4px 6px -1px rgba(5, 150, 105, 0.2)' }}>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', opacity: 0.9, fontWeight: 600, letterSpacing: '0.5px' }}>
                  ★ Benva Net Revenue (Anni Ponu)
                </div>
                <div style={{ fontSize: '24px', fontWeight: 800, marginTop: '6px' }}>
                  {formatCurrency(summary.totalNetRevenue)}
                </div>
                <div style={{ fontSize: '11px', opacity: 0.85, marginTop: '4px' }}>
                  Total net collected from medicines
                </div>
              </div>

              {/* Total Gross MRP Billed */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '16px', borderRadius: '10px' }}>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748b', fontWeight: 600 }}>
                  Total Gross MRP Billed
                </div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', marginTop: '6px' }}>
                  {formatCurrency(summary.totalGrossMrp)}
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                  Medicine MRP catalog total
                </div>
              </div>

              {/* Total Deductions / Discounts */}
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '16px', borderRadius: '10px' }}>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#991b1b', fontWeight: 600 }}>
                  Total Deductions / Discounts
                </div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#dc2626', marginTop: '6px' }}>
                  -{formatCurrency(summary.totalDiscount)}
                </div>
                <div style={{ fontSize: '11px', color: '#991b1b', marginTop: '4px' }}>
                  Discounts deducted from MRP
                </div>
              </div>

              {/* Total Orders Dispatched */}
              <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', padding: '16px', borderRadius: '10px' }}>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#0369a1', fontWeight: 600 }}>
                  Orders & Dispatch Count
                </div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#0284c7', marginTop: '6px' }}>
                  {summary.ordersCount} Orders
                </div>
                <div style={{ fontSize: '11px', color: '#0369a1', marginTop: '4px' }}>
                  {summary.activeCount} active patients fulfillment
                </div>
              </div>
            </div>
          </div>

          {/* Itemized Medicine Orders Ledger */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', color: '#0f172a', letterSpacing: '0.05em' }}>
                Medicine Orders Ledger ({transactions.length} Records)
              </div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                Anni Ponu (Each User Dantlo) itemized statement
              </div>
            </div>

            <div style={{ overflowX: 'auto', border: '1px solid #cbd5e1', borderRadius: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ background: '#02559d', color: 'white' }}>
                    <th style={{ padding: '10px 8px', textAlign: 'left', borderRight: '1px solid #03447d', width: '35px' }}>#</th>
                    <th style={{ padding: '10px 8px', textAlign: 'left', borderRight: '1px solid #03447d', minWidth: '75px' }}>Date</th>
                    <th style={{ padding: '10px 10px', textAlign: 'left', borderRight: '1px solid #03447d', minWidth: '130px' }}>Patient & UHID</th>
                    <th style={{ padding: '10px 8px', textAlign: 'left', borderRight: '1px solid #03447d', minWidth: '95px' }}>Mobile</th>
                    <th style={{ padding: '10px 8px', textAlign: 'left', borderRight: '1px solid #03447d', minWidth: '105px' }}>Consignment No</th>
                    <th style={{ padding: '10px 10px', textAlign: 'left', borderRight: '1px solid #03447d', minWidth: '140px' }}>Medicines Given</th>
                    <th style={{ padding: '10px 8px', textAlign: 'right', borderRight: '1px solid #03447d', minWidth: '85px' }}>Gross MRP</th>
                    <th style={{ padding: '10px 8px', textAlign: 'right', borderRight: '1px solid #03447d', minWidth: '75px' }}>Discount</th>
                    <th style={{ padding: '10px 8px', textAlign: 'right', borderRight: '1px solid #03447d', minWidth: '105px', background: '#047857' }}>★ Anni Ponu (Net)</th>
                    <th style={{ padding: '10px 8px', textAlign: 'center', minWidth: '70px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan={10} style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                        No medicine orders found for the selected period.
                      </td>
                    </tr>
                  ) : (
                    transactions.map((t, idx) => (
                      <tr
                        key={idx}
                        style={{
                          background: idx % 2 === 0 ? '#ffffff' : '#f8fafc',
                          borderBottom: '1px solid #e2e8f0'
                        }}
                      >
                        <td style={{ padding: '9px 8px', borderRight: '1px solid #e2e8f0', color: '#64748b', fontWeight: 600 }}>
                          {t.sNo}
                        </td>
                        <td style={{ padding: '9px 8px', borderRight: '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>
                          {t.date}
                        </td>
                        <td style={{ padding: '9px 10px', borderRight: '1px solid #e2e8f0' }}>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{t.patientName}</div>
                          {t.uhid && (
                            <div style={{ fontSize: '10px', color: '#0284c7', fontWeight: 600, marginTop: '1px' }}>
                              🆔 {t.uhid}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '9px 8px', borderRight: '1px solid #e2e8f0', whiteSpace: 'nowrap', color: '#475569' }}>
                          {t.phone}
                        </td>
                        <td style={{ padding: '9px 8px', borderRight: '1px solid #e2e8f0' }}>
                          {t.consignmentNo ? (
                            <span style={{ fontWeight: 700, color: '#0369a1', background: '#e0f2fe', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', display: 'inline-block' }}>
                              📦 {t.consignmentNo}
                            </span>
                          ) : (
                            <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '11px' }}>Not assigned</span>
                          )}
                        </td>
                        <td style={{ padding: '9px 10px', borderRight: '1px solid #e2e8f0', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={t.medicinesList}>
                          <span style={{ color: '#334155' }}>{t.medicinesList || '-'}</span>
                        </td>
                        <td style={{ padding: '9px 8px', textAlign: 'right', borderRight: '1px solid #e2e8f0', color: '#475569' }}>
                          {formatCurrency(t.grossMrp)}
                        </td>
                        <td style={{ padding: '9px 8px', textAlign: 'right', borderRight: '1px solid #e2e8f0', color: '#dc2626' }}>
                          -{formatCurrency(t.discount)}
                        </td>
                        <td style={{ padding: '9px 8px', textAlign: 'right', borderRight: '1px solid #e2e8f0', fontWeight: 800, color: '#047857', background: idx % 2 === 0 ? '#f0fdf4' : '#e6f9ed' }}>
                          {formatCurrency(t.netRevenue)}
                        </td>
                        <td style={{ padding: '9px 8px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                          <span style={{ 
                            fontSize: '10px', 
                            padding: '2px 6px', 
                            borderRadius: '4px', 
                            fontWeight: 700,
                            background: t.status === 'ACTIVE' ? '#dcfce7' : '#f1f5f9',
                            color: t.status === 'ACTIVE' ? '#166534' : '#475569'
                          }}>
                            {t.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot>
                  <tr style={{ background: '#f1f5f9', fontWeight: 800, borderTop: '2px solid #02559d' }}>
                    <td colSpan={6} style={{ padding: '12px 10px', textAlign: 'right', borderRight: '1px solid #cbd5e1', color: '#0f172a', fontSize: '12px' }}>
                      TOTAL OVERALL (ANNI PONU REVENUE):
                    </td>
                    <td style={{ padding: '12px 8px', textAlign: 'right', borderRight: '1px solid #cbd5e1', color: '#0f172a', fontSize: '12px' }}>
                      {formatCurrency(summary.totalGrossMrp)}
                    </td>
                    <td style={{ padding: '12px 8px', textAlign: 'right', borderRight: '1px solid #cbd5e1', color: '#dc2626', fontSize: '12px' }}>
                      -{formatCurrency(summary.totalDiscount)}
                    </td>
                    <td style={{ padding: '12px 8px', textAlign: 'right', borderRight: '1px solid #cbd5e1', color: '#047857', background: '#dcfce7', fontSize: '13px', fontWeight: 800 }}>
                      {formatCurrency(summary.totalNetRevenue)}
                    </td>
                    <td style={{ padding: '12px 8px', textAlign: 'center', color: '#64748b', fontSize: '11px' }}>
                      {summary.ordersCount} Orders
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Statement Footer Note */}
          <div style={{ marginTop: '28px', paddingTop: '16px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#64748b' }}>
            <div>
              <span>• This is a computer-generated official revenue statement issued by Benva Healthcare.</span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span>Verified by Benva Accounts & Pharmacy Billing System</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
