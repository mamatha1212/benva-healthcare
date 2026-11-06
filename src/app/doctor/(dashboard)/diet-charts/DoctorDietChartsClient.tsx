'use client';

import React, { useState, useEffect } from 'react';
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

  // Create New Diet Chart Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ phone: '', name: '', age: '', gender: '' });
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [detectedUhid, setDetectedUhid] = useState<string | null>(null);
  const [uhidStatusType, setUhidStatusType] = useState<'found' | 'new' | null>(null);
  const [familyMembers, setFamilyMembers] = useState<any[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Auto-fetch UHID and patient records whenever 10 digits are typed
  useEffect(() => {
    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setDetectedUhid(null);
      setUhidStatusType(null);
      setFamilyMembers([]);
      setSelectedPatientId(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLookingUp(true);
      try {
        const res = await fetch(`/api/doctor/patients/lookup?phone=${encodeURIComponent(cleanPhone)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.found && data.primary) {
            setDetectedUhid(data.primary.uhid || null);
            setUhidStatusType('found');
            setFormData(prev => ({
              ...prev,
              name: data.primary.name || prev.name || '',
              age: data.primary.age || prev.age || '',
              gender: data.primary.gender || prev.gender || '',
            }));
            if (data.patients && data.patients.length > 0) {
              setFamilyMembers(data.patients);
              const firstPatientWithId = data.patients.find((p: any) => p.id && p.source === 'PatientRecord');
              if (firstPatientWithId) {
                setSelectedPatientId(firstPatientWithId.id);
              } else if (data.primary.id && data.source === 'PatientRecord') {
                setSelectedPatientId(data.primary.id);
              } else {
                setSelectedPatientId(null);
              }
            } else if (data.primary.id && data.source === 'PatientRecord') {
              setSelectedPatientId(data.primary.id);
            } else {
              setSelectedPatientId(null);
            }
          } else if (data.nextUhid) {
            setDetectedUhid(data.nextUhid);
            setUhidStatusType('new');
            setFamilyMembers([]);
            setSelectedPatientId(null);
          }
        }
      } catch (err) {
        console.error('Error fetching UHID:', err);
      } finally {
        setIsLookingUp(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [formData.phone]);

  const handleOpenModal = () => {
    setFormData({ phone: '', name: '', age: '', gender: '' });
    setDetectedUhid(null);
    setUhidStatusType(null);
    setFamilyMembers([]);
    setSelectedPatientId(null);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSelectFamilyMember = (member: any) => {
    setSelectedPatientId(member.id || null);
    setFormData(prev => ({
      ...prev,
      name: member.name || '',
      age: member.age || '',
      gender: member.gender || ''
    }));
    if (member.uhid) {
      setDetectedUhid(member.uhid);
      setUhidStatusType('found');
    }
  };

  const handleAddNewMemberOnSamePhone = async () => {
    setSelectedPatientId(null);
    setFormData(prev => ({ ...prev, name: '', age: '', gender: '' }));
    try {
      const cleanPhone = formData.phone.replace(/\D/g, '');
      const res = await fetch(`/api/doctor/patients/lookup?phone=${encodeURIComponent(cleanPhone)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.nextUhid) {
          setDetectedUhid(data.nextUhid);
          setUhidStatusType('new');
        }
      }
    } catch (e) {}
  };

  const handleProceedToDietChart = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setFormError('Please enter a valid 10-digit mobile number');
      return;
    }
    if (!formData.name.trim()) {
      setFormError('Please enter patient full name');
      return;
    }

    setIsSubmitting(true);

    try {
      // POST to /api/doctor/patients safely ensures a valid PatientRecord exists
      // (whether they were already in PatientRecord or a Lead or brand new)
      // and returns the actual PatientRecord ID.
      const res = await fetch('/api/doctor/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          phone: cleanPhone,
          age: formData.age.trim(),
          gender: formData.gender,
          consultant: doctorName,
          uhid: detectedUhid
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to initialize patient record');
      }

      const saved = await res.json();
      router.push(`/doctor/patients/${saved.id}/diet-chart`);
    } catch (err: any) {
      setFormError(err.message || 'Something went wrong while initializing patient');
      setIsSubmitting(false);
    }
  };

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

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

  const totalPages = Math.max(1, Math.ceil(filteredCharts.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredCharts.length);
  const paginatedCharts = filteredCharts.slice(startIndex, endIndex);

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

        <button
          type="button"
          onClick={handleOpenModal}
          style={{
            background: '#059669',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '8px',
            border: 'none',
            fontWeight: 700,
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 2px 6px rgba(5,150,105,0.3)',
            cursor: 'pointer'
          }}
        >
          <span>+ Create New Diet Chart</span>
        </button>
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
                <th style={{ padding: '16px', width: '60px', textAlign: 'center' }}>S.No</th>
                <th style={{ padding: '16px' }}>Patient / Client</th>
                <th style={{ padding: '16px' }}>Chart Name</th>
                <th style={{ padding: '16px' }}>Status</th>
                <th style={{ padding: '16px' }}>Created Date</th>
                <th style={{ padding: '16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedCharts.map((chart, index) => (
                <tr key={chart.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '16px', textAlign: 'center', fontWeight: '600', color: '#64748b', fontSize: '13px' }}>
                    {startIndex + index + 1}
                  </td>
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
                        View
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
                  <td colSpan={6} style={{ padding: '48px 16px', textAlign: 'center', color: '#64748b' }}>
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

        {/* PAGINATION */}
        {filteredCharts.length > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 20px',
            borderTop: '1px solid #e2e8f0',
            background: '#fafbfc',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ fontSize: '13px', color: '#64748b' }}>
              Showing <span style={{ fontWeight: 600, color: '#0f172a' }}>{startIndex + 1}</span> to{' '}
              <span style={{ fontWeight: 600, color: '#0f172a' }}>{endIndex}</span> of{' '}
              <span style={{ fontWeight: 600, color: '#0f172a' }}>{filteredCharts.length}</span> diet charts
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                type="button"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  background: currentPage === 1 ? '#f8fafc' : 'white',
                  color: currentPage === 1 ? '#94a3b8' : '#334155',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                }}
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => {
                if (
                  totalPages > 7 &&
                  pageNum !== 1 &&
                  pageNum !== totalPages &&
                  Math.abs(pageNum - currentPage) > 1
                ) {
                  if (pageNum === 2 || pageNum === totalPages - 1) {
                    return <span key={pageNum} style={{ padding: '0 4px', color: '#94a3b8' }}>...</span>;
                  }
                  return null;
                }
                const isActive = pageNum === currentPage;
                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    style={{
                      minWidth: '32px',
                      height: '32px',
                      padding: '0 8px',
                      borderRadius: '6px',
                      border: isActive ? '1px solid #059669' : '1px solid #cbd5e1',
                      background: isActive ? '#059669' : 'white',
                      color: isActive ? 'white' : '#334155',
                      fontSize: '13px',
                      fontWeight: isActive ? 700 : 500,
                      cursor: 'pointer'
                    }}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  background: currentPage === totalPages ? '#f8fafc' : 'white',
                  color: currentPage === totalPages ? '#94a3b8' : '#334155',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CREATE NEW DIET CHART MODAL */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            maxWidth: '540px',
            width: '100%',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            overflow: 'hidden'
          }}>
            {/* MODAL HEADER (STICKY TOP) */}
            <div style={{
              background: 'linear-gradient(135deg, #065f46 0%, #0284c7 100%)',
              color: 'white',
              padding: '18px 24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexShrink: 0
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '18px' }}>🥗</span>
                  <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>Create New Diet Chart</h2>
                </div>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#e0f2fe', opacity: 0.9 }}>
                  Enter mobile number to auto-fetch UHID and profile details.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  color: 'white',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  fontSize: '18px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ×
              </button>
            </div>

            {/* MODAL FORM CONTAINER */}
            <form onSubmit={handleProceedToDietChart} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, margin: 0 }}>
              {/* SCROLLABLE FORM BODY */}
              <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
                {formError && (
                  <div style={{
                    background: '#fef2f2',
                    color: '#b91c1c',
                    border: '1px solid #fecaca',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    marginBottom: '16px',
                    fontWeight: 600
                  }}>
                    ⚠️ {formError}
                  </div>
                )}

                {/* MOBILE NUMBER INPUT */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Patient Mobile Number *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="Enter 10-digit mobile number (e.g. 9876543210)"
                      maxLength={14}
                      autoFocus
                      required
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        borderRadius: '8px',
                        border: isLookingUp ? '2px solid #0284c7' : uhidStatusType === 'found' ? '2px solid #10b981' : '1px solid #cbd5e1',
                        fontSize: '15px',
                        fontWeight: 600,
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                    {isLookingUp && (
                      <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '12px', color: '#0284c7', fontWeight: 600 }}>
                        🔍 Fetching UHID...
                      </div>
                    )}
                  </div>
                </div>

                {/* UHID STATUS BADGE */}
                {uhidStatusType && detectedUhid && (
                  <div style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    background: uhidStatusType === 'found' ? '#dcfce7' : '#e0f2fe',
                    border: uhidStatusType === 'found' ? '1px solid #86efac' : '1px solid #bae6fd',
                    color: uhidStatusType === 'found' ? '#166534' : '#0369a1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '13px',
                    fontWeight: 700
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>{uhidStatusType === 'found' ? '✓' : '✨'}</span>
                      <span>
                        {uhidStatusType === 'found' ? 'Existing UHID:' : 'Assigned New UHID:'} <strong>{detectedUhid}</strong>
                      </span>
                    </div>
                    <span style={{ fontSize: '11px', textTransform: 'uppercase', padding: '2px 8px', borderRadius: '12px', background: 'white' }}>
                      {uhidStatusType === 'found' ? 'Verified Record' : 'New Patient'}
                    </span>
                  </div>
                )}

                {/* MULTIPLE FAMILY MEMBERS SELECTOR */}
                {familyMembers.length > 1 && (
                  <div style={{ marginBottom: '16px', background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 800, color: '#334155' }}>
                        Select Patient Profile ({familyMembers.length} Found):
                      </span>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>
                        Click card to select
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '180px', overflowY: 'auto', paddingRight: '2px' }}>
                      {familyMembers.map((m, idx) => {
                        const isSelected = formData.name.trim().toLowerCase() === (m.name || '').trim().toLowerCase();
                        return (
                          <div
                            key={idx}
                            onClick={() => handleSelectFamilyMember(m)}
                            style={{
                              padding: '9px 12px',
                              borderRadius: '8px',
                              border: isSelected ? '2px solid #059669' : '1px solid #e2e8f0',
                              background: isSelected ? '#ecfdf5' : 'white',
                              cursor: 'pointer',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              fontSize: '13px',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{
                                width: '15px',
                                height: '15px',
                                borderRadius: '50%',
                                border: isSelected ? '5px solid #059669' : '2px solid #cbd5e1',
                                background: 'white',
                                flexShrink: 0
                              }} />
                              <div>
                                <strong style={{ color: isSelected ? '#065f46' : '#0f172a' }}>{m.name}</strong>
                                {m.age && <span style={{ color: '#64748b', marginLeft: '6px' }}>({m.age} Yrs)</span>}
                                {m.gender && <span style={{ color: '#64748b', marginLeft: '4px' }}>• {m.gender}</span>}
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontSize: '11px', color: '#0284c7', fontWeight: 700, fontFamily: 'monospace' }}>
                                {m.uhid || 'No UHID'}
                              </span>
                              {isSelected && (
                                <span style={{ fontSize: '11px', background: '#dcfce7', color: '#15803d', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                                  Selected ✓
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}

                      <button
                        type="button"
                        onClick={handleAddNewMemberOnSamePhone}
                        style={{
                          padding: '7px 10px',
                          borderRadius: '6px',
                          border: '1px dashed #0284c7',
                          background: '#f0f9ff',
                          color: '#0369a1',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          marginTop: '4px',
                          textAlign: 'center'
                        }}
                      >
                        + Add New Family Member on this Number
                      </button>
                    </div>
                  </div>
                )}

                {/* PATIENT FULL NAME */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Patient Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. B. Sirisha"
                    required
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '14px',
                      fontWeight: 600,
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* AGE & GENDER */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '8px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Age (Years)
                    </label>
                    <input
                      type="text"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      placeholder="e.g. 28"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '14px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Gender
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '14px',
                        background: 'white',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    >
                      <option value="">Select Gender</option>
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* STICKY FOOTER ACTIONS (ALWAYS VISIBLE AT BOTTOM) */}
              <div style={{
                padding: '14px 24px',
                background: '#f8fafc',
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexShrink: 0
              }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: 'white',
                    color: '#475569',
                    fontWeight: 600,
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || formData.phone.replace(/\D/g, '').length < 10 || !formData.name.trim()}
                  style={{
                    padding: '11px 22px',
                    borderRadius: '8px',
                    border: 'none',
                    background: isSubmitting || formData.phone.replace(/\D/g, '').length < 10 || !formData.name.trim() ? '#94a3b8' : '#059669',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '14px',
                    cursor: isSubmitting || formData.phone.replace(/\D/g, '').length < 10 || !formData.name.trim() ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 2px 8px rgba(5, 150, 105, 0.35)'
                  }}
                >
                  {isSubmitting ? 'Opening Diet Chart...' : 'Confirm & Proceed to Diet Chart →'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
