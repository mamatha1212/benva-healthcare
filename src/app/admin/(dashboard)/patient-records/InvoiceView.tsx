'use client';

import React from 'react';

export default function InvoiceView({ invoice, patient, onClose }: { invoice: any, patient: any, onClose: () => void }) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
      <div style={{ background: 'white', borderRadius: '12px', width: '100%', maxWidth: '850px', maxHeight: '95vh', display: 'flex', flexDirection: 'column' }}>
        
        {/* Header Actions - hidden when printing */}
        <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid #e2e8f0' }}>
          <h2 style={{ margin: 0, fontSize: '18px', color: '#1e293b' }}>View Invoice: {invoice.invoiceNo}</h2>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={handlePrint} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'white', color: '#334155', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
              Print / PDF
            </button>
            <button onClick={onClose} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#f1f5f9', color: '#475569', fontWeight: 600, cursor: 'pointer' }}>Close</button>
          </div>
        </div>

        {/* Invoice Content - styled for printing */}
        <div id="printable-invoice" style={{ padding: '32px 40px', overflowY: 'auto', background: 'white', color: '#000' }}>
          
          <style>{`
            @media print {
              body * { visibility: hidden; }
              #printable-invoice, #printable-invoice * { visibility: visible; }
              #printable-invoice { position: absolute; left: 0; top: 0; width: 100%; padding: 0 !important; }
              .no-print { display: none !important; }
            }
          `}</style>

          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
            <div>
              <img src="/images/Benva%20NEW.png" alt="Benva Healthcare" style={{ height: '100px' }} />
            </div>
            <div style={{ textAlign: 'right' }}>
              <h1 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 700 }}>BENVA HEALTH CARE LIMITED</h1>
              <p style={{ margin: 0, fontSize: '12px', color: '#475569' }}>123, Healthcare Avenue, City Center</p>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#475569' }}>Phone: 9876543210  GSTIN: 12XXXXX3456X1ZX</p>
            </div>
          </div>

          <div style={{ textAlign: 'center', borderTop: '2px solid #000', borderBottom: '2px solid #000', padding: '8px 0', marginBottom: '24px', fontWeight: 700, letterSpacing: '2px' }}>
            INVOICE
          </div>

          {/* Patient Details Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px', fontSize: '13px' }}>
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontWeight: 600 }}>MRN No.</span>
                <span>: {invoice.mrnNo}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontWeight: 600 }}>Invoice No.</span>
                <span>: {invoice.invoiceNo}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontWeight: 600 }}>Bill Date</span>
                <span>: {new Date(invoice.billDate).toLocaleString()}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontWeight: 600 }}>Patient Name</span>
                <span>: {patient.name}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontWeight: 600 }}>Address</span>
                <span>: {patient.address || 'N/A'}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontWeight: 600 }}>Phone</span>
                <span>: {patient.phone}</span>
              </div>
            </div>
            
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontWeight: 600 }}>Age / Gender</span>
                <span>: {patient.age || '-'} Years / {patient.gender || '-'}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontWeight: 600 }}>Pay Mode</span>
                <span>: {invoice.payMode}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontWeight: 600 }}>Consultant</span>
                <span>: {patient.consultant || 'Self'}</span>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', marginBottom: '24px' }}>
            <thead>
              <tr style={{ borderTop: '1px solid #000', borderBottom: '1px solid #000' }}>
                <th style={{ padding: '8px 4px', textAlign: 'left' }}>#</th>
                <th style={{ padding: '8px 4px', textAlign: 'left' }}>Item Name</th>
                <th style={{ padding: '8px 4px', textAlign: 'right' }}>Qty</th>
                <th style={{ padding: '8px 4px', textAlign: 'right' }}>Price</th>
                <th style={{ padding: '8px 4px', textAlign: 'right' }}>Amount</th>
                <th style={{ padding: '8px 4px', textAlign: 'right' }}>CGST</th>
                <th style={{ padding: '8px 4px', textAlign: 'right' }}>SGST</th>
                <th style={{ padding: '8px 4px', textAlign: 'right' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items && invoice.items.map((item: any, idx: number) => (
                <tr key={item.id || idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '8px 4px' }}>{idx + 1}</td>
                  <td style={{ padding: '8px 4px', maxWidth: '250px' }}>{item.itemName}</td>
                  <td style={{ padding: '8px 4px', textAlign: 'right' }}>{item.qty}</td>
                  <td style={{ padding: '8px 4px', textAlign: 'right' }}>{item.price.toFixed(2)}</td>
                  <td style={{ padding: '8px 4px', textAlign: 'right' }}>{item.amount.toFixed(2)}</td>
                  <td style={{ padding: '8px 4px', textAlign: 'right' }}>{item.cgst.toFixed(2)}</td>
                  <td style={{ padding: '8px 4px', textAlign: 'right' }}>{item.sgst.toFixed(2)}</td>
                  <td style={{ padding: '8px 4px', textAlign: 'right' }}>{item.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: '13px' }}>
            <div style={{ width: '250px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                <span style={{ fontWeight: 600 }}>Total Amount</span>
                <span>{invoice.totalAmount.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                <span style={{ fontWeight: 600 }}>Discount</span>
                <span>{invoice.discount.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                <span style={{ fontWeight: 600 }}>Total CGST</span>
                <span>{invoice.cgst.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                <span style={{ fontWeight: 600 }}>Total SGST</span>
                <span>{invoice.sgst.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderTop: '1px solid #000', borderBottom: '1px solid #000', marginTop: '8px', marginBottom: '8px' }}>
                <span style={{ fontWeight: 700 }}>Paid Amount</span>
                <span style={{ fontWeight: 700 }}>{invoice.paidAmount.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                <span style={{ fontWeight: 600 }}>Due Amount</span>
                <span>{invoice.dueAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '40px', fontSize: '11px', color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
            <div>* This is a computer-generated invoice and does not require a signature.</div>
            <div style={{ textAlign: 'right' }}>
              <div>Billed by</div>
              <div style={{ fontWeight: 600, marginTop: '4px' }}>Admin User</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
