'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ReferrerDashboardClient() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const defaultFirstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
  const defaultLastDay = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0];
  const [fromDate, setFromDate] = useState(defaultFirstDay);
  const [toDate, setToDate] = useState(defaultLastDay);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/referrer/dashboard');
      if (res.status === 401) {
        router.push('/referral-login');
        return;
      }
      const json = await res.json();
      setData(json);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/referrer/logout', { method: 'POST' });
    router.push('/referral-login');
  };

  const handleDownloadStatement = () => {
    if (!data || !data.transactions) return;
    
    const start = new Date(fromDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(toDate);
    end.setHours(23, 59, 59, 999);

    const filtered = data.transactions.filter((tx: any) => {
      const txDate = new Date(tx.createdAt);
      return txDate >= start && txDate <= end;
    });

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Date,Patient Name,Service,Amount Earned,Status\n";

    if (filtered.length === 0) {
      csvContent += `There is no data for the period between ${fromDate} and ${toDate},,,,\n`;
    } else {
      filtered.forEach((tx: any) => {
        const txDate = new Date(tx.createdAt).toLocaleDateString();
        const patientName = `"${(tx.patientName || '').replace(/"/g, '""')}"`;
        const service = `"${(tx.serviceName || '').replace(/"/g, '""')}"`;
        const amount = tx.amount || 0;
        const status = tx.status || 'PENDING';
        
        csvContent += `${txDate},${patientName},${service},${amount},${status}\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Statement_${fromDate}_to_${toDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div style={{ padding: '48px', textAlign: 'center' }}>Loading dashboard...</div>;
  if (!data) return <div style={{ padding: '48px', textAlign: 'center' }}>Failed to load dashboard.</div>;

  const totalEarnings = data.transactions?.filter((tx:any) => tx.status === 'COMPLETED').reduce((sum: number, tx: any) => sum + (tx.amount || 0), 0) || 0;

  return (
    <div>
      <header style={{ background: 'white', padding: '16px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>Welcome, {data.name}</h1>
        <button onClick={handleLogout} style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, color: '#334155' }}>
          Logout
        </button>
      </header>

      <main style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '32px' }}>
          <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#64748b' }}>Total Referrals</h3>
            <div style={{ fontSize: '32px', fontWeight: 700, color: '#0f172a' }}>{data.transactions?.length || 0}</div>
          </div>
          <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#64748b' }}>Total Earnings</h3>
            <div style={{ fontSize: '32px', fontWeight: 700, color: '#059669' }}>₹{totalEarnings.toFixed(2)}</div>
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>Referral History</h2>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>From Date</label>
                <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', background: '#f8fafc' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>To Date</label>
                <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', background: '#f8fafc' }} />
              </div>
              <button onClick={handleDownloadStatement} style={{ padding: '9px 16px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = '#1d4ed8'} onMouseOut={e => e.currentTarget.style.background = '#2563eb'}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                Download Statement
              </button>
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
              <thead>
                <tr>
                  <th style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0', fontSize: '13px', color: '#64748b', fontWeight: 600 }}>Date</th>
                  <th style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0', fontSize: '13px', color: '#64748b', fontWeight: 600 }}>Patient</th>
                  <th style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0', fontSize: '13px', color: '#64748b', fontWeight: 600 }}>Service</th>
                  <th style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0', fontSize: '13px', color: '#64748b', fontWeight: 600 }}>Amount Earned</th>
                  <th style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0', fontSize: '13px', color: '#64748b', fontWeight: 600 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.transactions && data.transactions.length > 0 ? data.transactions.map((tx: any) => (
                  <tr key={tx.id}>
                    <td style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0', color: '#334155', fontSize: '14px' }}>
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0', color: '#0f172a', fontWeight: 500, fontSize: '14px' }}>
                      {tx.patientName || 'N/A'}
                    </td>
                    <td style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0', color: '#334155', fontSize: '14px' }}>
                      {tx.serviceName || 'Unknown Service'}
                    </td>
                    <td style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0', color: '#059669', fontWeight: 600, fontSize: '14px' }}>
                      +₹{tx.amount?.toFixed(2) || '0.00'}
                    </td>
                    <td style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0' }}>
                      <span style={{ 
                        background: tx.status === 'COMPLETED' ? '#dcfce7' : tx.status === 'CANCELLED' ? '#fee2e2' : '#fef9c3', 
                        color: tx.status === 'COMPLETED' ? '#166534' : tx.status === 'CANCELLED' ? '#991b1b' : '#854d0e', 
                        padding: '4px 10px', 
                        borderRadius: '12px', 
                        fontSize: '12px', 
                        fontWeight: 600 
                      }}>
                        {tx.status ? tx.status.charAt(0) + tx.status.slice(1).toLowerCase() : 'Pending'}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
                      No referrals logged yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
