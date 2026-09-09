'use client';

import React, { useState } from 'react';

export default function InvoiceGeneratorModal({ patient, onClose, onGenerated }: { patient: any, onClose: () => void, onGenerated: (invoice: any) => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [items, setItems] = useState([{ itemName: '', price: 0, qty: 1 }]);
  const [payMode, setPayMode] = useState('UPI');
  const [discount, setDiscount] = useState(0);

  const addItem = () => setItems([...items, { itemName: '', price: 0, qty: 1 }]);
  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.price * item.qty), 0) - discount;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        patientId: patient.id,
        payMode,
        discount,
        totalAmount: calculateTotal(),
        paidAmount: calculateTotal(),
        items: items.map(item => ({
          ...item,
          amount: item.price * item.qty,
          total: item.price * item.qty
        }))
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
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: 'white', padding: '32px', borderRadius: '12px', width: '100%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '24px', color: '#1e293b' }}>Generate Invoice</h2>
            <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>For: {patient.name} ({patient.phone})</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#64748b' }}>&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', color: '#334155' }}>Invoice Items</h3>
              <button type="button" onClick={addItem} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#f8fafc', fontSize: '13px', cursor: 'pointer' }}>+ Add Item</button>
            </div>
            
            {items.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', marginBottom: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#64748b' }}>Service / Item Name *</label>
                  <input type="text" value={item.itemName} onChange={e => handleItemChange(idx, 'itemName', e.target.value)} required placeholder="e.g. Bill Service Charge" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                </div>
                <div style={{ width: '100px' }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#64748b' }}>Qty</label>
                  <input type="number" min="1" value={item.qty} onChange={e => handleItemChange(idx, 'qty', Number(e.target.value))} required style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                </div>
                <div style={{ width: '120px' }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#64748b' }}>Price (₹) *</label>
                  <input type="number" min="0" value={item.price} onChange={e => handleItemChange(idx, 'price', Number(e.target.value))} required style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                </div>
                {items.length > 1 && (
                  <button type="button" onClick={() => removeItem(idx)} style={{ padding: '8px', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>X</button>
                )}
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: '#f8fafc', padding: '16px', borderRadius: '8px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#475569' }}>Pay Mode</label>
              <select value={payMode} onChange={e => setPayMode(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                <option value="UPI">UPI</option>
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#475569' }}>Discount (₹)</label>
              <input type="number" min="0" value={discount} onChange={e => setDiscount(Number(e.target.value))} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
            </div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
            <div style={{ fontSize: '18px', fontWeight: 600, color: '#1e293b' }}>
              Total: ₹{calculateTotal().toFixed(2)}
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="button" onClick={onClose} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', color: '#475569', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button type="submit" disabled={isSubmitting} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#10b981', color: 'white', fontWeight: 600, cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1 }}>
                {isSubmitting ? 'Generating...' : 'Generate Invoice'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
