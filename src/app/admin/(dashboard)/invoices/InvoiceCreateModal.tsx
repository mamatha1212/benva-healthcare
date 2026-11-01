'use client';

import React, { useState, useEffect } from 'react';
import styles from './Invoices.module.css';

interface PatientRecord {
  id: string;
  name: string;
  phone: string;
  uhid?: string | null;
  address?: string | null;
  email?: string | null;
}

interface ItemRow {
  itemName: string;
  hsn: string;
  batch: string;
  exp: string;
  qty: number | string;
  unit: string;
  price: number | string;
  discount: number | string;
  taxRate: number; // e.g. 5, 12, 18
  benvaCost: number | string; // For Benva revenue calculation
}

interface Props {
  initialModule?: 'LAB_TESTS' | 'MEDICINES' | 'DOCTOR' | 'DIETITIAN';
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (invoice: any) => void;
}

export default function InvoiceCreateModal({ initialModule = 'MEDICINES', isOpen, onClose, onSuccess }: Props) {
  const [module, setModule] = useState<'LAB_TESTS' | 'MEDICINES' | 'DOCTOR' | 'DIETITIAN'>(initialModule);
  const [billType, setBillType] = useState<'GST' | 'NON_GST'>('GST');
  
  // Customer selection / creation
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PatientRecord[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<PatientRecord | null>(null);
  const [isCreatingNewPatient, setIsCreatingNewPatient] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // New patient form fields
  const [newPatientName, setNewPatientName] = useState('');
  const [newPatientPhone, setNewPatientPhone] = useState('');
  const [newPatientUhid, setNewPatientUhid] = useState('');
  const [newPatientAddress, setNewPatientAddress] = useState('');
  const [newPatientEmail, setNewPatientEmail] = useState('');

  // Module specific extra fields
  const [doctorName, setDoctorName] = useState('');
  const [consultationType, setConsultationType] = useState('Video Consultation');
  const [dietitianName, setDietitianName] = useState('');
  const [planDuration, setPlanDuration] = useState('1 Month Plan');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [placeOfSupply, setPlaceOfSupply] = useState('37-Andhra Pradesh');

  // Items - start completely empty with no default item
  const [items, setItems] = useState<ItemRow[]>([]);

  // Payment details
  const [payMode, setPayMode] = useState('UPI');
  const [paidAmount, setPaidAmount] = useState<number | string>('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setModule(initialModule);
      setItems([]);
    }
  }, [initialModule, isOpen]);

  // When module switches, clear items to start clean
  useEffect(() => {
    setItems([]);
  }, [module]);

  // Auto search patient
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/admin/patients?search=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  if (!isOpen) return null;

  // Row additions & edits
  const handleAddItem = () => {
    setItems([
      ...items,
      {
        itemName: '',
        hsn: module === 'MEDICINES' ? '3004' : '9983',
        batch: '',
        exp: '',
        qty: 1,
        unit: module === 'MEDICINES' ? 'Tbs' : module === 'LAB_TESTS' ? 'Test' : module === 'DOCTOR' ? 'Session' : 'Plan',
        price: '',
        discount: '',
        taxRate: billType === 'GST' ? (module === 'MEDICINES' ? 5 : 0) : 0,
        benvaCost: '',
      }
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof ItemRow, val: any) => {
    const next = [...items];
    next[index] = { ...next[index], [field]: val };
    setItems(next);
  };

  // Calculations
  const calculatedRows = items.map(it => {
    const p = Number(it.price) || 0;
    const q = Number(it.qty) || 1;
    const d = Number(it.discount) || 0;
    const c = Number(it.benvaCost) || 0;
    const gross = p * q;
    const taxable = Math.max(0, gross - d);
    const taxRate = billType === 'GST' ? (Number(it.taxRate) || 0) : 0;
    const gstAmt = (taxable * taxRate) / 100;
    const cgst = gstAmt / 2;
    const sgst = gstAmt / 2;
    const total = taxable + gstAmt;
    const benvaProfit = total - (c * q);
    return {
      ...it,
      numericPrice: p,
      numericQty: q,
      numericDiscount: d,
      numericCost: c,
      taxable,
      gstAmt,
      cgst,
      sgst,
      total,
      benvaProfit,
    };
  });

  const subTotal = calculatedRows.reduce((acc, r) => acc + (r.numericPrice * r.numericQty), 0);
  const totalDiscount = calculatedRows.reduce((acc, r) => acc + r.numericDiscount, 0);
  const totalCgst = calculatedRows.reduce((acc, r) => acc + r.cgst, 0);
  const totalSgst = calculatedRows.reduce((acc, r) => acc + r.sgst, 0);
  const grandTotal = calculatedRows.reduce((acc, r) => acc + r.total, 0);
  const totalBenvaRevenue = Math.max(0, calculatedRows.reduce((acc, r) => acc + r.benvaProfit, 0));
  const dueAmount = Math.max(0, grandTotal - (Number(paidAmount) || 0));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let pName = '';
    let pPhone = '';
    let pUhid = '';
    let pAddress = '';
    let pEmail = '';

    if (selectedPatient) {
      pName = selectedPatient.name;
      pPhone = selectedPatient.phone;
      pUhid = selectedPatient.uhid || '';
      pAddress = selectedPatient.address || '';
      pEmail = selectedPatient.email || '';
    } else {
      pName = newPatientName.trim();
      pPhone = newPatientPhone.trim();
      pUhid = newPatientUhid.trim();
      pAddress = newPatientAddress.trim();
      pEmail = newPatientEmail.trim();

      if (!pName || !pPhone) {
        alert('Please enter Patient / Customer Name and Mobile Number.');
        return;
      }
    }

    if (items.length === 0) {
      alert('Please click "+ Add Item" to add at least one line item to this invoice.');
      return;
    }

    if (items.some(i => !i.itemName.trim())) {
      alert('Please enter Item / Service Name for all rows.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        patientId: selectedPatient?.id || undefined,
        patientName: pName,
        patientPhone: pPhone,
        patientEmail: pEmail,
        address: pAddress,
        consultant: doctorName || dietitianName || undefined,
        module,
        billType,
        totalAmount: grandTotal,
        discount: totalDiscount,
        cgst: totalCgst,
        sgst: totalSgst,
        paidAmount: Number(paidAmount) || 0,
        dueAmount,
        payMode,
        placeOfSupply,
        benvaRevenue: totalBenvaRevenue,
        doctorName,
        consultationType,
        dietitianName,
        planDuration,
        startDate,
        endDate,
        notes,
        items: calculatedRows.map(r => ({
          itemName: r.itemName,
          hsn: r.hsn,
          batch: r.batch,
          exp: r.exp,
          qty: Number(r.qty) || 1,
          unit: r.unit,
          price: Number(r.price) || 0,
          discount: Number(r.discount) || 0,
          taxRate: billType === 'GST' ? Number(r.taxRate) || 0 : 0,
          cgst: Number(r.cgst) || 0,
          sgst: Number(r.sgst) || 0,
          total: Number(r.total) || 0,
          benvaCost: Number(r.benvaCost) || 0,
        }))
      };

      const res = await fetch('/api/admin/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('Failed to create invoice');
      }

      const generated = await res.json();
      onSuccess(generated);
      onClose();
    } catch (err: any) {
      alert(err.message || 'Error creating invoice');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(4px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '1050px',
        maxHeight: '94vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#f8fafc',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              backgroundColor: '#e0f2fe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px'
            }}>
              {module === 'LAB_TESTS' ? '🧪' : module === 'MEDICINES' ? '💊' : module === 'DOCTOR' ? '👨‍⚕️' : '🥗'}
            </span>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                  Create New {module === 'LAB_TESTS' ? 'Lab Tests & Packages' : module === 'MEDICINES' ? 'Medicines' : module === 'DOCTOR' ? 'Doctor Consultation' : 'Dietitian Plan'} Invoice
                </h2>
                <span style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  backgroundColor: '#0284c7',
                  color: '#ffffff'
                }}>
                  {module === 'LAB_TESTS' ? '🧪 Lab Tests' : module === 'MEDICINES' ? '💊 Medicines' : module === 'DOCTOR' ? '👨‍⚕️ Doctor' : '🥗 Dietitian'}
                </span>
              </div>
              <p style={{ margin: '3px 0 0 0', fontSize: '13px', color: '#64748b' }}>
                Fast Billing • {billType === 'GST' ? 'GST Compliant' : 'Standard Non-GST'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* GST / Non-GST Selection Pill */}
            <div style={{
              display: 'flex',
              backgroundColor: '#e2e8f0',
              padding: '3px',
              borderRadius: '8px'
            }}>
              <button
                type="button"
                onClick={() => setBillType('GST')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  backgroundColor: billType === 'GST' ? '#0284c7' : 'transparent',
                  color: billType === 'GST' ? '#ffffff' : '#475569',
                  transition: 'all 0.15s ease'
                }}
              >
                🧾 With GST
              </button>
              <button
                type="button"
                onClick={() => setBillType('NON_GST')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  backgroundColor: billType === 'NON_GST' ? '#0284c7' : 'transparent',
                  color: billType === 'NON_GST' ? '#ffffff' : '#475569',
                  transition: 'all 0.15s ease'
                }}
              >
                📄 Without GST
              </button>
            </div>

            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '22px',
                color: '#64748b',
                cursor: 'pointer',
                padding: '4px 8px'
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Scrollable Modal Body */}
        <form onSubmit={handleSubmit} style={{ overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Customer Selection Section */}
          <div style={{
            padding: '16px',
            backgroundColor: '#f8fafc',
            borderRadius: '10px',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569', textTransform: 'uppercase' }}>
                1. Customer / Patient Details (UHID Mandatory)
              </label>
              {!isCreatingNewPatient ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingNewPatient(true);
                    setSelectedPatient(null);
                  }}
                  style={{
                    fontSize: '12px',
                    fontWeight: '700',
                    color: '#0284c7',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  + Create New Customer
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsCreatingNewPatient(false)}
                  style={{
                    fontSize: '12px',
                    fontWeight: '700',
                    color: '#64748b',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  ← Search Existing Customer
                </button>
              )}
            </div>

            {!isCreatingNewPatient ? (
              <div>
                {selectedPatient ? (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    backgroundColor: '#ffffff',
                    border: '1.5px solid #0284c7',
                    borderRadius: '8px'
                  }}>
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '14px', color: '#0f172a' }}>{selectedPatient.name}</div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px', display: 'flex', gap: '16px' }}>
                        <span><strong>UHID:</strong> <span style={{ color: '#0284c7', fontWeight: '700' }}>{selectedPatient.uhid || 'Auto-Generating'}</span></span>
                        <span><strong>Phone:</strong> {selectedPatient.phone}</span>
                        {selectedPatient.address && <span><strong>Address:</strong> {selectedPatient.address}</span>}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedPatient(null)}
                      style={{
                        padding: '4px 10px',
                        fontSize: '12px',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        backgroundColor: '#ffffff',
                        cursor: 'pointer'
                      }}
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      placeholder="Search existing customer by UHID, Mobile Number, or Name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        fontSize: '13px',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                    {isSearching && (
                      <div style={{ position: 'absolute', right: '12px', top: '10px', fontSize: '12px', color: '#64748b' }}>
                        Searching...
                      </div>
                    )}
                    {searchResults.length > 0 && (
                      <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        backgroundColor: '#ffffff',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        marginTop: '4px',
                        maxHeight: '180px',
                        overflowY: 'auto',
                        zIndex: 10,
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}>
                        {searchResults.map((p) => (
                          <div
                            key={p.id}
                            onClick={() => {
                              setSelectedPatient(p);
                              setSearchQuery('');
                              setSearchResults([]);
                            }}
                            style={{
                              padding: '10px 14px',
                              borderBottom: '1px solid #f1f5f9',
                              cursor: 'pointer',
                              display: 'flex',
                              justifyContent: 'space-between',
                              fontSize: '13px'
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f0f9ff')}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
                          >
                            <div>
                              <strong>{p.name}</strong> • {p.phone}
                            </div>
                            <div style={{ color: '#0284c7', fontWeight: '700' }}>
                              UHID: {p.uhid || 'Assign on bill'}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* Create New Patient Form */
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569' }}>Customer Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vijay Kumar"
                    value={newPatientName}
                    onChange={(e) => setNewPatientName(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', fontSize: '13px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569' }}>Mobile Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 9010681168"
                    value={newPatientPhone}
                    onChange={(e) => setNewPatientPhone(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', fontSize: '13px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569' }}>UHID (Leave blank to auto-generate)</label>
                  <input
                    type="text"
                    placeholder="Auto-generated if empty"
                    value={newPatientUhid}
                    onChange={(e) => setNewPatientUhid(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', fontSize: '13px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569' }}>City / Address</label>
                  <input
                    type="text"
                    placeholder="e.g. Kakinada"
                    value={newPatientAddress}
                    onChange={(e) => setNewPatientAddress(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', fontSize: '13px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Module-Specific Details (Doctor / Dietitian) */}
          {(module === 'DOCTOR' || module === 'DIETITIAN') && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '12px',
              padding: '12px 16px',
              backgroundColor: '#f1f5f9',
              borderRadius: '8px'
            }}>
              {module === 'DOCTOR' ? (
                <>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569' }}>Doctor Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Dr. Rajesh Kumar, MD"
                      value={doctorName}
                      onChange={(e) => setDoctorName(e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', fontSize: '13px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569' }}>Consultation Type</label>
                    <select
                      value={consultationType}
                      onChange={(e) => setConsultationType(e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', fontSize: '13px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                    >
                      <option value="Video Consultation">Video Consultation</option>
                      <option value="Audio Consultation">Audio Consultation</option>
                      <option value="In-Person Consultation">In-Person Consultation</option>
                      <option value="Follow-up Consultation">Follow-up Consultation</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569' }}>Place of Supply</label>
                    <input
                      type="text"
                      value={placeOfSupply}
                      onChange={(e) => setPlaceOfSupply(e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', fontSize: '13px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569' }}>Dietitian Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Dt. Ananya Sharma"
                      value={dietitianName}
                      onChange={(e) => setDietitianName(e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', fontSize: '13px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569' }}>Plan Duration</label>
                    <select
                      value={planDuration}
                      onChange={(e) => setPlanDuration(e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', fontSize: '13px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                    >
                      <option value="1 Month Plan">1 Month Plan</option>
                      <option value="3 Months Plan">3 Months Plan</option>
                      <option value="6 Months Plan">6 Months Plan</option>
                      <option value="Annual Plan">Annual Plan</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569' }}>Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', fontSize: '13px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {/* Line Items Table */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569', textTransform: 'uppercase' }}>
                2. Line Items & Pricing
              </label>
              <button
                type="button"
                onClick={handleAddItem}
                style={{
                  padding: '5px 12px',
                  backgroundColor: '#0284c7',
                  color: '#ffffff',
                  fontSize: '12px',
                  fontWeight: '700',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                + Add Item
              </button>
            </div>

            <div style={{ overflowX: 'auto', border: '1px solid #cbd5e1', borderRadius: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #cbd5e1' }}>
                    <th style={{ padding: '8px 10px', width: '30px' }}>#</th>
                    <th style={{ padding: '8px 10px', minWidth: '160px' }}>Item / Service</th>
                    {module === 'MEDICINES' && <th style={{ padding: '8px 10px', width: '85px' }}>Batch / Exp</th>}
                    <th style={{ padding: '8px 10px', width: '65px' }}>Qty</th>
                    <th style={{ padding: '8px 10px', width: '65px' }}>Unit</th>
                    <th style={{ padding: '8px 10px', width: '90px' }}>Price (₹)</th>
                    <th style={{ padding: '8px 10px', width: '80px' }}>Disc (₹)</th>
                    {billType === 'GST' && <th style={{ padding: '8px 10px', width: '75px' }}>GST %</th>}
                    <th style={{ padding: '8px 10px', width: '90px' }}>Benva Cost</th>
                    <th style={{ padding: '8px 10px', width: '90px', textAlign: 'right' }}>Total (₹)</th>
                    <th style={{ padding: '8px 10px', width: '35px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {calculatedRows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={billType === 'GST' ? (module === 'MEDICINES' ? 11 : 10) : (module === 'MEDICINES' ? 10 : 9)}
                        style={{ textAlign: 'center', padding: '36px 16px', color: '#64748b', fontSize: '13px' }}
                      >
                        <div style={{ fontWeight: '600', color: '#475569', marginBottom: '6px' }}>No line items added yet</div>
                        <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '12px' }}>
                          Click the button below to add your items, tests, or consultation fees
                        </div>
                        <button
                          type="button"
                          onClick={handleAddItem}
                          style={{
                            padding: '7px 18px',
                            backgroundColor: '#0284c7',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '700',
                            cursor: 'pointer'
                          }}
                        >
                          + Add Item
                        </button>
                      </td>
                    </tr>
                  ) : (
                    calculatedRows.map((row, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '6px 10px', color: '#64748b' }}>{idx + 1}</td>
                        <td style={{ padding: '6px 10px' }}>
                          <input
                            type="text"
                            required
                            placeholder={module === 'MEDICINES' ? 'e.g. Paracetamol 650mg' : 'Item / Service name'}
                            value={row.itemName}
                            onChange={(e) => handleItemChange(idx, 'itemName', e.target.value)}
                            style={{ width: '100%', padding: '6px 8px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                          />
                        </td>
                        {module === 'MEDICINES' && (
                          <td style={{ padding: '6px 8px' }}>
                            <input
                              type="text"
                              placeholder="B#102"
                              value={row.batch}
                              onChange={(e) => handleItemChange(idx, 'batch', e.target.value)}
                              style={{ width: '100%', padding: '6px 8px', fontSize: '11px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                            />
                          </td>
                        )}
                        <td style={{ padding: '6px 8px' }}>
                          <input
                            type="number"
                            min="1"
                            value={row.qty}
                            onFocus={(e) => e.target.select()}
                            onChange={(e) => handleItemChange(idx, 'qty', e.target.value)}
                            style={{ width: '100%', padding: '6px 8px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                          />
                        </td>
                        <td style={{ padding: '6px 8px' }}>
                          <select
                            value={row.unit}
                            onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                            style={{ width: '100%', padding: '6px 4px', fontSize: '11px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                          >
                            <option value="Tbs">Tbs</option>
                            <option value="Strips">Strips</option>
                            <option value="Bottle">Bottle</option>
                            <option value="Test">Test</option>
                            <option value="Session">Session</option>
                            <option value="Plan">Plan</option>
                            <option value="Pcs">Pcs</option>
                          </select>
                        </td>
                        <td style={{ padding: '6px 8px' }}>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            value={row.price}
                            onFocus={(e) => e.target.select()}
                            onChange={(e) => handleItemChange(idx, 'price', e.target.value)}
                            style={{ width: '100%', padding: '6px 8px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                          />
                        </td>
                        <td style={{ padding: '6px 8px' }}>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0"
                            value={row.discount}
                            onFocus={(e) => e.target.select()}
                            onChange={(e) => handleItemChange(idx, 'discount', e.target.value)}
                            style={{ width: '100%', padding: '6px 8px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                          />
                        </td>
                        {billType === 'GST' && (
                          <td style={{ padding: '6px 8px' }}>
                            <select
                              value={row.taxRate}
                              onChange={(e) => handleItemChange(idx, 'taxRate', Number(e.target.value))}
                              style={{ width: '100%', padding: '6px 4px', fontSize: '11px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                            >
                              <option value="0">0%</option>
                              <option value="5">5%</option>
                              <option value="12">12%</option>
                              <option value="18">18%</option>
                              <option value="28">28%</option>
                            </select>
                          </td>
                        )}
                        <td style={{ padding: '6px 8px' }}>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="Cost"
                            value={row.benvaCost}
                            onFocus={(e) => e.target.select()}
                            onChange={(e) => handleItemChange(idx, 'benvaCost', e.target.value)}
                            style={{ width: '100%', padding: '6px 8px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '4px', backgroundColor: '#f0fdf4' }}
                            title="Benva Purchase/Vendor Cost (Used to calculate Benva Revenue)"
                          />
                        </td>
                        <td style={{ padding: '6px 10px', textAlign: 'right', fontWeight: '700', color: '#0f172a' }}>
                          ₹{row.total.toFixed(2)}
                        </td>
                        <td style={{ padding: '6px 6px', textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '14px' }}
                            title="Remove this item"
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Financial Summary & Payment Breakdown */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 1fr',
            gap: '20px',
            backgroundColor: '#f8fafc',
            padding: '16px',
            borderRadius: '10px',
            border: '1px solid #e2e8f0'
          }}>
            {/* Payment Recording */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>
                3. Payment Details
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569' }}>Payment Mode</label>
                  <select
                    value={payMode}
                    onChange={(e) => setPayMode(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', fontSize: '13px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  >
                    <option value="UPI">UPI / GPay / PhonePe</option>
                    <option value="Cash">Cash</option>
                    <option value="Card">Credit / Debit Card</option>
                    <option value="Online">Online Gateway</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569' }}>Amount Paid (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={paidAmount}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => setPaidAmount(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', fontSize: '13px', border: '1px solid #cbd5e1', borderRadius: '6px', fontWeight: '700', color: '#16a34a' }}
                  />
                </div>
              </div>

              <div style={{ marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setPaidAmount(grandTotal)}
                  style={{
                    padding: '4px 10px',
                    fontSize: '11px',
                    fontWeight: '700',
                    color: '#0284c7',
                    backgroundColor: '#e0f2fe',
                    border: '1px solid #bae6fd',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    marginRight: '8px'
                  }}
                >
                  Pay Full (₹{grandTotal.toFixed(2)})
                </button>
                <button
                  type="button"
                  onClick={() => setPaidAmount(0)}
                  style={{
                    padding: '4px 10px',
                    fontSize: '11px',
                    fontWeight: '700',
                    color: '#dc2626',
                    backgroundColor: '#fee2e2',
                    border: '1px solid #fecaca',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Pending (₹0.00)
                </button>
              </div>

              <div style={{ marginTop: '12px' }}>
                <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569' }}>Notes / Remarks</label>
                <input
                  type="text"
                  placeholder="Optional billing note..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                />
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div style={{
              backgroundColor: '#ffffff',
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1'
            }}>
              <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr>
                    <td style={{ padding: '3px 0', color: '#64748b' }}>Gross Amount:</td>
                    <td style={{ padding: '3px 0', textAlign: 'right', fontWeight: '600' }}>₹{subTotal.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '3px 0', color: '#16a34a' }}>Customer Discount:</td>
                    <td style={{ padding: '3px 0', textAlign: 'right', fontWeight: '600', color: '#16a34a' }}>-₹{totalDiscount.toFixed(2)}</td>
                  </tr>
                  {billType === 'GST' && (
                    <>
                      <tr>
                        <td style={{ padding: '3px 0', color: '#64748b' }}>CGST:</td>
                        <td style={{ padding: '3px 0', textAlign: 'right', fontWeight: '600' }}>+₹{totalCgst.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '3px 0', color: '#64748b' }}>SGST:</td>
                        <td style={{ padding: '3px 0', textAlign: 'right', fontWeight: '600' }}>+₹{totalSgst.toFixed(2)}</td>
                      </tr>
                    </>
                  )}
                  <tr style={{ borderTop: '1.5px solid #0f172a', borderBottom: '1.5px solid #0f172a' }}>
                    <td style={{ padding: '6px 0', fontWeight: '800', fontSize: '14px', color: '#0f172a' }}>Grand Total:</td>
                    <td style={{ padding: '6px 0', textAlign: 'right', fontWeight: '800', fontSize: '16px', color: '#0284c7' }}>
                      ₹{grandTotal.toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '4px 0', color: '#16a34a', fontWeight: '600' }}>Paid:</td>
                    <td style={{ padding: '4px 0', textAlign: 'right', fontWeight: '700', color: '#16a34a' }}>₹{(Number(paidAmount) || 0).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '4px 0', color: dueAmount > 0 ? '#dc2626' : '#64748b', fontWeight: '600' }}>Balance Due:</td>
                    <td style={{ padding: '4px 0', textAlign: 'right', fontWeight: '700', color: dueAmount > 0 ? '#dc2626' : '#64748b' }}>₹{dueAmount.toFixed(2)}</td>
                  </tr>
                  <tr style={{ borderTop: '1px dashed #cbd5e1' }}>
                    <td style={{ paddingTop: '6px', color: '#0369a1', fontWeight: '700' }}>Benva Revenue:</td>
                    <td style={{ paddingTop: '6px', textAlign: 'right', fontWeight: '800', color: '#0369a1' }}>₹{totalBenvaRevenue.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer Actions */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            paddingTop: '8px',
            borderTop: '1px solid #e2e8f0'
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 20px',
                backgroundColor: '#ffffff',
                color: '#475569',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: '10px 28px',
                backgroundColor: '#0284c7',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '800',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.7 : 1,
                boxShadow: '0 4px 6px -1px rgba(2, 132, 199, 0.3)'
              }}
            >
              {isSubmitting ? 'Generating Invoice...' : 'Generate Invoice Now →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
