'use client';

import React, { useState, useEffect } from 'react';

export default function InvoiceGeneratorModal({ patient, onClose, onGenerated }: { patient: any, onClose: () => void, onGenerated: (invoice: any) => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [items, setItems] = useState([{ itemName: '', price: '' as string | number, discount: '' as string | number }]);
  const [payMode, setPayMode] = useState('UPI');
  const [mounted, setMounted] = useState(false);
  const [address, setAddress] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [consultant, setConsultant] = useState('');
  const [doctors, setDoctors] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
    fetch('/api/admin/doctors')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setDoctors(data);
      })
      .catch(err => console.error('Error fetching doctors:', err));
  }, []);

  const addItem = () => setItems([...items, { itemName: '', price: '', discount: '' }]);
  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const calculateTotalDiscount = () => {
    return items.reduce((sum, item) => sum + (Number(item.discount) || 0), 0);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (Number(item.price) || 0), 0) - calculateTotalDiscount();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        patientId: patient.id,
        patientName: patient.name,
        patientPhone: patient.phone,
        address,
        age,
        gender,
        consultant,
        payMode,
        discount: calculateTotalDiscount(),
        totalAmount: calculateTotal(),
        paidAmount: calculateTotal(),
        items: items.map(item => {
          const p = Number(item.price) || 0;
          const d = Number(item.discount) || 0;
          return {
            ...item,
            qty: 1,
            price: p,
            discount: d,
            amount: p - d,
            total: p - d
          }
        })
      };

      const res = await fetch('/api/admin/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) throw new Error('Failed to generate invoice');
      
      const newInvoice = await res.json();
      onGenerated(newInvoice);
    } catch (error) {
      console.error(error);
      alert('Error generating invoice');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <style>{`
        .modal-overlay {
          position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(8px);
          display: flex; align-items: center; justify-content: center; z-index: 1000;
          opacity: 0; animation: fadeIn 0.3s forwards cubic-bezier(0.16, 1, 0.3, 1);
        }
        .modal-content {
          background: #ffffff; padding: 32px; border-radius: 20px; width: 100%; max-width: 700px;
          max-height: 90vh; overflow-y: auto; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          transform: scale(0.95) translateY(20px); opacity: 0;
          animation: slideUp 0.4s forwards cubic-bezier(0.16, 1, 0.3, 1);
          animation-delay: 0.1s;
        }
        .btn-add {
          padding: 8px 16px; border-radius: 8px; border: 1px dashed #cbd5e1; background: #f8fafc;
          font-size: 13px; font-weight: 600; color: #475569; cursor: pointer; transition: all 0.2s;
        }
        .btn-add:hover { background: #f1f5f9; border-color: #94a3b8; color: #334155; }
        
        .input-field {
          width: 100%; padding: 10px 14px; border-radius: 10px; border: 1px solid #e2e8f0;
          background: #f8fafc; font-size: 14px; color: #1e293b; transition: all 0.2s;
          box-sizing: border-box;
        }
        .input-field:focus {
          outline: none; border-color: #3b82f6; background: #ffffff; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
        }
        
        .btn-remove {
          padding: 10px; border-radius: 10px; background: #fee2e2; color: #ef4444; border: none;
          cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center;
        }
        .btn-remove:hover { background: #fecaca; transform: scale(1.05); }

        .btn-cancel {
          padding: 12px 24px; border-radius: 12px; border: 1px solid #e2e8f0; background: #ffffff;
          color: #475569; font-weight: 600; cursor: pointer; transition: all 0.2s;
        }
        .btn-cancel:hover { background: #f8fafc; color: #1e293b; border-color: #cbd5e1; }

        .btn-submit {
          padding: 12px 28px; border-radius: 12px; border: none; 
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white; font-weight: 600; cursor: pointer; transition: all 0.3s;
          box-shadow: 0 4px 14px 0 rgba(37, 99, 235, 0.39);
        }
        .btn-submit:hover:not(:disabled) {
          transform: translateY(-2px); box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4);
        }
        .btn-submit:disabled { opacity: 0.7; cursor: not-allowed; }
        
        .totals-box {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px;
        }

        @keyframes fadeIn { to { opacity: 1; } }
        @keyframes slideUp { to { opacity: 1; transform: scale(1) translateY(0); } }
        
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>

      {mounted && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '28px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>Generate Invoice</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                  <span style={{ background: '#e0e7ff', color: '#4338ca', padding: '4px 10px', borderRadius: '20px', fontSize: '13px', fontWeight: 600 }}>
                    Patient
                  </span>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '15px', fontWeight: 500 }}>{patient.name} <span style={{ color: '#94a3b8' }}>•</span> {patient.phone}</p>
                </div>
              </div>
              <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.background = '#e2e8f0'} onMouseOut={e => e.currentTarget.style.background = '#f1f5f9'}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13 1L1 13M1 1L13 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              
              {/* Patient Additional Details */}
              <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: 700, color: '#334155' }}>Patient Details</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#64748b' }}>Age</label>
                    <input type="text" value={age} onChange={e => setAge(e.target.value)} placeholder="e.g. 28" className="input-field" style={{ background: '#ffffff' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#64748b' }}>Gender</label>
                    <select value={gender} onChange={e => setGender(e.target.value)} className="input-field" style={{ background: '#ffffff' }}>
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#64748b' }}>Address</label>
                    <input type="text" value={address} onChange={e => setAddress(e.target.value)} placeholder="Patient Address" className="input-field" style={{ background: '#ffffff' }} />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#64748b' }}>Consulting Doctor (Optional)</label>
                    <select value={consultant} onChange={e => setConsultant(e.target.value)} className="input-field" style={{ background: '#ffffff', cursor: 'pointer' }}>
                      <option value="">Self (No Consultant)</option>
                      {doctors.map(doc => (
                        <option key={doc.id} value={doc.name}>{doc.name} {doc.type ? `(${doc.type})` : ''}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#334155' }}>Invoice Items</h3>
                  <button type="button" onClick={addItem} className="btn-add">+ Add New Item</button>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {items.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', background: '#ffffff', padding: '16px', borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#64748b' }}>Service / Item Name</label>
                        <input type="text" value={item.itemName} onChange={e => handleItemChange(idx, 'itemName', e.target.value)} required placeholder="e.g. Consultation Fee" className="input-field" />
                      </div>
                      <div style={{ width: '130px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#64748b' }}>Price (₹)</label>
                        <input type="number" min="0" value={item.price} onChange={e => handleItemChange(idx, 'price', e.target.value)} required className="input-field" />
                      </div>
                      <div style={{ width: '100px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#64748b' }}>Disc. (₹)</label>
                        <input type="number" min="0" value={item.discount} onChange={e => handleItemChange(idx, 'discount', e.target.value)} className="input-field" />
                      </div>
                      {items.length > 1 && (
                        <button type="button" onClick={() => removeItem(idx)} className="btn-remove" title="Remove Item">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="totals-box">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 700, color: '#475569' }}>Payment Mode</label>
                    <div style={{ position: 'relative' }}>
                      <select value={payMode} onChange={e => setPayMode(e.target.value)} className="input-field" style={{ appearance: 'none', cursor: 'pointer', background: '#ffffff' }}>
                        <option value="UPI">UPI Payment</option>
                        <option value="Cash">Cash</option>
                        <option value="Card">Credit/Debit Card</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                      </select>
                      <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#94a3b8' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ color: '#64748b', fontSize: '15px', fontWeight: 500 }}>Total Amount Due</div>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
                    <span style={{ color: '#94a3b8', marginRight: '4px', fontSize: '20px' }}>₹</span>
                    {calculateTotal().toFixed(2)}
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                <button type="button" onClick={onClose} className="btn-cancel">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="btn-submit">
                  {isSubmitting ? 'Generating...' : 'Generate Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
