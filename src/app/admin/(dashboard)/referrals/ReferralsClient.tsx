'use client';

import React, { useState, useEffect } from 'react';
import styles from './ReferralsClient.module.css';

export default function ReferralsClient({ initialStates = [] }: { initialStates?: any[] }) {
  const [categories, setCategories] = useState<any[]>([]);
  const [referrers, setReferrers] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showCategoriesList, setShowCategoriesList] = useState(false);
  const [showReferrerModal, setShowReferrerModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState<any>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const [showHistoryModal, setShowHistoryModal] = useState<any>(null);
  const [editingTransaction, setEditingTransaction] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

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
      const res = await fetch('/api/admin/referrals/referrers', { cache: 'no-store' });
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

      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
        <input 
          type="text" 
          placeholder="Filter by Pincode, Area, or Name..." 
          value={searchTerm} 
          onChange={e => setSearchTerm(e.target.value)}
          style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', width: '100%', maxWidth: '400px', fontSize: '14px', outline: 'none', background: 'white', color: '#0f172a', transition: 'border-color 0.2s' }}
          onFocus={e => e.target.style.borderColor = '#3b82f6'}
          onBlur={e => e.target.style.borderColor = '#cbd5e1'}
        />
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
              {referrers
                .filter(r => 
                  (r.name && r.name.toLowerCase().includes(searchTerm.toLowerCase())) || 
                  (r.pincode && r.pincode.includes(searchTerm)) || 
                  (r.area && r.area.toLowerCase().includes(searchTerm.toLowerCase()))
                )
                .map((referrer: any) => {
                const totalAmount = referrer.transactions?.filter((tx:any) => tx.status === 'COMPLETED').reduce((sum: number, tx: any) => sum + (tx.amount || 0), 0) || 0;
                return (
                  <tr key={referrer.id} className={styles.tr}>
                    <td className={styles.td}>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{referrer.name}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>Added: {new Date(referrer.createdAt).toLocaleDateString()}</div>
                      {referrer.area && <div style={{ fontSize: '11px', color: '#059669', fontWeight: 600, marginTop: '4px', textTransform: 'uppercase' }}>📍 {referrer.area}</div>}
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
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', flexDirection: 'column' }}>
                        <a href={`/admin/referrals/${referrer.id}`} style={{ background: '#f8fafc', color: '#0f172a', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, textDecoration: 'none', textAlign: 'center' }}>
                          View History
                        </a>
                        <button onClick={() => setShowTransactionModal(referrer)} style={{ background: '#10b981', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                          + Add Referral
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {referrers.filter(r => (r.name && r.name.toLowerCase().includes(searchTerm.toLowerCase())) || (r.pincode && r.pincode.includes(searchTerm)) || (r.area && r.area.toLowerCase().includes(searchTerm.toLowerCase()))).length === 0 && (
                <tr className={styles.tr}>
                  <td colSpan={7} className={styles.td} style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
                    No referrers found. Try adjusting your search.
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
        <ReferrerModal categories={categories} states={initialStates} onClose={() => setShowReferrerModal(false)} onSaved={fetchReferrers} />
      )}
      
      {showTransactionModal && (
        <TransactionModal referrer={showTransactionModal} services={services} transactionToEdit={editingTransaction} onClose={() => { setShowTransactionModal(null); setEditingTransaction(null); }} onSaved={fetchReferrers} />
      )}

      {showHistoryModal && (
        <HistoryModal referrer={referrers.find(r => r.id === showHistoryModal.id) || showHistoryModal} onClose={() => setShowHistoryModal(null)} onRefresh={fetchReferrers} onEdit={(tx) => { setEditingTransaction(tx); setShowTransactionModal(showHistoryModal); setShowHistoryModal(null); }} />
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

function ReferrerModal({ categories, states, onClose, onSaved }: { categories: any[], states: any[], onClose: () => void, onSaved: () => void }) {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', username: '', password: '', categoryId: '', state: '', district: '', pincode: '', area: '' });
  const [isCheckingArea, setIsCheckingArea] = useState(false);
  const [availableAreas, setAvailableAreas] = useState<any[]>([]);
  const [showAreaSelect, setShowAreaSelect] = useState(false);
  const [checkAreaMessage, setCheckAreaMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleCheckPincode = async () => {
    if (!formData.pincode || formData.pincode.length < 6) {
      setCheckAreaMessage('Please enter a valid 6-digit pincode');
      return;
    }
    
    setIsCheckingArea(true);
    setCheckAreaMessage('');
    setAvailableAreas([]);
    setShowAreaSelect(false);

    try {
      const res = await fetch(`/api/admin/service-locations/check?pincode=${formData.pincode}`);
      const data = await res.json();
      
      if (res.ok && data.locations && data.locations.length > 0) {
        setAvailableAreas(data.locations);
        setShowAreaSelect(true);
      } else {
        setCheckAreaMessage('No service areas found for this pincode.');
      }
    } catch (e) {
      setCheckAreaMessage('Failed to check availability.');
    } finally {
      setIsCheckingArea(false);
    }
  };

  const selectArea = (loc: any) => {
    setFormData(prev => ({ ...prev, area: loc.officeName || '' }));
    setShowAreaSelect(false);
  };

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
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px', animation: 'fadeIn 0.2s ease-out' }}>
      <div style={{ background: 'white', padding: '32px', borderRadius: '16px', width: '100%', maxWidth: '850px', color: '#0f172a', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
        <h2 style={{ margin: '0 0 8px 0', fontSize: '22px', fontWeight: 800, color: '#1e293b', letterSpacing: '-0.02em' }}>Add New Referrer</h2>
        <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: '#64748b', lineHeight: 1.5 }}>Fill in the details below to register a new referral partner.</p>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1.5 }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Name</label>
              <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required placeholder="e.g. Ramesh Kumar" style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', fontSize: '15px', color: '#0f172a', outline: 'none', transition: 'border-color 0.2s' }} onFocus={e => e.target.style.borderColor = '#3b82f6'} onBlur={e => e.target.style.borderColor = '#cbd5e1'} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Phone</label>
              <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required placeholder="e.g. 9876543210" style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', fontSize: '15px', color: '#0f172a', outline: 'none', transition: 'border-color 0.2s' }} onFocus={e => e.target.style.borderColor = '#3b82f6'} onBlur={e => e.target.style.borderColor = '#cbd5e1'} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email (Optional)</label>
              <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="e.g. ramesh@gmail.com" style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', fontSize: '15px', color: '#0f172a', outline: 'none', transition: 'border-color 0.2s' }} onFocus={e => e.target.style.borderColor = '#3b82f6'} onBlur={e => e.target.style.borderColor = '#cbd5e1'} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Username</label>
              <input type="text" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} required placeholder="e.g. ramesh123" style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', fontSize: '15px', color: '#0f172a', outline: 'none', transition: 'border-color 0.2s' }} onFocus={e => e.target.style.borderColor = '#3b82f6'} onBlur={e => e.target.style.borderColor = '#cbd5e1'} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Password</label>
              <input type="text" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required placeholder="Enter password" style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', fontSize: '15px', color: '#0f172a', outline: 'none', transition: 'border-color 0.2s' }} onFocus={e => e.target.style.borderColor = '#3b82f6'} onBlur={e => e.target.style.borderColor = '#cbd5e1'} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Category</label>
              <select value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})} required style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', fontSize: '15px', color: '#0f172a', outline: 'none', cursor: 'pointer', transition: 'border-color 0.2s' }} onFocus={e => e.target.style.borderColor = '#3b82f6'} onBlur={e => e.target.style.borderColor = '#cbd5e1'}>
                <option value="">Select Category...</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>State</label>
              <select value={formData.state} onChange={e => setFormData({...formData, state: e.target.value, district: ''})} required style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', fontSize: '15px', color: '#0f172a', outline: 'none', cursor: 'pointer', transition: 'border-color 0.2s' }} onFocus={e => e.target.style.borderColor = '#3b82f6'} onBlur={e => e.target.style.borderColor = '#cbd5e1'}>
                <option value="">Select State...</option>
                {states.map((s: any) => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>District</label>
              <select value={formData.district} onChange={e => setFormData({...formData, district: e.target.value})} required disabled={!formData.state} style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: formData.state ? 'white' : '#f1f5f9', fontSize: '15px', color: formData.state ? '#0f172a' : '#94a3b8', outline: 'none', cursor: formData.state ? 'pointer' : 'not-allowed', transition: 'border-color 0.2s' }} onFocus={e => e.target.style.borderColor = '#3b82f6'} onBlur={e => e.target.style.borderColor = '#cbd5e1'}>
                <option value="">Select District...</option>
                {states.find((s: any) => s.name === formData.state)?.districts?.map((d: any) => (
                  <option key={d.id} value={d.name}>{d.name}</option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pincode & Area</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input type="text" value={formData.pincode} onChange={e => {
                  setFormData({...formData, pincode: e.target.value, area: ''});
                  setCheckAreaMessage('');
                  setShowAreaSelect(false);
                }} placeholder="e.g. 500081" required maxLength={6} style={{ flex: 1, padding: '12px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', fontSize: '15px', color: '#0f172a', outline: 'none', transition: 'border-color 0.2s' }} onFocus={e => e.target.style.borderColor = '#3b82f6'} onBlur={e => e.target.style.borderColor = '#cbd5e1'} />
                <button type="button" onClick={handleCheckPincode} disabled={isCheckingArea || formData.pincode.length !== 6} style={{ padding: '0 20px', borderRadius: '8px', border: 'none', background: (isCheckingArea || formData.pincode.length !== 6) ? '#94a3b8' : '#2563eb', color: 'white', fontWeight: 700, cursor: (isCheckingArea || formData.pincode.length !== 6) ? 'not-allowed' : 'pointer', transition: 'background 0.2s', fontSize: '14px' }}>
                  {isCheckingArea ? '...' : 'Check'}
                </button>
              </div>
              {checkAreaMessage && !formData.area && (
                <div style={{ fontSize: '12px', color: checkAreaMessage.includes('valid') || checkAreaMessage.includes('No') ? '#ef4444' : '#10b981', marginTop: '6px', fontWeight: 500 }}>{checkAreaMessage}</div>
              )}
            </div>
          </div>

          {showAreaSelect && availableAreas.length > 0 && (
            <div style={{ background: 'linear-gradient(to right bottom, #f8fafc, #f1f5f9)', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.03)' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#334155', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Select an Area</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px', maxHeight: '180px', overflowY: 'auto', paddingRight: '8px' }}>
                {availableAreas.map((loc) => (
                  <div key={loc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', transition: 'border-color 0.2s', cursor: 'pointer' }} onClick={() => selectArea(loc)} onMouseOver={e => e.currentTarget.style.borderColor = '#3b82f6'} onMouseOut={e => e.currentTarget.style.borderColor = '#cbd5e1'}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>{loc.officeName}</div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{loc.type}</div>
                    </div>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'transparent' }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {formData.area && (
            <div style={{ padding: '16px 20px', background: '#ecfdf5', border: '1.5px solid #10b981', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.1)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12px', color: '#065f46', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Selected Area</div>
                <div style={{ fontSize: '16px', color: '#047857', fontWeight: 800, marginTop: '2px' }}>{formData.area}</div>
              </div>
              <button type="button" onClick={() => setFormData({...formData, area: ''})} style={{ background: 'white', border: '1px solid #10b981', color: '#10b981', cursor: 'pointer', fontSize: '13px', fontWeight: 700, padding: '6px 16px', borderRadius: '6px', transition: 'all 0.2s' }} onMouseOver={e => { e.currentTarget.style.background = '#10b981'; e.currentTarget.style.color = 'white'; }} onMouseOut={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#10b981'; }}>Change</button>
            </div>
          )}
          
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
            <button type="button" onClick={onClose} style={{ padding: '12px 24px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', color: '#475569', cursor: 'pointer', fontWeight: 600, fontSize: '14px', transition: 'all 0.2s' }} onMouseOver={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = '#0f172a'; }} onMouseOut={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#475569'; }}>Cancel</button>
            <button type="submit" disabled={submitting || (showAreaSelect ? false : (formData.pincode.length === 6 && !formData.area))} style={{ padding: '12px 32px', borderRadius: '8px', border: 'none', background: '#2563eb', color: 'white', cursor: (submitting || (formData.pincode.length === 6 && !formData.area)) ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '14px', boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)', transition: 'all 0.2s', opacity: (submitting || (formData.pincode.length === 6 && !formData.area)) ? 0.7 : 1 }} onMouseOver={e => { if(!submitting && formData.area) e.currentTarget.style.background = '#1d4ed8'; }} onMouseOut={e => { if(!submitting) e.currentTarget.style.background = '#2563eb'; }}>
              {submitting ? 'Saving...' : 'Add Referrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function TransactionModal({ referrer, services, transactionToEdit, onClose, onSaved }: { referrer: any, services: any[], transactionToEdit?: any, onClose: () => void, onSaved: () => void }) {
  const isKnownService = transactionToEdit ? services.some(s => s.name === transactionToEdit.serviceName) : false;
  const initialServiceName = transactionToEdit ? (isKnownService ? transactionToEdit.serviceName : 'Others') : '';
  const initialCustomName = transactionToEdit && !isKnownService ? transactionToEdit.serviceName : '';
  const initialCustomPrice = transactionToEdit && !isKnownService && transactionToEdit.servicePrice ? String(transactionToEdit.servicePrice) : '';

  const [formData, setFormData] = useState({ 
    serviceName: initialServiceName, 
    amount: transactionToEdit ? String(transactionToEdit.amount) : '', 
    referralDate: transactionToEdit ? new Date(transactionToEdit.referralDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0], 
    patientName: transactionToEdit?.patientName || '', 
    patientPhone: transactionToEdit?.patientPhone || '',
    status: transactionToEdit?.status || 'PENDING',
    comments: transactionToEdit?.comments || ''
  });
  
  const [customTests, setCustomTests] = useState([
    { name: initialCustomName, price: initialCustomPrice, amount: transactionToEdit ? String(transactionToEdit.amount) : '' }
  ]);
  const [submitting, setSubmitting] = useState(false);

  const selectedService = services.find(s => s.name === formData.serviceName);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      if (formData.serviceName === 'Others') {
        if (transactionToEdit) {
          const test = customTests[0];
          const res = await fetch(`/api/admin/referrals/transactions/${transactionToEdit.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ referrerId: referrer.id, patientName: formData.patientName, patientPhone: formData.patientPhone, referralDate: formData.referralDate, serviceName: test.name, customServicePrice: test.price, amount: test.amount, status: formData.status, comments: formData.comments })
          });
          if (!res.ok) throw new Error((await res.json()).error || 'Failed to update');
        } else {
          for (const test of customTests) {
            const res = await fetch('/api/admin/referrals/transactions', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ referrerId: referrer.id, patientName: formData.patientName, patientPhone: formData.patientPhone, referralDate: formData.referralDate, serviceName: test.name, customServicePrice: test.price, amount: test.amount, comments: formData.comments })
            });
            if (!res.ok) throw new Error((await res.json()).error || 'Failed to save');
          }
        }
      } else {
        const bodyPayload = { referrerId: referrer.id, ...formData, serviceName: formData.serviceName };
        const res = transactionToEdit 
          ? await fetch(`/api/admin/referrals/transactions/${transactionToEdit.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(bodyPayload) })
          : await fetch('/api/admin/referrals/transactions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(bodyPayload) });
        if (!res.ok) throw new Error((await res.json()).error || 'Failed to save');
      }
      
      onSaved();
      onClose();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to save transaction(s)');
    }
    setSubmitting(false);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px', animation: 'fadeIn 0.2s ease-out' }}>
      <div style={{ background: 'white', padding: '32px', borderRadius: '16px', width: '100%', maxWidth: '650px', color: '#0f172a', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
        <h2 style={{ margin: '0 0 8px 0', fontSize: '22px', fontWeight: 800, color: '#1e293b', letterSpacing: '-0.02em' }}>{transactionToEdit ? 'Edit Referral' : 'Add Referral'} for <span style={{ color: '#2563eb' }}>{referrer.name}</span></h2>
        <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: '#64748b', lineHeight: 1.5 }}>{transactionToEdit ? 'Update the details for this patient referral below.' : 'Log a new patient referral and automatically calculate the referrer\'s cut.'}</p>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Patient Name</label>
            <input type="text" value={formData.patientName || ''} onChange={e => setFormData({...formData, patientName: e.target.value})} required placeholder="e.g. Ramesh Kumar" style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', fontSize: '15px', color: '#0f172a', outline: 'none', transition: 'border-color 0.2s' }} onFocus={e => e.target.style.borderColor = '#3b82f6'} onBlur={e => e.target.style.borderColor = '#cbd5e1'} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Patient Phone</label>
              <input type="text" value={formData.patientPhone || ''} onChange={e => setFormData({...formData, patientPhone: e.target.value})} required placeholder="e.g. 9876543210" style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', fontSize: '15px', color: '#0f172a', outline: 'none', transition: 'border-color 0.2s' }} onFocus={e => e.target.style.borderColor = '#3b82f6'} onBlur={e => e.target.style.borderColor = '#cbd5e1'} />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Service / Package Name</label>
            <select value={formData.serviceName} onChange={e => setFormData({...formData, serviceName: e.target.value})} required style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', fontSize: '15px', color: '#0f172a', outline: 'none', cursor: 'pointer', transition: 'border-color 0.2s' }} onFocus={e => e.target.style.borderColor = '#3b82f6'} onBlur={e => e.target.style.borderColor = '#cbd5e1'}>
              <option value="" disabled>Select a Service / Package...</option>
              {services.map(s => (
                <option key={s.id} value={s.name}>{s.type}: {s.name}</option>
              ))}
            </select>
          </div>
          
          {formData.serviceName === 'Others' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: 'linear-gradient(to right bottom, #f8fafc, #f1f5f9)', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.03)' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#1e293b' }}>Custom Tests Breakdown</h3>
              {customTests.map((test, index) => (
                <div key={index} style={{ display: 'flex', gap: '16px', paddingBottom: '16px', borderBottom: index < customTests.length - 1 ? '1px dashed #cbd5e1' : 'none', alignItems: 'flex-start' }}>
                  <div style={{ flex: 2 }}>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Test Name</label>
                    <input type="text" value={test.name} onChange={e => { const newTests = [...customTests]; newTests[index].name = e.target.value; setCustomTests(newTests); }} required placeholder="e.g. Blood Test" style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }} onFocus={e => e.target.style.borderColor = '#3b82f6'} onBlur={e => e.target.style.borderColor = '#cbd5e1'} />
                  </div>
                  <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Price (₹)</label>
                      <input type="number" min="0" value={test.price} onChange={e => { const newTests = [...customTests]; newTests[index].price = e.target.value; setCustomTests(newTests); }} required placeholder="1000" style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }} onFocus={e => e.target.style.borderColor = '#3b82f6'} onBlur={e => e.target.style.borderColor = '#cbd5e1'} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Referrer Cut (₹)</label>
                      <input type="number" min="0" value={test.amount} onChange={e => { const newTests = [...customTests]; newTests[index].amount = e.target.value; setCustomTests(newTests); }} required placeholder="500" style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }} onFocus={e => e.target.style.borderColor = '#3b82f6'} onBlur={e => e.target.style.borderColor = '#cbd5e1'} />
                    </div>
                  {!transactionToEdit && customTests.length > 1 && (
                    <div style={{ paddingTop: '26px' }}>
                      <button type="button" onClick={() => setCustomTests(customTests.filter((_, i) => i !== index))} style={{ padding: '9px 12px', borderRadius: '4px', border: 'none', color: '#ef4444', background: '#fee2e2', fontSize: '12px', fontWeight: 700, cursor: 'pointer', transition: 'background 0.2s', height: '40px' }} onMouseOver={e => e.currentTarget.style.background = '#fecaca'} onMouseOut={e => e.currentTarget.style.background = '#fee2e2'}>Remove</button>
                    </div>
                  )}
                </div>
              ))}
              {!transactionToEdit && (
                <button type="button" onClick={() => setCustomTests([...customTests, { name: '', price: '', amount: '' }])} style={{ padding: '10px', borderRadius: '8px', border: '1px dashed #3b82f6', color: '#3b82f6', background: 'rgba(59, 130, 246, 0.05)', cursor: 'pointer', fontWeight: 700, fontSize: '13px', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)'} onMouseOut={e => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.05)'}>+ Add Another Test</button>
              )}
            </div>
          )}

          {selectedService && formData.serviceName !== 'Others' && (
            <div style={{ background: '#f0fdf4', padding: '16px', borderRadius: '12px', fontSize: '14px', color: '#166534', border: '1px solid #bbf7d0', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: 600 }}>Plan Type:</span> <span style={{ fontWeight: 700 }}>{selectedService.type}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: 600 }}>MRP Price:</span> <span style={{ fontWeight: 700 }}>₹{selectedService.originalPrice || selectedService.price}</span>
              </div>
              {selectedService.discount && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#059669' }}>
                  <span style={{ fontWeight: 600 }}>Patient Discount:</span> <span style={{ fontWeight: 700 }}>{selectedService.discount}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, color: '#14532d', borderTop: '1px solid #bbf7d0', paddingTop: '10px', marginTop: '4px', fontSize: '16px' }}>
                <span>Final Price:</span> <span>₹{selectedService.price}</span>
              </div>
            </div>
          )}
          <div style={{ display: 'flex', gap: '16px' }}>
            {formData.serviceName !== 'Others' && (
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Amount to give to Referrer (₹)</label>
                <input type="number" min="0" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} required placeholder="e.g. 500" style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', fontSize: '15px', color: '#0f172a', outline: 'none', transition: 'border-color 0.2s' }} onFocus={e => e.target.style.borderColor = '#3b82f6'} onBlur={e => e.target.style.borderColor = '#cbd5e1'} />
              </div>
            )}
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Referral Date</label>
              <input type="date" value={formData.referralDate} onChange={e => setFormData({...formData, referralDate: e.target.value})} required style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', fontSize: '15px', color: '#0f172a', outline: 'none', transition: 'border-color 0.2s' }} onFocus={e => e.target.style.borderColor = '#3b82f6'} onBlur={e => e.target.style.borderColor = '#cbd5e1'} />
            </div>
            {transactionToEdit && formData.serviceName === 'Others' && (
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</label>
                <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', fontSize: '15px', color: '#0f172a', outline: 'none', cursor: 'pointer', transition: 'border-color 0.2s' }} onFocus={e => e.target.style.borderColor = '#3b82f6'} onBlur={e => e.target.style.borderColor = '#cbd5e1'}>
                  <option value="PENDING">Pending</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            )}
          </div>

          {transactionToEdit && formData.serviceName !== 'Others' && (
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</label>
              <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', fontSize: '15px', color: '#0f172a', outline: 'none', cursor: 'pointer', transition: 'border-color 0.2s' }} onFocus={e => e.target.style.borderColor = '#3b82f6'} onBlur={e => e.target.style.borderColor = '#cbd5e1'}>
                <option value="PENDING">Pending</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          )}

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Comments (Optional)</label>
            <textarea value={formData.comments} onChange={e => setFormData({...formData, comments: e.target.value})} placeholder="Any additional notes..." style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', fontSize: '15px', color: '#0f172a', outline: 'none', minHeight: '80px', fontFamily: 'inherit', resize: 'vertical', transition: 'border-color 0.2s' }} onFocus={e => e.target.style.borderColor = '#3b82f6'} onBlur={e => e.target.style.borderColor = '#cbd5e1'} />
          </div>
          
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
            <button type="button" onClick={onClose} style={{ padding: '12px 24px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', color: '#475569', cursor: 'pointer', fontWeight: 600, fontSize: '14px', transition: 'all 0.2s' }} onMouseOver={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = '#0f172a'; }} onMouseOut={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#475569'; }}>Cancel</button>
            <button type="submit" disabled={submitting} style={{ padding: '12px 24px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', cursor: submitting ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '14px', boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.3)', opacity: submitting ? 0.7 : 1, transition: 'all 0.2s' }} onMouseOver={e => { if (!submitting) e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 8px -2px rgba(16, 185, 129, 0.4)'; }} onMouseOut={e => { if (!submitting) e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(16, 185, 129, 0.3)'; }}>
              {submitting ? 'Saving...' : (transactionToEdit ? 'Save Changes' : 'Add Referral')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function HistoryModal({ referrer, onClose, onRefresh, onEdit }: { referrer: any, onClose: () => void, onRefresh: () => void, onEdit: (tx: any) => void }) {
  const [updating, setUpdating] = useState<string | null>(null);

  const defaultFirstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
  const defaultLastDay = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0];
  const [fromDate, setFromDate] = useState(defaultFirstDay);
  const [toDate, setToDate] = useState(defaultLastDay);

  const handleDownloadStatement = () => {
    const start = new Date(fromDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(toDate);
    end.setHours(23, 59, 59, 999);

    const filtered = (referrer.transactions || []).filter((tx: any) => {
      const txDate = new Date(tx.createdAt);
      return txDate >= start && txDate <= end;
    });

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Date,Patient Name,Patient Phone,Service,Amount,Status,Comments\n";

    if (filtered.length === 0) {
      csvContent += `No data found between ${fromDate} and ${toDate},,,,,,\n`;
    } else {
      filtered.forEach((tx: any) => {
        const txDate = new Date(tx.createdAt).toLocaleDateString();
        const patientName = `"${(tx.patientName || '').replace(/"/g, '""')}"`;
        const patientPhone = `"${(tx.patientPhone || '').replace(/"/g, '""')}"`;
        const service = `"${(tx.serviceName || '').replace(/"/g, '""')}"`;
        const amount = tx.amount || 0;
        const status = tx.status || 'PENDING';
        const comments = `"${(tx.comments || '').replace(/"/g, '""')}"`;
        
        csvContent += `${txDate},${patientName},${patientPhone},${service},${amount},${status},${comments}\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${referrer.name.replace(/\s+/g, '_')}_statement_${fromDate}_to_${toDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleStatusChange = async (txId: string, newStatus: string) => {
    setUpdating(txId);
    try {
      const res = await fetch(`/api/admin/referrals/transactions/${txId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        onRefresh();
      } else {
        alert('Failed to update status');
      }
    } catch (err) {
      console.error(err);
    }
    setUpdating(null);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
      <div style={{ background: 'white', padding: '24px', borderRadius: '12px', width: '100%', maxWidth: '800px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', color: '#0f172a' }}>
        <h2 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>Referral History: {referrer.name}</h2>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', marginBottom: '16px', background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>From Date</label>
            <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>To Date</label>
            <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }} />
          </div>
          <button onClick={handleDownloadStatement} style={{ padding: '9px 16px', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Download Statement
          </button>
        </div>

        <div style={{ overflowY: 'auto', flex: 1, border: '1px solid #e2e8f0', borderRadius: '8px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: '#f8fafc' }}>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '12px', fontSize: '13px', color: '#64748b' }}>Date</th>
                <th style={{ padding: '12px', fontSize: '13px', color: '#64748b' }}>Patient</th>
                <th style={{ padding: '12px', fontSize: '13px', color: '#64748b' }}>Service</th>
                <th style={{ padding: '12px', fontSize: '13px', color: '#64748b' }}>Amount</th>
                <th style={{ padding: '12px', fontSize: '13px', color: '#64748b' }}>Status</th>
                <th style={{ padding: '12px', fontSize: '13px', color: '#64748b' }}>Comments</th>
                <th style={{ padding: '12px', fontSize: '13px', color: '#64748b', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {referrer.transactions && referrer.transactions.length > 0 ? referrer.transactions.map((tx: any) => (
                <tr key={tx.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px', fontSize: '14px', color: '#334155' }}>
                    {new Date(tx.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '12px', fontSize: '14px', color: '#0f172a', fontWeight: 500 }}>
                    <div>{tx.patientName || 'N/A'}</div>
                    {tx.patientPhone && <div style={{ fontSize: '12px', color: '#64748b' }}>{tx.patientPhone}</div>}
                  </td>
                  <td style={{ padding: '12px', fontSize: '14px', color: '#334155' }}>{tx.serviceName}</td>
                  <td style={{ padding: '12px', fontSize: '14px', color: '#059669', fontWeight: 600 }}>₹{tx.amount?.toFixed(2) || '0.00'}</td>
                  <td style={{ padding: '12px' }}>
                    <select 
                      value={tx.status || 'PENDING'} 
                      onChange={(e) => handleStatusChange(tx.id, e.target.value)}
                      disabled={updating === tx.id}
                      style={{ 
                        padding: '6px', 
                        borderRadius: '6px', 
                        border: '1px solid #cbd5e1', 
                        fontSize: '13px',
                        background: tx.status === 'COMPLETED' ? '#dcfce7' : tx.status === 'CANCELLED' ? '#fee2e2' : '#fef9c3',
                        color: tx.status === 'COMPLETED' ? '#166534' : tx.status === 'CANCELLED' ? '#991b1b' : '#854d0e',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      <option value="PENDING">Pending</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </td>
                  <td style={{ padding: '12px', fontSize: '13px', color: '#64748b', maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={tx.comments}>
                    {tx.comments || '-'}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    <button onClick={() => onEdit(tx)} style={{ padding: '6px 12px', fontSize: '12px', background: '#f8fafc', color: '#2563eb', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>Edit</button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
                    No transactions found for this referrer.
                  </td>
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
