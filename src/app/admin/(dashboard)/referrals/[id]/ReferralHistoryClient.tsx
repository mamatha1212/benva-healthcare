'use client';

import React, { useState } from 'react';
import { TransactionModal } from '../ReferralsClient';

export default function ReferralHistoryClient({ initialReferrer, services }: { initialReferrer: any, services: any[] }) {
  const [referrer, setReferrer] = useState(initialReferrer);
  const [updating, setUpdating] = useState<string | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);

  const defaultFirstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
  const defaultLastDay = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0];
  const [fromDate, setFromDate] = useState(defaultFirstDay);
  const [toDate, setToDate] = useState(defaultLastDay);

  const fetchReferrer = async () => {
    try {
      const res = await fetch(`/api/admin/referrals/${referrer.id}`);
      if (res.ok) {
        const data = await res.json();
        setReferrer(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

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
        fetchReferrer();
      } else {
        alert('Failed to update status');
      }
    } catch (err) {
      console.error(err);
    }
    setUpdating(null);
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', marginBottom: '24px', background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', flexWrap: 'wrap' }}>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>From Date</label>
          <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', color: '#0f172a' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>To Date</label>
          <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', color: '#0f172a' }} />
        </div>
        <button onClick={handleDownloadStatement} style={{ padding: '10px 20px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          Download Statement
        </button>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflowX: 'auto' }}>
        <table style={{ width: '100%', minWidth: '800px', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: '#f8fafc' }}>
            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '16px', fontSize: '13px', color: '#64748b' }}>Date</th>
              <th style={{ padding: '16px', fontSize: '13px', color: '#64748b' }}>Patient</th>
              <th style={{ padding: '16px', fontSize: '13px', color: '#64748b' }}>Service</th>
              <th style={{ padding: '16px', fontSize: '13px', color: '#64748b' }}>Amount</th>
              <th style={{ padding: '16px', fontSize: '13px', color: '#64748b' }}>Status</th>
              <th style={{ padding: '16px', fontSize: '13px', color: '#64748b' }}>Comments</th>
              <th style={{ padding: '16px', fontSize: '13px', color: '#64748b', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {referrer.transactions && referrer.transactions.length > 0 ? referrer.transactions.map((tx: any) => (
              <tr key={tx.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '16px', fontSize: '14px', color: '#334155' }}>
                  {new Date(tx.createdAt).toLocaleDateString()}
                </td>
                <td style={{ padding: '16px', fontSize: '14px', color: '#0f172a', fontWeight: 500 }}>
                  <div>{tx.patientName || 'N/A'}</div>
                  {tx.patientPhone && <div style={{ fontSize: '12px', color: '#64748b' }}>{tx.patientPhone}</div>}
                </td>
                <td style={{ padding: '16px', fontSize: '14px', color: '#334155' }}>{tx.serviceName}</td>
                <td style={{ padding: '16px', fontSize: '14px', color: '#059669', fontWeight: 600 }}>₹{tx.amount?.toFixed(2) || '0.00'}</td>
                <td style={{ padding: '16px' }}>
                  <select 
                    value={tx.status || 'PENDING'} 
                    onChange={(e) => handleStatusChange(tx.id, e.target.value)}
                    disabled={updating === tx.id}
                    style={{ 
                      padding: '8px', 
                      borderRadius: '8px', 
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
                <td style={{ padding: '16px', fontSize: '13px', color: '#64748b', maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={tx.comments}>
                  {tx.comments || '-'}
                </td>
                <td style={{ padding: '16px', textAlign: 'right' }}>
                  <button onClick={() => setEditingTransaction(tx)} style={{ padding: '8px 16px', fontSize: '13px', background: '#f8fafc', color: '#2563eb', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Edit</button>
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

      {editingTransaction && (
        <TransactionModal 
          referrer={referrer} 
          services={services} 
          transactionToEdit={editingTransaction} 
          onClose={() => setEditingTransaction(null)} 
          onSaved={fetchReferrer} 
        />
      )}
    </div>
  );
}
