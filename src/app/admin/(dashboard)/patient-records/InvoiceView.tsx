'use client';

import React from 'react';

export default function InvoiceView({ invoice, patient, onClose }: { invoice: any, patient: any, onClose: () => void }) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="invoice-modal-overlay" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
      <div style={{ background: 'white', borderRadius: '12px', width: '100%', maxWidth: '850px', maxHeight: '95vh', display: 'flex', flexDirection: 'column' }}>
        
        {/* Header Actions - hidden when printing */}
        <div className="no-print" style={{ position: 'relative', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid #e2e8f0', gap: '12px' }}>
          <h2 style={{ margin: 0, fontSize: '18px', color: '#1e293b', paddingRight: '32px', wordBreak: 'break-all' }}>View Invoice: {invoice.invoiceNo}</h2>
          
          <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
          
          <div style={{ display: 'flex', gap: '12px', width: '100%', justifyContent: 'flex-start' }}>
            <button onClick={handlePrint} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'white', color: '#334155', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 auto', justifyContent: 'center', maxWidth: '200px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
              Print / PDF
            </button>
          </div>
        </div>

        {/* Invoice Content - styled for printing */}
        <div id="printable-invoice" style={{ padding: '40px', overflowY: 'auto', background: 'white', color: 'black', fontFamily: 'Arial, sans-serif' }}>
          
          <style>{`
            @media print {
              #invoice-modal-overlay { 
                position: static !important; 
                background: transparent !important; 
                padding: 0 !important; 
                display: block !important;
              }
              #printable-invoice { 
                position: static !important;
                width: 100% !important; 
                padding: 0 !important; 
                max-height: none !important;
                overflow: visible !important;
              }
              .no-print { display: none !important; }
            }
          `}</style>

          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <img src="/images/Benva%20NEW.png" alt="Benva Healthcare" style={{ height: '80px', objectFit: 'contain' }} />
            </div>
            <div style={{ textAlign: 'right' }}>
              <h1 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 'bold' }}>BENVA HEALTH CARE LIMITED</h1>
              <p style={{ margin: 0, fontSize: '12px' }}>123, Healthcare Avenue, City Center</p>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', fontWeight: 'bold' }}>Phone: 9876543210</p>
            </div>
          </div>

          <div style={{ borderTop: '2px solid black', borderBottom: '1px solid black', textAlign: 'center', padding: '4px 0', fontWeight: 'bold', fontSize: '14px', marginBottom: '16px' }}>
            Invoice
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '12px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', marginBottom: '4px' }}>
                <span style={{ fontWeight: 'bold' }}>MRN No.</span>
                <span>: {invoice.mrnNo}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', marginBottom: '4px' }}>
                <span style={{ fontWeight: 'bold' }}>Invoice No.</span>
                <span>: {invoice.invoiceNo}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr' }}>
                <span style={{ fontWeight: 'bold' }}>Bill Date</span>
                <span>: {new Date(invoice.billDate).toLocaleString()}</span>
              </div>
            </div>
            {/* Placeholder for Barcode if needed, else empty */}
          </div>

          <div style={{ borderTop: '1px solid black', padding: '16px 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', fontSize: '12px' }}>
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', marginBottom: '4px' }}>
                <span style={{ fontWeight: 'bold' }}>Patient Name</span>
                <span>: {patient.name}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', marginBottom: '4px' }}>
                <span style={{ fontWeight: 'bold' }}>Address</span>
                <span>: {patient.address || 'N/A'}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', marginBottom: '4px' }}>
                <span style={{ fontWeight: 'bold' }}>Phone</span>
                <span>: {patient.phone}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr' }}>
                <span style={{ fontWeight: 'bold' }}>Pay Type</span>
                <span>: Self</span>
              </div>
            </div>
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', marginBottom: '4px' }}>
                <span style={{ fontWeight: 'bold' }}>Age / Gender</span>
                <span>: {patient.age ? `${patient.age} Years` : '-'} / {patient.gender || '-'}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', marginBottom: '4px' }}>
                <span style={{ fontWeight: 'bold' }}>Pay Mode</span>
                <span>: {invoice.payMode}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr' }}>
                <span style={{ fontWeight: 'bold' }}>Consultant</span>
                <span>: {patient.consultant || 'Self'}</span>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', marginBottom: '16px' }}>
            <thead>
              <tr style={{ borderTop: '2px solid black', borderBottom: '1px solid black' }}>
                <th style={{ padding: '6px 2px', textAlign: 'left', width: '20px' }}>#</th>
                <th style={{ padding: '6px 2px', textAlign: 'left' }}>Item Name</th>
                <th style={{ padding: '6px 2px', textAlign: 'right' }}>Price</th>
                <th style={{ padding: '6px 2px', textAlign: 'right' }}>Disc.</th>
                <th style={{ padding: '6px 2px', textAlign: 'right' }}>Amount</th>
                <th style={{ padding: '6px 2px', textAlign: 'right' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items && invoice.items.map((item: any, idx: number) => (
                <tr key={item.id || idx}>
                  <td style={{ padding: '6px 2px' }}>{idx + 1}</td>
                  <td style={{ padding: '6px 2px' }}>{item.itemName}</td>
                  <td style={{ padding: '6px 2px', textAlign: 'right' }}>{item.price.toFixed(2)}</td>
                  <td style={{ padding: '6px 2px', textAlign: 'right' }}>{item.discount.toFixed(2)}</td>
                  <td style={{ padding: '6px 2px', textAlign: 'right' }}>{item.amount.toFixed(2)}</td>
                  <td style={{ padding: '6px 2px', textAlign: 'right' }}>{item.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div style={{ borderTop: '1px solid black', paddingTop: '12px', display: 'flex', justifyContent: 'flex-end', fontSize: '11px', fontWeight: 'bold' }}>
            <div style={{ width: '300px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', marginBottom: '6px' }}>
                <span>Total Amount</span>
                <span style={{ textAlign: 'right' }}>{invoice.totalAmount.toFixed(2)}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', marginBottom: '6px' }}>
                <span>Discount</span>
                <span style={{ textAlign: 'right' }}>{invoice.discount.toFixed(2)}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', marginBottom: '6px' }}>
                <span>Paid Amount</span>
                <span style={{ textAlign: 'right' }}>{invoice.paidAmount.toFixed(2)}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px' }}>
                <span>Due Amount</span>
                <span style={{ textAlign: 'right' }}>{invoice.dueAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid black', marginTop: '24px', paddingTop: '12px', fontSize: '10px', display: 'flex', justifyContent: 'space-between' }}>
            <div>* This is a computer-generated invoice and does not require a signature.</div>
            <div style={{ textAlign: 'right', fontWeight: 'bold' }}>
              <div>Billed by</div>
              <div style={{ marginTop: '16px' }}>Admin User</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
