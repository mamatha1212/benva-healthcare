'use client';

import React, { useState } from 'react';

export default function OrgEmployeesClient({ initialEmployees }: { initialEmployees: any[] }) {
  const [employees, setEmployees] = useState(initialEmployees);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState({ name: '', phone: '', email: '', remarks: '' });
  const [loading, setLoading] = useState(false);

  const handleEditClick = (emp: any) => {
    setEditingId(emp.id);
    setEditData({ name: emp.name, phone: emp.phone, email: emp.email || '', remarks: emp.remarks || '' });
  };

  const handleSave = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/corporate/employees/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData)
      });
      if (res.ok) {
        const updated = await res.json();
        setEmployees(employees.map(e => e.id === id ? updated : e));
        setEditingId(null);
      } else {
        alert('Failed to update');
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this employee?')) return;
    try {
      const res = await fetch(`/api/admin/corporate/employees/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setEmployees(employees.filter(e => e.id !== id));
      } else {
        alert('Failed to delete');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflowX: 'auto' }}>
      <table style={{ width: '100%', minWidth: '800px', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead style={{ background: '#f8fafc' }}>
          <tr>
            <th style={{ padding: '16px', fontSize: '13px', color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>S.No</th>
            <th style={{ padding: '16px', fontSize: '13px', color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>Name</th>
            <th style={{ padding: '16px', fontSize: '13px', color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>Mobile Number</th>
            <th style={{ padding: '16px', fontSize: '13px', color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>Corporate Mail ID</th>
            <th style={{ padding: '16px', fontSize: '13px', color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>Remarks</th>
            <th style={{ padding: '16px', fontSize: '13px', color: '#64748b', borderBottom: '1px solid #e2e8f0', textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.length > 0 ? (
            employees.map((emp: any, idx: number) => {
              const isEditing = editingId === emp.id;
              return (
                <tr key={emp.id}>
                  <td style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', fontSize: '14px', color: '#334155' }}>{idx + 1}</td>
                  
                  <td style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>
                    {isEditing ? <input type="text" value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} style={{ padding: '6px', width: '100%' }} /> : emp.name}
                  </td>
                  
                  <td style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', fontSize: '14px', color: '#334155' }}>
                    {isEditing ? <input type="text" value={editData.phone} onChange={e => setEditData({...editData, phone: e.target.value})} style={{ padding: '6px', width: '100%' }} /> : emp.phone}
                  </td>
                  
                  <td style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', fontSize: '14px', color: '#334155' }}>
                    {isEditing ? <input type="email" value={editData.email} onChange={e => setEditData({...editData, email: e.target.value})} style={{ padding: '6px', width: '100%' }} /> : (emp.email || '-')}
                  </td>
                  
                  <td style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', fontSize: '14px', color: '#334155' }}>
                    {isEditing ? <input type="text" value={editData.remarks} onChange={e => setEditData({...editData, remarks: e.target.value})} style={{ padding: '6px', width: '100%' }} /> : (emp.remarks || '-')}
                  </td>
                  
                  <td style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', textAlign: 'right' }}>
                    {isEditing ? (
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button onClick={() => setEditingId(null)} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'white', cursor: 'pointer', fontSize: '12px' }}>Cancel</button>
                        <button onClick={() => handleSave(emp.id)} disabled={loading} style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: '#10b981', color: 'white', cursor: 'pointer', fontSize: '12px' }}>Save</button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button onClick={() => handleEditClick(emp)} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#475569', cursor: 'pointer', fontSize: '12px' }}>Edit</button>
                        <button onClick={() => handleDelete(emp.id)} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #fecaca', background: '#fef2f2', color: '#ef4444', cursor: 'pointer', fontSize: '12px' }}>Delete</button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>No employees found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
