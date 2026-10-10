'use client';

import React, { useState } from 'react';

export default function MedicinesClient({ initialOrders }: { initialOrders: any[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<any>(null);
  const [viewingOrder, setViewingOrder] = useState<any>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    patientName: '',
    mobile: '',
    address: '',
    prescriptionUrls: [] as string[],
    medicines: [] as any[],
    lastGivenDate: '',
    nextDueDate: '',
    notes: '',
    status: 'ACTIVE'
  });

  const resetForm = () => {
    setFormData({
      patientName: '', mobile: '', address: '',
      prescriptionUrls: [], medicines: [],
      lastGivenDate: '', nextDueDate: '', notes: '', status: 'ACTIVE'
    });
    setEditingOrder(null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload
      });
      const data = await res.json();
      if (data.fileUrl) {
        setFormData(prev => ({
          ...prev,
          prescriptionUrls: [...prev.prescriptionUrls, data.fileUrl]
        }));
      }
    } catch (err) {
      console.error('Upload failed', err);
      alert('Failed to upload image.');
    }
  };

  const handleAddMedicine = () => {
    setFormData(prev => ({
      ...prev,
      medicines: [...prev.medicines, { id: Date.now().toString(), name: '', type: 'Tablet', quantity: '', instructions: '', isSelected: true }]
    }));
  };

  const handleMedicineChange = (index: number, field: string, value: any) => {
    const newMeds = [...formData.medicines];
    newMeds[index] = { ...newMeds[index], [field]: value };
    setFormData({ ...formData, medicines: newMeds });
  };

  const handleRemoveMedicine = (index: number) => {
    const newMeds = formData.medicines.filter((_, i) => i !== index);
    setFormData({ ...formData, medicines: newMeds });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingOrder ? `/api/admin/medicines/${editingOrder.id}` : '/api/admin/medicines';
      const method = editingOrder ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (!res.ok) throw new Error('Failed to save');
      
      const saved = await res.json();
      if (editingOrder) {
        setOrders(orders.map(o => o.id === saved.id ? saved : o));
      } else {
        setOrders([saved, ...orders]);
      }
      
      setIsAddModalOpen(false);
      resetForm();
    } catch (err) {
      console.error(err);
      alert('Error saving order');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this order?')) return;
    try {
      const res = await fetch(`/api/admin/medicines/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setOrders(orders.filter(o => o.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (order: any) => {
    setEditingOrder(order);
    setFormData({
      patientName: order.patientName || '',
      mobile: order.mobile || '',
      address: order.address || '',
      prescriptionUrls: order.prescriptionUrls || [],
      medicines: order.medicines || [],
      lastGivenDate: order.lastGivenDate ? new Date(order.lastGivenDate).toISOString().split('T')[0] : '',
      nextDueDate: order.nextDueDate ? new Date(order.nextDueDate).toISOString().split('T')[0] : '',
      notes: order.notes || '',
      status: order.status || 'ACTIVE'
    });
    setIsAddModalOpen(true);
  };

  const generatePDF = async (order: any) => {
    try {
      const element = document.getElementById('pdf-template-' + order.id);
      if (!element) {
        alert('Could not find PDF template element');
        return;
      }
      element.style.display = 'block'; // Make it visible temporarily for rendering

      const html2pdf = (await import('html2pdf.js')).default;
      const opt = {
        margin:       10,
        filename:     `Pharmacy_Order_${order.patientName}.pdf`,
        image:        { type: 'jpeg' as const, quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'mm' as const, format: 'a4', orientation: 'portrait' as const }
      };

      html2pdf().set(opt).from(element).output('bloburl').then((url: string) => {
        window.open(url, '_blank');
        element.style.display = 'none'; // Hide it again
      });
    } catch (err) {
      console.error('PDF Generation failed', err);
      alert('Failed to generate PDF');
    }
  };

  const filteredOrders = orders.filter(o => 
    o.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.mobile.includes(searchTerm)
  );

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>Medicine Orders</h1>
          <p style={{ color: '#64748b', margin: '4px 0 0 0' }}>Manage pharmacy orders, prescriptions, and deliveries.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsAddModalOpen(true); }}
          style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
        >
          + Add New Order
        </button>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <input 
          type="text" 
          placeholder="Search patient name or mobile..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '20px' }}
        />

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
              <th style={{ padding: '12px', color: '#64748b' }}>Patient</th>
              <th style={{ padding: '12px', color: '#64748b' }}>Last Given</th>
              <th style={{ padding: '12px', color: '#64748b' }}>Next Due</th>
              <th style={{ padding: '12px', color: '#64748b' }}>Status</th>
              <th style={{ padding: '12px', textAlign: 'right', color: '#64748b' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map(order => (
              <tr key={order.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '16px 12px' }}>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>{order.patientName}</div>
                  <div style={{ fontSize: '13px', color: '#64748b' }}>{order.mobile}</div>
                </td>
                <td style={{ padding: '16px 12px' }}>{order.lastGivenDate ? new Date(order.lastGivenDate).toLocaleDateString() : '-'}</td>
                <td style={{ padding: '16px 12px' }}>
                  <span style={{ color: order.nextDueDate && new Date(order.nextDueDate) < new Date() ? '#ef4444' : '#0f172a', fontWeight: order.nextDueDate && new Date(order.nextDueDate) < new Date() ? 'bold' : 'normal' }}>
                    {order.nextDueDate ? new Date(order.nextDueDate).toLocaleDateString() : '-'}
                  </span>
                </td>
                <td style={{ padding: '16px 12px' }}>
                  <span style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 600, background: order.status === 'ACTIVE' ? '#dcfce7' : '#f1f5f9', color: order.status === 'ACTIVE' ? '#166534' : '#475569' }}>
                    {order.status}
                  </span>
                </td>
                <td style={{ padding: '16px 12px', textAlign: 'right' }}>
                  <button onClick={() => handleEdit(order)} style={{ background: '#f59e0b', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', marginRight: '8px', cursor: 'pointer' }}>Edit</button>
                  <button onClick={() => generatePDF(order)} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', marginRight: '8px', cursor: 'pointer' }}>View PDF</button>
                  <button onClick={() => handleDelete(order.id)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}>Delete</button>

                  {/* Hidden PDF Template */}
                  <div id={`pdf-template-${order.id}`} style={{ display: 'none', width: '210mm', minHeight: '297mm', background: 'white', padding: '20mm', boxSizing: 'border-box' }}>
                    <div style={{ borderBottom: '2px solid #0f3162', paddingBottom: '20px', marginBottom: '20px', textAlign: 'center' }}>
                      <h1 style={{ color: '#0f3162', fontSize: '28px', margin: '0 0 10px 0' }}>Benva Healthcare</h1>
                      <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Pharmacy Order Form</p>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', background: '#f8fafc', padding: '15px', borderRadius: '8px' }}>
                      <div>
                        <strong style={{ color: '#0f172a' }}>Patient:</strong> <span style={{ color: '#334155' }}>{order.patientName}</span>
                      </div>
                      <div>
                        <strong style={{ color: '#0f172a' }}>Date:</strong> <span style={{ color: '#334155' }}>{new Date().toLocaleDateString()}</span>
                      </div>
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '40px' }}>
                      <thead>
                        <tr style={{ background: '#0f3162', color: 'white' }}>
                          <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #cbd5e1' }}>Medicine Name</th>
                          <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #cbd5e1' }}>Type</th>
                          <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #cbd5e1' }}>Quantity</th>
                          <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #cbd5e1' }}>Instructions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.isArray(order.medicines) && order.medicines.filter((m: any) => m.isSelected !== false).map((med: any, i: number) => (
                          <tr key={i}>
                            <td style={{ padding: '12px', border: '1px solid #cbd5e1' }}>{med.name}</td>
                            <td style={{ padding: '12px', border: '1px solid #cbd5e1' }}>{med.type}</td>
                            <td style={{ padding: '12px', border: '1px solid #cbd5e1', textAlign: 'center' }}>{med.quantity}</td>
                            <td style={{ padding: '12px', border: '1px solid #cbd5e1' }}>{med.instructions}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {order.prescriptionUrls && order.prescriptionUrls.length > 0 && (
                      <div style={{ pageBreakBefore: 'always' }}>
                        <h2 style={{ color: '#0f3162', marginBottom: '20px' }}>Original Prescriptions</h2>
                        {order.prescriptionUrls.map((url: string, i: number) => (
                          <img key={i} src={url} alt="Prescription" style={{ maxWidth: '100%', height: 'auto', marginBottom: '20px', border: '1px solid #e2e8f0' }} crossOrigin="anonymous" />
                        ))}
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isAddModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '12px', width: '100%', maxWidth: '900px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '20px' }}>{editingOrder ? 'Edit Medicine Order' : 'New Medicine Order'}</h2>
              <button onClick={() => setIsAddModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>&times;</button>
            </div>
            
            <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
              <form id="med-form" onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#334155' }}>Patient Name *</label>
                    <input required type="text" value={formData.patientName} onChange={e => setFormData({...formData, patientName: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#334155' }}>Mobile Number *</label>
                    <input required type="text" value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#334155' }}>Delivery Address</label>
                  <textarea value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', minHeight: '80px' }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#334155' }}>Last Given Date</label>
                    <input type="date" value={formData.lastGivenDate} onChange={e => setFormData({...formData, lastGivenDate: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#334155' }}>Next Due Date</label>
                    <input type="date" value={formData.nextDueDate} onChange={e => setFormData({...formData, nextDueDate: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                  </div>
                </div>

                <div style={{ borderTop: '2px solid #e2e8f0', paddingTop: '20px', marginBottom: '30px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h3 style={{ margin: 0, color: '#0f172a' }}>Uploaded Prescriptions</h3>
                    <div style={{ position: 'relative', overflow: 'hidden', display: 'inline-block' }}>
                      <button type="button" style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>+ Upload WhatsApp Image</button>
                      <input type="file" accept="image/*" onChange={handleFileUpload} style={{ position: 'absolute', left: 0, top: 0, opacity: 0, cursor: 'pointer', height: '100%' }} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px' }}>
                    {formData.prescriptionUrls.map((url, i) => (
                      <div key={i} style={{ position: 'relative', minWidth: '150px' }}>
                        <img src={url} alt="Prescription" style={{ width: '150px', height: '150px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                        <button type="button" onClick={() => setFormData({...formData, prescriptionUrls: formData.prescriptionUrls.filter((_, idx) => idx !== i)})} style={{ position: 'absolute', top: '5px', right: '5px', background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer' }}>&times;</button>
                      </div>
                    ))}
                    {formData.prescriptionUrls.length === 0 && <p style={{ color: '#94a3b8', fontStyle: 'italic', margin: 0 }}>No images uploaded yet.</p>}
                  </div>
                </div>

                <div style={{ borderTop: '2px solid #e2e8f0', paddingTop: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h3 style={{ margin: 0, color: '#0f172a' }}>Medicines List (For Pharmacy)</h3>
                    <button type="button" onClick={handleAddMedicine} style={{ background: '#10b981', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>+ Add Medicine Row</button>
                  </div>
                  
                  {formData.medicines.map((med, i) => (
                    <div key={med.id} style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '15px', background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <div>
                        <input type="checkbox" checked={med.isSelected !== false} onChange={e => handleMedicineChange(i, 'isSelected', e.target.checked)} title="Include in Pharmacy PDF" style={{ width: '20px', height: '20px', cursor: 'pointer' }} />
                      </div>
                      <div style={{ flex: 2 }}>
                        <input type="text" placeholder="Medicine Name" value={med.name} onChange={e => handleMedicineChange(i, 'name', e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <select value={med.type} onChange={e => handleMedicineChange(i, 'type', e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                          <option>Tablet</option>
                          <option>Strip</option>
                          <option>Capsule</option>
                          <option>Syrup</option>
                          <option>Injection</option>
                          <option>Ointment</option>
                          <option>Other</option>
                        </select>
                      </div>
                      <div style={{ flex: 1 }}>
                        <input type="text" placeholder="Quantity (e.g. 2 Strips)" value={med.quantity} onChange={e => handleMedicineChange(i, 'quantity', e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                      </div>
                      <div style={{ flex: 2 }}>
                        <input type="text" placeholder="Instructions (Optional)" value={med.instructions} onChange={e => handleMedicineChange(i, 'instructions', e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                      </div>
                      <div>
                        <button type="button" onClick={() => handleRemoveMedicine(i)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '10px', borderRadius: '6px', cursor: 'pointer' }}>X</button>
                      </div>
                    </div>
                  ))}
                  {formData.medicines.length === 0 && <p style={{ color: '#94a3b8', fontStyle: 'italic', margin: 0 }}>Click "Add Medicine Row" to type out medicines from the prescription.</p>}
                </div>

              </form>
            </div>
            
            <div style={{ padding: '20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setIsAddModalOpen(false)} style={{ background: '#f1f5f9', color: '#475569', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button type="submit" form="med-form" style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Save Order</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
