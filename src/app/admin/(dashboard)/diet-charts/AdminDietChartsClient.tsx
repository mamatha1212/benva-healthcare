'use client';

import React, { useState, useEffect } from 'react';
import { formatDate } from '@/lib/dateUtils';
import { DietPlanData } from '@/lib/dietTemplates';

export default function AdminDietChartsClient({ initialDietCharts }: { initialDietCharts: any[] }) {
  const [dietCharts, setDietCharts] = useState(initialDietCharts);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SUBMITTED' | 'DRAFT'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingFile, setViewingFile] = useState<{ parsedData: DietPlanData, fileInfo: any } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  const fetchDietCharts = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/admin/diet-charts', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setDietCharts(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsRefreshing(false);
    }
  };

  const filteredCharts = dietCharts.filter(c => {
    const matchesSearch =
      c.patient?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.patient?.uhid?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.patient?.consultant?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.fileName?.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (statusFilter === 'SUBMITTED') return c.status === 'SUBMITTED';
    if (statusFilter === 'DRAFT') return c.status !== 'SUBMITTED';
    return true;
  });

  const submittedCount = dietCharts.filter(c => c.status === 'SUBMITTED').length;
  const draftCount = dietCharts.filter(c => c.status !== 'SUBMITTED').length;

  const handleOpenView = (file: any) => {
    if (file.fileUrl && file.fileUrl.startsWith('data:')) {
      try {
        const base64Data = file.fileUrl.split(',')[1];
        const decodedText = atob(base64Data);
        const parsed = JSON.parse(decodedText);
        setViewingFile({ parsedData: parsed, fileInfo: file });
      } catch (e) {
        window.open(file.fileUrl, '_blank');
      }
    } else {
      window.open(file.fileUrl, '_blank');
    }
  };

  const handleMarkSubmitted = async (fileId: string) => {
    setSubmittingId(fileId);
    try {
      const res = await fetch(`/api/admin/diet-charts/${fileId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'SUBMITTED' })
      });
      if (res.ok) {
        setDietCharts(prev => prev.map(c => c.id === fileId ? { ...c, status: 'SUBMITTED' } : c));
      } else {
        alert('Failed to update status');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating status');
    } finally {
      setSubmittingId(null);
    }
  };

  const handleDelete = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this diet chart?')) return;
    try {
      const res = await fetch(`/api/admin/diet-charts/${fileId}`, { method: 'DELETE' });
      if (res.ok) {
        setDietCharts(prev => prev.filter(c => c.id !== fileId));
      } else {
        alert('Failed to delete diet chart');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting diet chart');
    }
  };

  const formatDietitianName = (name?: string) => {
    if (!name) return 'Dietitian';
    const clean = name.trim();
    if (clean.toLowerCase().startsWith('dt.') || clean.toLowerCase().startsWith('dt ')) {
      return clean;
    }
    return `Dt. ${clean}`;
  };

  return (
    <div>
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .admin-diet-print-modal, .admin-diet-print-modal * {
            visibility: visible;
          }
          .admin-diet-print-modal {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
          }
          .no-print {
            display: none !important;
          }
          .page-break {
            page-break-before: always;
            break-before: page;
          }
        }
      `}</style>

      {/* TOP HEADER */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
            Diet Charts
          </h1>
          <p style={{ color: '#64748b', margin: 0, fontSize: '15px' }}>
            Review, inspect, print, and manage nutrition charts submitted by Consulting Dietitians.
          </p>
        </div>

        <button
          onClick={fetchDietCharts}
          disabled={isRefreshing}
          style={{
            padding: '9px 16px',
            background: 'white',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            fontWeight: 600,
            fontSize: '13px',
            color: '#334155',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <span>↻</span> {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* METRIC CARDS */}
      <div className="no-print" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Total Diet Charts</span>
          <div style={{ fontSize: '32px', fontWeight: 900, color: '#0f172a', marginTop: '4px' }}>{dietCharts.length}</div>
        </div>

        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #86efac', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#15803d', textTransform: 'uppercase' }}>Submitted to Admin</span>
          <div style={{ fontSize: '32px', fontWeight: 900, color: '#16a34a', marginTop: '4px' }}>{submittedCount}</div>
        </div>

        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #fde047', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#854d0e', textTransform: 'uppercase' }}>Drafts</span>
          <div style={{ fontSize: '32px', fontWeight: 900, color: '#d97706', marginTop: '4px' }}>{draftCount}</div>
        </div>
      </div>

      {/* FILTER & SEARCH */}
      <div className="no-print" style={{ background: 'white', borderRadius: '12px', padding: '16px 20px', border: '1px solid #e2e8f0', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ flex: '1 1 300px', maxWidth: '420px' }}>
          <input
            type="text"
            placeholder="Search by patient name, UHID, or dietitian..."
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
      <div className="no-print" style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '16px' }}>Patient Details</th>
                <th style={{ padding: '16px' }}>Dietitian</th>
                <th style={{ padding: '16px' }}>Chart File</th>
                <th style={{ padding: '16px' }}>Status</th>
                <th style={{ padding: '16px' }}>Date</th>
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
                    <div style={{ fontWeight: 600, color: '#15803d', fontSize: '14px' }}>
                      {formatDietitianName(chart.patient?.consultant)}
                    </div>
                    {chart.doctorProfile?.speciality && (
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{chart.doctorProfile.speciality}</div>
                    )}
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '13px' }}>{chart.fileName}</div>
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
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', alignItems: 'center' }}>
                      {chart.status !== 'SUBMITTED' && (
                        <button
                          type="button"
                          onClick={() => handleMarkSubmitted(chart.id)}
                          disabled={submittingId === chart.id}
                          style={{ padding: '6px 12px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                        >
                          {submittingId === chart.id ? 'Saving...' : 'Mark Submitted'}
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleOpenView(chart)}
                        style={{ padding: '6px 12px', background: '#0284c7', color: 'white', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                      >
                        View / Print
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(chart.id)}
                        style={{ padding: '6px 10px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredCharts.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: '48px 16px', textAlign: 'center', color: '#64748b' }}>
                    <div style={{ fontSize: '16px', fontWeight: 600, color: '#0f172a', marginBottom: '4px' }}>No Diet Charts Found</div>
                    <p style={{ margin: 0, fontSize: '13px' }}>
                      {searchTerm ? 'No charts matched your search.' : 'Dietitians will submit diet charts here from their portal.'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FULL PRINT VIEW MODAL */}
      {viewingFile && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '16px' }}>
          <div style={{ background: 'white', borderRadius: '12px', width: '100%', maxWidth: '950px', maxHeight: '94vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            
            {/* Modal Top Bar */}
            <div className="no-print" style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
                  {viewingFile.parsedData.title || 'Personalised Diet Chart'}
                </h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                  Patient: {viewingFile.fileInfo?.patient?.name} • UHID: {viewingFile.fileInfo?.patient?.uhid || 'BENVA000123'} • {formatDate(viewingFile.fileInfo?.createdAt)}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => window.print()}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: 'none',
                    background: '#0f172a',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                  Print / Save PDF
                </button>

                <button
                  type="button"
                  onClick={() => setViewingFile(null)}
                  style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#e2e8f0', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', fontWeight: 'bold' }}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Scrollable Printable Document Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '32px', background: '#f1f5f9' }}>
              <div
                className="admin-diet-print-modal"
                style={{
                  background: 'white',
                  maxWidth: '820px',
                  margin: '0 auto',
                  padding: '36px',
                  borderRadius: '8px',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.06)',
                  color: '#1e293b'
                }}
              >
                {/* LOGO */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                  <img
                    src="/images/Benva%20NEW.png"
                    alt="BENVA HEALTH CARE"
                    style={{ height: '48px', width: 'auto', objectFit: 'contain' }}
                  />
                </div>

                {/* BLUE TITLE BLOCK */}
                <div style={{ background: '#1e3a8a', color: 'white', textAlign: 'center', padding: '14px 20px', borderRadius: '4px', marginBottom: '16px' }}>
                  <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, letterSpacing: '1px' }}>
                    {viewingFile.parsedData.title}
                  </h2>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#93c5fd', fontWeight: 500 }}>
                    {viewingFile.parsedData.subtitle || 'Personalised Nutrition Chart'}
                  </p>
                </div>

                {/* PATIENT DETAILS TABLE */}
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #e2e8f0', fontSize: '12px', fontWeight: 700, color: '#64748b' }}>
                      <td style={{ padding: '8px 12px', width: '25%' }}>PATIENT NAME</td>
                      <td style={{ padding: '8px 12px', width: '25%' }}>UHID</td>
                      <td style={{ padding: '8px 12px', width: '25%' }}>AGE</td>
                      <td style={{ padding: '8px 12px', width: '25%' }}>DIETITIAN</td>
                    </tr>
                    <tr style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                      <td style={{ padding: '8px 12px' }}>{viewingFile.fileInfo?.patient?.name || 'N/A'}</td>
                      <td style={{ padding: '8px 12px' }}>{viewingFile.fileInfo?.patient?.uhid || 'BENVA000123'}</td>
                      <td style={{ padding: '8px 12px' }}>{viewingFile.fileInfo?.patient?.age ? `${viewingFile.fileInfo.patient.age} Years` : '28 Years'}</td>
                      <td style={{ padding: '8px 12px' }}>{formatDietitianName(viewingFile.fileInfo?.patient?.consultant)}</td>
                    </tr>
                  </tbody>
                </table>

                {/* DAILY MEAL SCHEDULE */}
                {viewingFile.parsedData.meals && viewingFile.parsedData.meals.length > 0 && (
                  <div style={{ marginBottom: '24px' }}>
                    <div style={{ background: '#0284c7', color: 'white', padding: '8px 14px', fontSize: '13px', fontWeight: 800, letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '12px' }}>
                      DAILY MEAL SCHEDULE
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {viewingFile.parsedData.meals.map((meal) => (
                        <div
                          key={meal.id}
                          style={{
                            display: 'flex',
                            border: '1px solid #e2e8f0',
                            borderRadius: '4px',
                            overflow: 'hidden'
                          }}
                        >
                          <div
                            style={{
                              width: '180px',
                              background: '#0f4c81',
                              color: 'white',
                              padding: '12px 14px',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}
                          >
                            <span style={{ fontSize: '11px', color: '#93c5fd', fontWeight: 600 }}>{meal.time}</span>
                            <strong style={{ fontSize: '15px', marginTop: '2px' }}>{meal.name}</strong>
                          </div>

                          <div style={{ flex: 1, padding: '12px 16px', background: '#ffffff' }}>
                            <div style={{ fontSize: '13px', lineHeight: '1.6', color: '#1e293b', whiteSpace: 'pre-line' }}>
                              {meal.items}
                            </div>

                            {meal.serving && (
                              <div style={{ marginTop: '6px', fontSize: '12px', color: '#0284c7', fontWeight: 600 }}>
                                Serving: {meal.serving}
                              </div>
                            )}

                            {meal.note && (
                              <div style={{ marginTop: '6px', padding: '6px 10px', background: '#f8fafc', borderLeft: '3px solid #0284c7', fontSize: '12px', color: '#475569', fontStyle: 'italic', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                                <strong>Note:</strong>
                                <div style={{ marginTop: '2px' }}>{meal.note}</div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="page-break" style={{ height: '20px' }}></div>

                {/* FOODS TO BE INCLUDED */}
                {viewingFile.parsedData.foodsToInclude && viewingFile.parsedData.foodsToInclude.length > 0 && (
                  <div style={{ border: '1px solid #86efac', borderRadius: '4px', overflow: 'hidden', marginBottom: '16px' }}>
                    <div style={{ background: '#dcfce7', color: '#15803d', padding: '8px 14px', fontWeight: 800, fontSize: '13px' }}>
                      🍏 FOODS TO BE INCLUDED
                    </div>
                    <div style={{ padding: '12px 18px', background: 'white' }}>
                      <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', lineHeight: '1.7', color: '#1e293b' }}>
                        {viewingFile.parsedData.foodsToInclude.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* FOODS IN MODERATION */}
                {viewingFile.parsedData.foodsInModeration && viewingFile.parsedData.foodsInModeration.length > 0 && (
                  <div style={{ border: '1px solid #fde047', borderRadius: '4px', overflow: 'hidden', marginBottom: '16px' }}>
                    <div style={{ background: '#fef9c3', color: '#854d0e', padding: '8px 14px', fontWeight: 800, fontSize: '13px' }}>
                      ⚠️ FOODS TO BE CONSUMED IN MODERATION
                    </div>
                    <div style={{ padding: '12px 18px', background: 'white' }}>
                      <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', lineHeight: '1.7', color: '#1e293b' }}>
                        {viewingFile.parsedData.foodsInModeration.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* FOODS TO BE AVOIDED */}
                {viewingFile.parsedData.foodsToAvoid && viewingFile.parsedData.foodsToAvoid.length > 0 && (
                  <div style={{ border: '1px solid #fca5a5', borderRadius: '4px', overflow: 'hidden', marginBottom: '16px' }}>
                    <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '8px 14px', fontWeight: 800, fontSize: '13px' }}>
                      🚫 FOODS TO BE AVOIDED
                    </div>
                    <div style={{ padding: '12px 18px', background: 'white' }}>
                      <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', lineHeight: '1.7', color: '#1e293b' }}>
                        {viewingFile.parsedData.foodsToAvoid.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                <div className="page-break" style={{ height: '20px' }}></div>

                {/* DIETARY GUIDELINES */}
                {viewingFile.parsedData.dietaryGuidelines && viewingFile.parsedData.dietaryGuidelines.length > 0 && (
                  <div style={{ border: '1px solid #bae6fd', borderRadius: '4px', overflow: 'hidden', marginBottom: '16px' }}>
                    <div style={{ background: '#e0f2fe', color: '#0369a1', padding: '8px 14px', fontWeight: 800, fontSize: '13px' }}>
                      ℹ️ DIETARY & LIFESTYLE GUIDELINES
                    </div>
                    <div style={{ padding: '12px 18px', background: 'white' }}>
                      <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', lineHeight: '1.7', color: '#1e293b' }}>
                        {viewingFile.parsedData.dietaryGuidelines.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* FOLLOW UP */}
                {viewingFile.parsedData.followUp && (
                  <div style={{ border: '1px solid #cbd5e1', borderRadius: '4px', overflow: 'hidden', marginBottom: '24px' }}>
                    <div style={{ background: '#f1f5f9', color: '#334155', padding: '8px 14px', fontWeight: 800, fontSize: '13px' }}>
                      FOLLOW-UP
                    </div>
                    <div style={{ padding: '12px 18px', background: 'white', fontSize: '13px', color: '#1e293b', lineHeight: '1.6' }}>
                      {viewingFile.parsedData.followUp}
                    </div>
                  </div>
                )}

                {/* SIGNATURE BLOCK */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '32px', marginBottom: '20px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                      {formatDietitianName(viewingFile.fileInfo?.patient?.consultant)}
                    </div>
                    <div style={{ fontSize: '13px', color: '#475569' }}>Consulting Dietitian, BENVA Health Care</div>
                  </div>
                </div>

                {/* FOOTER */}
                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8' }}>
                  <span>Confidential Patient Document</span>
                  <span style={{ fontWeight: 600 }}>BENVA HEALTH CARE</span>
                  <span>Personalised Nutrition Care</span>
                </div>

              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

