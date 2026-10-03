'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ReferrerDashboardClient() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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

  if (loading) return <div style={{ padding: '48px', textAlign: 'center' }}>Loading dashboard...</div>;
  if (!data) return <div style={{ padding: '48px', textAlign: 'center' }}>Failed to load dashboard.</div>;

  const totalEarnings = data.transactions?.reduce((sum: number, tx: any) => sum + (tx.amount || 0), 0) || 0;

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
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#0f172a' }}>Referral History</h2>
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
                      <span style={{ background: '#dcfce7', color: '#166534', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 600 }}>
                        Completed
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
