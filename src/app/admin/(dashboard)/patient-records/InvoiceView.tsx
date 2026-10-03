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
        <div id="printable-invoice" style={{ padding: '40px', overflowY: 'auto', background: 'white', color: '#1e293b', fontFamily: '"Inter", "Segoe UI", sans-serif', fontSize: '11px', lineHeight: '1.5' }}>
          
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
              @page { size: auto; margin: 0mm; }
            }
            .inv-section-title {
              color: #19589a;
              font-weight: 700;
              font-size: 13px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              display: flex;
              align-items: center;
              gap: 8px;
              border-left: 4px solid #19589a;
              padding-left: 8px;
              margin: 24px 0 12px 0;
            }
            .inv-grid-label {
              color: #64748b;
              font-weight: 600;
              width: 130px;
            }
            .inv-grid-val {
              font-weight: 700;
              color: #0f172a;
            }
            .inv-table th {
              background-color: #19589a;
              color: white;
              padding: 10px;
              font-size: 10px;
              text-transform: uppercase;
              text-align: left;
            }
            .inv-table td {
              padding: 12px 10px;
              border-bottom: 1px solid #e2e8f0;
              vertical-align: top;
            }
          `}</style>

          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <div>
              <img src="/images/Benva%20NEW.png" alt="Benva Healthcare" style={{ height: '45px', objectFit: 'contain' }} />
              <div style={{ fontSize: '9px', fontWeight: 'bold', color: '#64748b', letterSpacing: '1px', marginTop: '4px' }}>HEALTHCARE AT YOUR DOORSTEP</div>
            </div>
            <div style={{ textAlign: 'right', fontSize: '10px', color: '#475569' }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#19589a', marginBottom: '4px' }}>BENVA HEALTHCARE PRIVATE LIMITED</div>
              <div>3-126, Indrapalem, Kakinada,</div>
              <div>Kakinada District, Andhra Pradesh - 533006</div>
              <div><span style={{ fontWeight: 'bold' }}>Phone:</span> +91 91111 45556 | <span style={{ fontWeight: 'bold' }}>Email:</span> benvahealthcaresupport@gmail.com</div>
              <div><span style={{ fontWeight: 'bold' }}>Web:</span> www.benvahealthcare.in</div>
              <div><span style={{ fontWeight: 'bold' }}>GSTIN:</span> 12XXXXX3456X1ZX | <span style={{ fontWeight: 'bold' }}>CIN:</span> U85100AP2024PTC123456</div>
            </div>
          </div>

          <div style={{ borderTop: '2px solid #19589a', margin: '20px 0' }}></div>

          {/* Title */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h1 style={{ margin: '0 0 4px 0', fontSize: '20px', fontWeight: 'bold', color: '#19589a', letterSpacing: '4px' }}>I N V O I C E</h1>
            <div style={{ fontSize: '10px', fontWeight: 600, color: '#64748b', letterSpacing: '1px' }}>HEALTHCARE FACILITATION & WELLNESS PACKAGE INVOICE</div>
          </div>

          {/* Patient Info */}
          <div className="inv-section-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            PATIENT & BOOKING INFORMATION
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex' }}><span className="inv-grid-label">MRN No.</span><span className="inv-grid-val">{invoice.mrnNo || 'MRN/2026/' + Math.floor(1000 + Math.random() * 9000)}</span></div>
              <div style={{ display: 'flex' }}><span className="inv-grid-label">Invoice No.</span><span className="inv-grid-val">{invoice.invoiceNo}</span></div>
              <div style={{ display: 'flex' }}><span className="inv-grid-label">Invoice Date</span><span className="inv-grid-val">{new Date(invoice.billDate || invoice.createdAt).toLocaleString('en-IN', {day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'})}</span></div>
              <div style={{ display: 'flex' }}><span className="inv-grid-label">Patient Name</span><span className="inv-grid-val">{patient.name}</span></div>
              <div style={{ display: 'flex' }}><span className="inv-grid-label">Mobile Number</span><span className="inv-grid-val">+91 {patient.phone.replace('+91', '').trim()}</span></div>
              <div style={{ display: 'flex' }}><span className="inv-grid-label">Address</span><span className="inv-grid-val" style={{ maxWidth: '200px' }}>{patient.address || 'N/A'}</span></div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex' }}><span className="inv-grid-label">Age / Gender</span><span className="inv-grid-val">{patient.age ? `${patient.age} Years` : '-'} / {patient.gender || '-'}</span></div>
              <div style={{ display: 'flex' }}><span className="inv-grid-label">Payment Mode</span><span className="inv-grid-val">{invoice.payMode || 'UPI'}</span></div>
              <div style={{ display: 'flex' }}><span className="inv-grid-label">Consultant</span><span className="inv-grid-val">{patient.consultant || 'Self'}</span></div>
              <div style={{ display: 'flex' }}><span className="inv-grid-label">Booking Source</span><span className="inv-grid-val">Benva Mobile App</span></div>
              <div style={{ display: 'flex' }}><span className="inv-grid-label">Package ID</span><span className="inv-grid-val">BPK-FBHC-2026</span></div>
            </div>
          </div>

          {/* Package Details */}
          <div className="inv-section-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            HEALTHCARE FACILITATION PACKAGE DETAILS
          </div>

          <table className="inv-table" style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e2e8f0' }}>
            <thead>
              <tr>
                <th style={{ width: '5%' }}>S.NO</th>
                <th style={{ width: '45%' }}>PACKAGE DESCRIPTION</th>
                <th style={{ width: '10%', textAlign: 'center' }}>QTY</th>
                <th style={{ width: '12%', textAlign: 'right' }}>MRP</th>
                <th style={{ width: '13%', textAlign: 'right' }}>DISCOUNT</th>
                <th style={{ width: '15%', textAlign: 'right' }}>FINAL AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items && invoice.items.length > 0 ? invoice.items.map((item: any, idx: number) => (
                <tr key={item.id || idx}>
                  <td>{idx + 1}</td>
                  <td>
                    <div style={{ fontWeight: 700, color: '#19589a', marginBottom: '6px' }}>{item.itemName.toUpperCase()}</div>
                    <div style={{ color: '#059669', fontSize: '9px', fontWeight: 600, display: 'inline-block', background: '#dcfce7', padding: '2px 6px', borderRadius: '4px', marginBottom: '8px' }}>Healthcare Package Discount</div>
                    <ul style={{ margin: 0, paddingLeft: '14px', color: '#475569', fontSize: '10px' }}>
                      <li>Diagnostic Testing Through Partner Laboratory</li>
                      <li>Doctor Consultation</li>
                      <li>Dietitian Consultation</li>
                      <li>Home Sample Collection Facilitation</li>
                      <li>Digital Report Access</li>
                      <li>Customer Support Services</li>
                    </ul>
                  </td>
                  <td style={{ textAlign: 'center', fontWeight: 700 }}>1</td>
                  <td style={{ textAlign: 'right', color: '#94a3b8', textDecoration: 'line-through' }}>₹{(item.price || 0).toFixed(2)}</td>
                  <td style={{ textAlign: 'right', fontWeight: 700 }}>₹{(item.discount || 0).toFixed(2)}</td>
                  <td style={{ textAlign: 'right', fontWeight: 700 }}>₹{(item.total || item.amount || 0).toFixed(2)}</td>
                </tr>
              )) : (
                <tr>
                  <td>1</td>
                  <td>
                    <div style={{ fontWeight: 700, color: '#19589a', marginBottom: '6px' }}>BENVA PREMIUM FULL BODY HEALTH CHECKUP PACKAGE</div>
                    <div style={{ color: '#059669', fontSize: '9px', fontWeight: 600, display: 'inline-block', background: '#dcfce7', padding: '2px 6px', borderRadius: '4px', marginBottom: '8px' }}>Healthcare Package Discount</div>
                    <ul style={{ margin: 0, paddingLeft: '14px', color: '#475569', fontSize: '10px' }}>
                      <li>Diagnostic Testing Through Partner Laboratory</li>
                      <li>Doctor Consultation</li>
                      <li>Dietitian Consultation</li>
                      <li>Home Sample Collection Facilitation</li>
                      <li>Digital Report Access</li>
                      <li>Customer Support Services</li>
                    </ul>
                  </td>
                  <td style={{ textAlign: 'center', fontWeight: 700 }}>1</td>
                  <td style={{ textAlign: 'right', color: '#94a3b8', textDecoration: 'line-through' }}>₹7,200.00</td>
                  <td style={{ textAlign: 'right', fontWeight: 700 }}>₹5,191.00</td>
                  <td style={{ textAlign: 'right', fontWeight: 700 }}>₹2,009.00</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Totals Section */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
            <div style={{ width: '350px', border: '1px solid #e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 16px', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontWeight: 600, color: '#64748b' }}>Total Amount (MRP)</span>
                <span style={{ fontWeight: 700 }}>₹{(invoice.totalAmount + invoice.discount).toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 16px', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontWeight: 600, color: '#64748b' }}>Discount</span>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>- ₹{(invoice.discount || 0).toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 16px', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontWeight: 600, color: '#64748b' }}>Service Charge</span>
                <span style={{ fontWeight: 700 }}>₹10.00</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 16px', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontWeight: 600, color: '#64748b' }}>CGST</span>
                <span style={{ fontWeight: 700 }}>₹0.90</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 16px', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontWeight: 600, color: '#64748b' }}>SGST</span>
                <span style={{ fontWeight: 700 }}>₹0.90</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 16px', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontWeight: 700, color: '#1e293b' }}>Net Payable</span>
                <span style={{ fontWeight: 700 }}>₹{((invoice.totalAmount || 0) + 11.80).toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 16px', background: '#19589a', color: 'white' }}>
                <span style={{ fontWeight: 700, fontSize: '13px', textTransform: 'uppercase' }}>PAID AMOUNT</span>
                <span style={{ fontWeight: 700, fontSize: '13px' }}>₹{((invoice.paidAmount || invoice.totalAmount || 0) + 11.80).toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 16px' }}>
                <span style={{ fontWeight: 700, color: '#dc2626' }}>Due Amount</span>
                <span style={{ fontWeight: 700, color: '#dc2626' }}>₹{(invoice.dueAmount || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Partner Lab */}
          <div className="inv-section-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18"></path><path d="M12 21V9"></path><path d="M16 11l-4-4-4 4"></path><path d="M21 9v12"></path><path d="M3 9v12"></path></svg>
            TESTING PERFORMED BY PARTNER LABORATORY
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', padding: '8px 16px' }}>
            <div>
              <div style={{ color: '#64748b', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>LABORATORY NAME</div>
              <div style={{ fontWeight: 700, color: '#0f172a' }}>Apex Diagnostics & Labs</div>
            </div>
            <div>
              <div style={{ color: '#64748b', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>LOCATION</div>
              <div style={{ fontWeight: 700, color: '#0f172a' }}>Hyderabad, Telangana</div>
            </div>
            <div>
              <div style={{ color: '#64748b', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>NABL NUMBER</div>
              <div style={{ fontWeight: 700, color: '#0f172a' }}>NABL/MC-XXXX</div>
            </div>
          </div>

          {/* Disclaimer */}
          <div style={{ background: '#f1f5f9', borderRadius: '6px', padding: '16px', marginTop: '24px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontWeight: 700, color: '#64748b', marginBottom: '8px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>IMPORTANT DISCLAIMER</div>
            <p style={{ margin: '0 0 8px 0', color: '#64748b', fontSize: '9px', lineHeight: '1.5' }}>
              Benva Healthcare acts solely as a technology-enabled healthcare facilitation platform. Laboratory investigations are performed by independent partner laboratories. Benva Healthcare does not perform, analyze, validate, certify, or interpret laboratory investigations.
            </p>
            <p style={{ margin: '0 0 8px 0', color: '#64748b', fontSize: '9px', lineHeight: '1.5' }}>
              Laboratory reports are generated and authorized by the respective partner laboratory. Clinical decisions should be taken only under the guidance of a qualified Registered Medical Practitioner.
            </p>
            <p style={{ margin: 0, color: '#64748b', fontSize: '9px', lineHeight: '1.5' }}>
              This invoice represents a healthcare facilitation and wellness package purchased through Benva Healthcare. Diagnostic testing services included in the package are performed by independent partner laboratories.
            </p>
          </div>

          {/* Footer */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', marginTop: '32px', paddingTop: '16px', borderTop: '4px solid #19589a' }}>
            <div>
              <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>Customer Support</div>
              <div style={{ color: '#64748b', fontSize: '10px' }}>+91 91111 45556</div>
              <div style={{ color: '#64748b', fontSize: '10px' }}>benvahealthcaresupport@gmail.com</div>
              <div style={{ color: '#64748b', fontSize: '10px' }}>www.benvahealthcare.in</div>
            </div>
            <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '9px', fontStyle: 'italic', paddingTop: '8px' }}>
              This is a computer-generated invoice<br/>and does not require a signature.
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '10px', marginBottom: '4px' }}><span style={{ fontWeight: 700, color: '#0f172a' }}>Generated By:</span> <span style={{ color: '#64748b' }}>Admin User</span></div>
              <div style={{ fontSize: '10px' }}><span style={{ fontWeight: 700, color: '#0f172a' }}>Date & Time:</span> <span style={{ color: '#64748b' }}>{new Date().toLocaleString('en-IN', {day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'})}</span></div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}