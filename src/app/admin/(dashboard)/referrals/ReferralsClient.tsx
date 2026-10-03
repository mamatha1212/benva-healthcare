'use client';

import React, { useState, useEffect } from 'react';
import styles from './ReferralsClient.module.css';

export default function ReferralsClient() {
  const [categories, setCategories] = useState<any[]>([]);
  const [referrers, setReferrers] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showCategoriesList, setShowCategoriesList] = useState(false);
  const [showReferrerModal, setShowReferrerModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState<any>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/referrals/categories');
      const data = await res.json();
      if (Array.isArray(data)) setCategories(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchReferrers = async () => {
    try {
      const res = await fetch('/api/admin/referrals/referrers');
      const data = await res.json();
      if (Array.isArray(data)) setReferrers(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchServices = async () => {
    try {
      const res = await fetch('/api/admin/referrals/services');
      const data = await res.json();
      if (Array.isArray(data)) setServices(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchReferrers();
    fetchServices();
  }, []);

  const handleCopyLink = () => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    navigator.clipboard.writeText(`${baseUrl}/referral-login`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCredentials = (referrer: any) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    const text = `Referral Portal Login\nURL: ${baseUrl}/referral-login\nReferral Code: ${referrer.referralCode || 'N/A'}\nUsername: ${referrer.username}\nPassword: ${referrer.password}`;
    navigator.clipboard.writeText(text);
    alert('Credentials & Referral Code copied to clipboard!');
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Manage Referrals</h1>
        <div className={styles.buttonGroup}>
          <button onClick={handleCopyLink} style={{ background: '#f8fafc', color: '#334155', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            {copiedLink ? 'Copied!' : 'Copy Referral Login Link'}
          </button>
          <button onClick={() => setShowCategoriesList(true)} style={{ background: '#e2e8f0', color: '#0f172a', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
            View Categories
          </button>
          <button onClick={() => setShowCategoryModal(true)} style={{ background: '#1e293b', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
            + Add Category
          </button>
          <button onClick={() => setShowReferrerModal(true)} style={{ background: '#2563eb', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
            + Add Referrer
          </button>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead className={styles.thead}>
              <tr className={styles.tr}>
                <th className={styles.th}>Name</th>
                <th className={styles.th}>Category</th>
                <th className={styles.th}>Contact</th>
                <th className={styles.th}>Credentials</th>
                <th className={styles.th}>Total Referrals</th>
                <th className={styles.th}>Total Earnings</th>
                <th className={styles.th} style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody className={styles.tbody}>
              {referrers.length > 0 ? referrers.map((referrer: any) => {
                const totalAmount = referrer.transactions?.reduce((sum: number, tx: any) => sum + (tx.amount || 0), 0) || 0;
                return (
                  <tr key={referrer.id} className={styles.tr}>
                    <td className={styles.td}>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{referrer.name}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>Added: {new Date(referrer.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className={styles.td}>
                      <span style={{ background: '#e0e7ff', color: '#4338ca', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>
                        {referrer.category?.name || 'N/A'}
                      </span>
                    </td>
                    <td className={styles.td} style={{ fontSize: '13px', color: '#334155' }}>
                      <div>{referrer.phone}</div>
                      <div style={{ color: '#64748b' }}>{referrer.email}</div>
                    </td>
                    <td className={styles.td}>
                      <div style={{ fontSize: '13px', color: '#16a34a', fontWeight: 700, marginBottom: '4px' }}>Code: {referrer.referralCode || 'N/A'}</div>
                      <div style={{ fontSize: '13px', color: '#334155', marginBottom: '8px' }}><span style={{ color: '#94a3b8' }}>U:</span> {referrer.username}</div>
                      <button onClick={() => handleCopyCredentials(referrer)} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#2563eb', fontSize: '12px', fontWeight: 600, cursor: 'pointer', padding: '6px 10px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        Copy Login Details
                      </button>
                    </td>
                    <td className={styles.td} style={{ fontWeight: 600, color: '#0f172a' }}>{referrer.transactions?.length || 0}</td>
                    <td className={styles.td} style={{ fontWeight: 600, color: '#059669' }}>₹{totalAmount.toFixed(2)}</td>
                    <td className={styles.td} style={{ textAlign: 'right' }}>
                      <button onClick={() => setShowTransactionModal(referrer)} style={{ background: '#10b981', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                        + Add Referral
                      </button>
                    </td>
                  </tr>
                );
              }) : (
                <tr className={styles.tr}>
                  <td colSpan={7} className={styles.td} style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
                    No referrers found. Create one to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showCategoriesList && (
        <CategoriesListModal categories={categories} onClose={() => setShowCategoriesList(false)} onRefresh={fetchCategories} />
      )}

      {showCategoryModal && (
        <CategoryModal onClose={() => setShowCategoryModal(false)} onSaved={fetchCategories} />
      )}
      
      {showReferrerModal && (
        <ReferrerModal categories={categories} onClose={() => setShowReferrerModal(false)} onSaved={fetchReferrers} />
      )}
      
      {showTransactionModal && (
        <TransactionModal referrer={showTransactionModal} services={services} onClose={() => setShowTransactionModal(null)} onSaved={fetchReferrers} />
      )}
    </div>
  );
}

function CategoriesListModal({ categories, onClose, onRefresh }: { categories: any[], onClose: () => void, onRefresh: () => void }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleEdit = (cat: any) => {
    setEditingId(cat.id);
    setEditName(cat.name);
  };

  const handleSaveEdit = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/referrals/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName })
      });
      if (res.ok) {
        setEditingId(null);
        onRefresh();
      } else {
        alert('Failed to update category');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category? Referrers in this category might be affected.')) return;
    try {
      const res = await fetch(`/api/admin/referrals/categories/${id}`, { method: 'DELETE' });
      if (res.ok) {
        onRefresh();
      } else {
        alert('Failed to delete category');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
      <div style={{ background: 'white', padding: '24px', borderRadius: '12px', width: '100%', maxWidth: '500px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', color: '#0f172a' }}>
        <h2 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>Referral Categories</h2>
        
        <div style={{ overflowY: 'auto', flex: 1 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '12px', fontSize: '13px', color: '#64748b' }}>Category Name</th>
                <th style={{ padding: '12px', fontSize: '13px', color: '#64748b' }}>Created At</th>
                <th style={{ padding: '12px', fontSize: '13px', color: '#64748b', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.length > 0 ? categories.map(cat => (
                <tr key={cat.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px', fontWeight: 600, color: '#334155' }}>
                    {editingId === cat.id ? (
                      <input type="text" value={editName} onChange={e => setEditName(e.target.value)} style={{ padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                    ) : cat.name}
                  </td>
                  <td style={{ padding: '12px', fontSize: '13px', color: '#64748b' }}>{new Date(cat.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    {editingId === cat.id ? (
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button onClick={() => handleSaveEdit(cat.id)} style={{ padding: '4px 8px', background: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Save</button>
                        <button onClick={() => setEditingId(null)} style={{ padding: '4px 8px', background: '#e2e8f0', color: '#334155', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Cancel</button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button onClick={() => handleEdit(cat)} style={{ padding: '4px 8px', background: '#f8fafc', color: '#2563eb', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Edit</button>
                        <button onClick={() => handleDelete(cat.id)} style={{ padding: '4px 8px', background: '#fee2e2', color: '#ef4444', border: '1px solid #fecaca', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Delete</button>
                      </div>
                    )}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={3} style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>No categories found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
          <button onClick={onClose} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'white', cursor: 'pointer', fontWeight: 600 }}>Close</button>
        </div>
      </div>
    </div>
  );
}

function CategoryModal({ onClose, onSaved }: { onClose: () => void, onSaved: () => void }) {
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/referrals/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      if (res.ok) {
        onSaved();
        onClose();
      } else {
        alert('Failed to add category');
      }
    } catch (err) {
      console.error(err);
    }
    setSubmitting(false);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
      <div style={{ background: 'white', padding: '24px', borderRadius: '12px', width: '100%', maxWidth: '400px', color: '#0f172a' }}>
        <h2 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>Add Referral Category</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Category Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. RMP, Asha Worker" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'white', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" disabled={submitting} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#2563eb', color: 'white', cursor: 'pointer', fontWeight: 600 }}>
              {submitting ? 'Saving...' : 'Save Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ReferrerModal({ categories, onClose, onSaved }: { categories: any[], onClose: () => void, onSaved: () => void }) {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', username: '', password: '', categoryId: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/referrals/referrers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        onSaved();
        onClose();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to add referrer');
      }
    } catch (err) {
      console.error(err);
    }
    setSubmitting(false);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
      <div style={{ background: 'white', padding: '24px', borderRadius: '12px', width: '100%', maxWidth: '500px', color: '#0f172a' }}>
        <h2 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>Add New Referrer</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Name</label>
            <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Phone</label>
              <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Email (Optional)</label>
              <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Username</label>
              <input type="text" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Password</label>
              <input type="text" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Category</label>
            <select value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'white' }}>
              <option value="">Select Category...</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
            <button type="button" onClick={onClose} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'white', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" disabled={submitting} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#2563eb', color: 'white', cursor: 'pointer', fontWeight: 600 }}>
              {submitting ? 'Saving...' : 'Add Referrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TransactionModal({ referrer, services, onClose, onSaved }: { referrer: any, services: any[], onClose: () => void, onSaved: () => void }) {
  const [formData, setFormData] = useState({ serviceName: '', amount: '', referralDate: new Date().toISOString().split('T')[0] });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/referrals/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ referrerId: referrer.id, ...formData })
      });
      if (res.ok) {
        onSaved();
        onClose();
      } else {
        alert('Failed to add transaction');
      }
    } catch (err) {
      console.error(err);
    }
    setSubmitting(false);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
      <div style={{ background: 'white', padding: '24px', borderRadius: '12px', width: '100%', maxWidth: '400px', color: '#0f172a' }}>
        <h2 style={{ margin: '0 0 4px 0', fontSize: '18px' }}>Add Referral for {referrer.name}</h2>
        <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#64748b' }}>Log a new patient referral and add the amount to their total.</p>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Patient Name (Optional)</label>
            <input type="text" value={(formData as any).patientName || ''} onChange={e => setFormData({...formData, patientName: e.target.value})} placeholder="e.g. Ramesh Kumar" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Patient Phone (Optional)</label>
            <input type="text" value={(formData as any).patientPhone || ''} onChange={e => setFormData({...formData, patientPhone: e.target.value})} placeholder="e.g. 9876543210" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Service / Package Name</label>
            <select value={formData.serviceName} onChange={e => setFormData({...formData, serviceName: e.target.value})} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'white' }}>
              <option value="">Select a Service / Package...</option>
              {services.map(s => (
                <option key={s.id} value={s.name}>{s.type}: {s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Referral Amount (₹)</label>
            <input type="number" min="0" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} required placeholder="e.g. 500" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Referral Date</label>
            <input type="date" value={formData.referralDate} onChange={e => setFormData({...formData, referralDate: e.target.value})} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
          </div>
          
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
            <button type="button" onClick={onClose} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'white', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" disabled={submitting} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#10b981', color: 'white', cursor: 'pointer', fontWeight: 600 }}>
              {submitting ? 'Saving...' : 'Add Referral'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
