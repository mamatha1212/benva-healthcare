'use client';
import React, { useState, useEffect } from 'react';
import PayoutReport from '@/components/PayoutReport/PayoutReport';

export default function DoctorPayoutsClient({ doctorName }: { doctorName: string }) {
  const [payouts, setPayouts] = useState<any[]>([]);
  const [viewingPayout, setViewingPayout] = useState<any | null>(null);

  useEffect(() => {
    const fetchPayouts = async () => {
      try {
        const res = await fetch('/api/payouts');
        if (res.ok) {
          const parsed = await res.json();
          
          const normalizeName = (name: string) => name.toLowerCase().replace(/^dr\.?\s*/, '').trim();
          const normalizedDocName = normalizeName(doctorName);
          
          const filtered = parsed.filter((p: any) => {
            if (!p.consultingDoctor) return false;
            const pName = normalizeName(p.consultingDoctor);
            return pName === normalizedDocName || pName.includes(normalizedDocName) || normalizedDocName.includes(pName);
          });
          setPayouts(filtered);
        }
      } catch (e) {
        console.error('Failed to fetch payouts', e);
      }
    };
    fetchPayouts();
  }, [doctorName]);

  const downloadPDF = async (payoutData: any, element: HTMLElement | null) => {
    if (typeof window !== 'undefined' && element) {
      const html2pdf = (await import('html2pdf.js')).default;
      const opt = {
        margin: 10,
        filename: `Payout_${payoutData.reportingPeriod.replace(/\s+/g, '_')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      
      const clone = element.cloneNode(true) as HTMLElement;
      clone.style.display = 'block';
      clone.style.width = '800px';
      clone.style.maxWidth = 'none';
      clone.style.padding = '20px';
      clone.style.margin = '0 auto';
      
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '0';
      tempContainer.appendChild(clone);
      document.body.appendChild(tempContainer);
      
      await html2pdf().set(opt).from(clone).save();
      
      document.body.removeChild(tempContainer);
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a', marginBottom: '8px' }}>My Payouts</h1>
      <p style={{ color: '#64748b', marginBottom: '32px' }}>View and download your monthly consultation payouts.</p>

      {payouts.length === 0 ? (
        <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
          <div style={{ background: '#f1f5f9', width: '56px', height: '56px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#0f172a', margin: '0 0 8px 0' }}>No Payouts Yet</h3>
          <p style={{ color: '#64748b', margin: 0 }}>Your payout reports will appear here once they are processed by the admin.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {payouts.map(payout => (
            <div key={payout.id} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#0f172a' }}>{payout.reportingPeriod}</div>
                  <div style={{ fontSize: '13px', color: '#64748b' }}>Date: {payout.payoutDate}</div>
                </div>
                <div style={{ background: '#ecfdf5', color: '#059669', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 600 }}>
                  Paid
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Consultations</div>
                  <div style={{ fontSize: '16px', fontWeight: 600, color: '#0f172a' }}>{payout.totalConsultationsCompleted || payout.totalPatientsConsulted}</div>
                </div>
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Amount</div>
                  <div style={{ fontSize: '16px', fontWeight: 600, color: '#0f172a' }}>₹{payout.totalPayoutAmount}</div>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  onClick={() => setViewingPayout(payout)}
                  style={{ flex: 1, padding: '10px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#334155', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {viewingPayout && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '12px', width: '100%', maxWidth: '800px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '20px', color: '#0f172a' }}>Payout Report - {viewingPayout.reportingPeriod}</h2>
              <button onClick={() => setViewingPayout(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px', background: '#f8fafc' }}>
              <div id="payout-pdf-container" style={{ background: 'white', padding: '40px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', borderRadius: '8px', maxWidth: '800px', margin: '0 auto' }}>
                <PayoutReport {...viewingPayout} />
              </div>
            </div>
            
            <div style={{ padding: '16px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button 
                onClick={() => setViewingPayout(null)}
                style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
              >
                Close
              </button>
              <button 
                onClick={() => downloadPDF(viewingPayout, document.getElementById('payout-pdf-container'))}
                style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#3b82f6', color: 'white', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
