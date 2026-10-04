'use client';

import React, { useState, useEffect } from 'react';

export default function CorporateClient() {
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEmployeeModal, setShowEmployeeModal] = useState<any>(null); // holds org id
  const [formData, setFormData] = useState({ companyName: '', hrName: '', hrEmail: '', hrPhone: '', address: '' });
  const [empFormData, setEmpFormData] = useState({ name: '', phone: '', email: '', remarks: '' });
  const [submitting, setSubmitting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [editingOrgId, setEditingOrgId] = useState<string | null>(null);

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      const res = await fetch('/api/admin/corporate/organizations');
      const data = await res.json();
      if (Array.isArray(data)) setOrganizations(data);
    } catch (err) {
      console.error('Failed to fetch organizations:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/corporate/organizations', {
        method: editingOrgId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingOrgId ? { ...formData, id: editingOrgId } : formData)
      });
      if (res.ok) {
        setShowAddModal(false);
        setFormData({ companyName: '', hrName: '', hrEmail: '', hrPhone: '', address: '' });
        setEditingOrgId(null);
        fetchOrganizations();
      } else {
        alert(editingOrgId ? 'Failed to update organization' : 'Failed to add organization');
      }
    } catch (err) {
      console.error(err);
    }
    setSubmitting(false);
  };

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/corporate/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...empFormData, organizationId: showEmployeeModal })
      });
      if (res.ok) {
        setShowEmployeeModal(null);
        setEmpFormData({ name: '', phone: '', email: '', remarks: '' });
        fetchOrganizations();
      } else {
        alert('Failed to add employee');
      }
    } catch (err) {
      console.error(err);
    }
    setSubmitting(false);
  };

  const handleExport = (org: any) => {
    if (!org.employees || org.employees.length === 0) return alert('No employees to export');
    const headers = ['S.No,Name,Mobile Number,Corporate Mail ID,Remarks'];
    const rows = org.employees.map((emp: any, index: number) => 
      `${index + 1},${emp.name},${emp.phone},${emp.email || ''},${emp.remarks || ''}`
    );
    const csvContent = headers.concat(rows).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${org.companyName.replace(/\s+/g, '_')}_employees.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBulkImport = async (e: React.ChangeEvent<HTMLInputElement>, orgId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const csv = event.target?.result as string;
        const lines = csv.split('\n').filter(line => line.trim() !== '');
        if (lines.length < 2) return alert('Invalid CSV format. Need header and at least one row.');
        
        // Skip header line (index 0)
        const employeesToImport = [];
        for (let i = 1; i < lines.length; i++) {
          // Splitting by comma, simple parser
          const row = lines[i].split(',').map(item => item.trim());
          if (row.length >= 4) {
             const name = row[1] || '';
             const phone = row[2] || '';
             const email = row[3] || '';
             const remarks = row[4] || '';
             if (name && phone) {
               employeesToImport.push({ name, phone, email, remarks, organizationId: orgId });
             }
          }
        }

        if (employeesToImport.length > 0) {
          const res = await fetch('/api/admin/corporate/employees/bulk', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ employees: employeesToImport })
          });
          if (res.ok) {
            alert(`Successfully imported ${employeesToImport.length} employees`);
            fetchOrganizations();
          } else {
            alert('Failed to import employees');
          }
        } else {
          alert('No valid employees found in CSV.');
        }
      } catch (err) {
        console.error(err);
        alert('Error parsing CSV');
      }
      setImporting(false);
    };
    reader.readAsText(file);
    e.target.value = ''; // reset input
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>Corporate Family Doctor Program</h1>
          <p style={{ margin: '4px 0 0 0', color: '#64748b' }}>Manage enrolled companies and their employees.</p>
        </div>
        <button onClick={() => {
          setEditingOrgId(null);
          setFormData({ companyName: '', hrName: '', hrEmail: '', hrPhone: '', address: '' });
          setShowAddModal(true);
        }} style={{ background: '#2563eb', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
          + Add Company
        </button>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflowX: 'auto' }}>
        <table style={{ width: '100%', minWidth: '900px', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: '#f8fafc' }}>
            <tr>
              <th style={{ padding: '16px', fontSize: '13px', color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>Company Name</th>
              <th style={{ padding: '16px', fontSize: '13px', color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>HR Contact</th>
              <th style={{ padding: '16px', fontSize: '13px', color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>Status</th>
              <th style={{ padding: '16px', fontSize: '13px', color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>Employees Enrolled</th>
              <th style={{ padding: '16px', fontSize: '13px', color: '#64748b', borderBottom: '1px solid #e2e8f0', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {organizations.length > 0 ? organizations.map((org) => (
              <tr key={org.id}>
                <td style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', fontWeight: 600, color: '#0f172a' }}>{org.companyName}</td>
                <td style={{ padding: '16px', borderBottom: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '14px', color: '#334155' }}>{org.hrName}</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>{org.hrPhone} | {org.hrEmail}</div>
                </td>
                <td style={{ padding: '16px', borderBottom: '1px solid #e2e8f0' }}>
                  <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600, background: org.status === 'ACTIVE' ? '#dcfce7' : '#fef9c3', color: org.status === 'ACTIVE' ? '#166534' : '#854d0e' }}>
                    {org.status}
                  </span>
                </td>
                <td style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', color: '#334155' }}>
                  {org.employees?.length || 0} Employees
                </td>
                <td style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', textAlign: 'right' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <a href={`/admin/corporate/${org.id}`} style={{ padding: '8px 16px', borderRadius: '8px', background: '#2563eb', color: '#ffffff', cursor: 'pointer', fontWeight: 600, fontSize: '13px', textDecoration: 'none', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                        Manage Employees
                      </a>
                      <button onClick={() => {
                        setEditingOrgId(org.id);
                        setFormData({
                          companyName: org.companyName || '',
                          hrName: org.hrName || '',
                          hrEmail: org.hrEmail || '',
                          hrPhone: org.hrPhone || '',
                          address: org.address || ''
                        });
                        setShowAddModal(true);
                      }} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', color: '#475569', cursor: 'pointer', fontWeight: 600, fontSize: '13px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                        Edit Info
                      </button>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <label style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#475569', cursor: 'pointer', fontWeight: 500, fontSize: '12px', display: 'flex', alignItems: 'center' }}>
                        {importing ? 'Importing...' : 'Import CSV'}
                        <input type="file" accept=".csv" onChange={(e) => handleBulkImport(e, org.id)} style={{ display: 'none' }} disabled={importing} />
                      </label>
                      <button onClick={() => handleExport(org)} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#475569', cursor: 'pointer', fontWeight: 500, fontSize: '12px' }}>
                        Export CSV
                      </button>
                      <button onClick={() => setShowEmployeeModal(org.id)} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #10b981', background: '#ecfdf5', color: '#059669', cursor: 'pointer', fontWeight: 600, fontSize: '12px' }}>
                        + Add 1
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>No organizations enrolled yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: '16px', width: '100%', maxWidth: '500px', color: '#0f172a' }}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '20px', color: '#0f172a' }}>{editingOrgId ? 'Edit Corporate Client' : 'Add New Corporate Client'}</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>Company Name</label>
                <input type="text" value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#0f172a', background: 'white', outline: 'none' }} />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>HR/Admin Name</label>
                  <input type="text" value={formData.hrName} onChange={e => setFormData({...formData, hrName: e.target.value})} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#0f172a', background: 'white', outline: 'none' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>HR Phone</label>
                  <input type="text" value={formData.hrPhone} onChange={e => setFormData({...formData, hrPhone: e.target.value})} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#0f172a', background: 'white', outline: 'none' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>HR Email</label>
                <input type="email" value={formData.hrEmail} onChange={e => setFormData({...formData, hrEmail: e.target.value})} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#0f172a', background: 'white', outline: 'none' }} />
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button type="button" onClick={() => {
                  setShowAddModal(false);
                  setEditingOrgId(null);
                }} style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', color: '#475569', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
                <button type="submit" disabled={submitting} style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: '#2563eb', color: 'white', cursor: 'pointer', fontWeight: 600 }}>{submitting ? 'Saving...' : (editingOrgId ? 'Update Company' : 'Add Company')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEmployeeModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: '16px', width: '100%', maxWidth: '400px', color: '#0f172a' }}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '20px', color: '#0f172a' }}>Add Employee</h2>
            <form onSubmit={handleAddEmployee} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>Employee Name</label>
                <input type="text" value={empFormData.name} onChange={e => setEmpFormData({...empFormData, name: e.target.value})} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#0f172a', background: 'white', outline: 'none' }} />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>Mobile Number</label>
                  <input type="text" value={empFormData.phone} onChange={e => setEmpFormData({...empFormData, phone: e.target.value})} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#0f172a', background: 'white', outline: 'none' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>Corporate Mail ID</label>
                  <input type="email" value={empFormData.email} onChange={e => setEmpFormData({...empFormData, email: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#0f172a', background: 'white', outline: 'none' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>Remarks (Optional)</label>
                <input type="text" value={empFormData.remarks} onChange={e => setEmpFormData({...empFormData, remarks: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#0f172a', background: 'white', outline: 'none' }} />
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button type="button" onClick={() => setShowEmployeeModal(null)} style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', color: '#475569', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
                <button type="submit" disabled={submitting} style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: '#10b981', color: 'white', cursor: 'pointer', fontWeight: 600 }}>{submitting ? 'Saving...' : 'Add Employee'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
