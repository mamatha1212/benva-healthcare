'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatDate } from '@/lib/dateUtils';

export default function DoctorDietChartsClient({
  initialDietCharts,
  doctorName
}: {
  initialDietCharts: any[];
  doctorName: string;
}) {
  const [dietCharts, setDietCharts] = useState(initialDietCharts);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SUBMITTED' | 'DRAFT'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  const filteredCharts = dietCharts.filter(chart => {
    const matchesSearch =
      chart.patient?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chart.patient?.uhid?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chart.fileName?.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (statusFilter === 'SUBMITTED') return chart.status === 'SUBMITTED';
    if (statusFilter === 'DRAFT') return chart.status !== 'SUBMITTED';
    return true;
  });

  const submittedCount = dietCharts.filter(c => c.status === 'SUBMITTED').length;
  const draftCount = dietCharts.filter(c => c.status !== 'SUBMITTED').length;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
            Diet Charts
          </h1>
          <p style={{ color: '#64748b', margin: 0, fontSize: '15px' }}>
            Manage, edit, print, and submit clinical nutrition & meal charts for your clients.
          </p>
        </div>

        <Link
          href="/doctor/patients"
          style={{
            background: '#059669',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 2px 4px rgba(5,150,105,0.25)'
          }}
        >
          <span>+ Create New Diet Chart</span>
        </Link>
      </div>

      {/* METRIC CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Total Charts</span>
          <div style={{ fontSize: '32px', fontWeight: 900, color: '#0f172a', marginTop: '4px' }}>{dietCharts.length}</div>
        </div>

        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#047857', textTransform: 'uppercase' }}>Submitted to Admin</span>
          <div style={{ fontSize: '32px', fontWeight: 900, color: '#059669', marginTop: '4px' }}>{submittedCount}</div>
        </div>

        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#b45309', textTransform: 'uppercase' }}>Saved Drafts</span>
          <div style={{ fontSize: '32px', fontWeight: 900, color: '#d97706', marginTop: '4px' }}>{draftCount}</div>
        </div>
      </div>

      {/* SEARCH & FILTERS */}
      <div style={{ background: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ flex: '1 1 300px', maxWidth: '450px' }}>
          <input
            type="text"
            placeholder="Search by patient name, UHID, or chart name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {(['ALL', 'SUBMITTED', 'DRAFT'] as const).map(tab => (
            <button
              key={tab}
              type="button"
              onClick={() => setStatusFilter(tab)}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: statusFilter === tab ? '1px solid #059669' : '1px solid #e2e8f0',
                background: statusFilter === tab ? '#ecfdf5' : 'white',
                color: statusFilter === tab ? '#065f46' : '#64748b',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              {tab === 'ALL' ? 'All Charts' : tab === 'SUBMITTED' ? 'Submitted' : 'Drafts'}
            </button>
          ))}
        </div>
      </div>

      {/* TABLE */}
      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '16px' }}>Patient / Client</th>
                <th style={{ padding: '16px' }}>Chart Name</th>
                <th style={{ padding: '16px' }}>Status</th>
                <th style={{ padding: '16px' }}>Created Date</th>
                <th style={{ padding: '16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCharts.map((chart) => (
                <tr key={chart.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{chart.patient?.name || 'Unknown Patient'}</div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                      UHID: {chart.patient?.uhid || 'N/A'} • {chart.patient?.phone || ''}
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '14px' }}>{chart.fileName}</div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    {chart.status === 'SUBMITTED' ? (
                      <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 700, background: '#dcfce7', color: '#15803d' }}>
                        Submitted
                      </span>
                    ) : (
                      <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 700, background: '#fef3c7', color: '#92400e' }}>
                        Draft
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '16px', color: '#64748b', fontSize: '13px' }}>
                    {formatDate(chart.createdAt, 'N/A')}
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <Link
                        href={`/doctor/patients/${chart.patientId}/diet-chart?fileId=${chart.id}&view=true`}
                        style={{ padding: '6px 12px', background: '#e0f2fe', color: '#0369a1', borderRadius: '6px', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}
                      >
                        Print / View
                      </Link>

                      {chart.status !== 'SUBMITTED' && (
                        <Link
                          href={`/doctor/patients/${chart.patientId}/diet-chart?fileId=${chart.id}`}
                          style={{ padding: '6px 12px', background: '#f1f5f9', color: '#334155', borderRadius: '6px', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}
                        >
                          Edit
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {filteredCharts.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: '48px 16px', textAlign: 'center', color: '#64748b' }}>
                    <div style={{ fontSize: '16px', fontWeight: 600, color: '#0f172a', marginBottom: '4px' }}>No Diet Charts Found</div>
                    <p style={{ margin: 0, fontSize: '13px' }}>
                      {searchTerm ? 'No charts matched your search query.' : 'Click "+ Create New Diet Chart" to prepare your first client meal chart.'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

