'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getPincodesForDistrict } from './actions';
import { getLocationsHierarchy } from '@/components/DoorstepSection/actions';
import styles from './BookConsultation.module.css';

export default function BookFreeConsultationPage() {
  const [type, setType] = useState<'NONE' | 'GENERAL' | 'CORPORATE'>('NONE');
  
  // Corporate Step State
  const [phoneToVerify, setPhoneToVerify] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [employeeData, setEmployeeData] = useState<any>(null);
  const [verifyError, setVerifyError] = useState('');
  const [corporateConfirmed, setCorporateConfirmed] = useState(false);

  // Locations State
  const [locations, setLocations] = useState<any[]>([]);
  const [availableDistricts, setAvailableDistricts] = useState<any[]>([]);

  // Pincode Flow State
  const [isCheckingArea, setIsCheckingArea] = useState(false);
  const [availableAreas, setAvailableAreas] = useState<any[]>([]);
  const [showAreaSelect, setShowAreaSelect] = useState(false);
  const [checkAreaMessage, setCheckAreaMessage] = useState('');

  useEffect(() => {
    getLocationsHierarchy().then(data => {
      setLocations(data);
    });
  }, []);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    age: '',
    gender: '',
    state: '',
    district: '',
    pincode: '',
    selectedOffice: '',
    problem: '',
    previousMedication: '',
    reportUrl: ''
  });

  // Handle state change
  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedStateName = e.target.value;
    const selectedState = locations.find(s => s.name === selectedStateName);
    setAvailableDistricts(selectedState ? selectedState.districts : []);
    setFormData({ ...formData, state: selectedStateName, district: '', pincode: '', selectedOffice: '' });
    setAvailableAreas([]);
    setShowAreaSelect(false);
    setCheckAreaMessage('');
  };

  // Handle district change
  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const districtName = e.target.value;
    setFormData({ ...formData, district: districtName, pincode: '', selectedOffice: '' });
    setAvailableAreas([]);
    setShowAreaSelect(false);
    setCheckAreaMessage('');
  };

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
        setCheckAreaMessage('No service areas found for this pincode. Please try another.');
      }
    } catch (e) {
      setCheckAreaMessage('Failed to check availability. Please try again.');
    } finally {
      setIsCheckingArea(false);
    }
  };

  const selectArea = (loc: any) => {
    setFormData(prev => ({
      ...prev,
      selectedOffice: loc.officeName || ''
    }));
    setShowAreaSelect(false);
  };
  
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneToVerify) return;
    setVerifying(true);
    setVerifyError('');
    setEmployeeData(null);
    try {
      const res = await fetch('/api/consultation/verify-corporate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneToVerify })
      });
      const data = await res.json();
      if (res.ok) {
        setEmployeeData(data);
        // Pre-fill form data
        setFormData(prev => ({
          ...prev,
          name: data.name,
          phone: data.phone,
          email: data.email || ''
        }));
      } else {
        setVerifyError(data.error || 'Verification failed');
      }
    } catch (err) {
      setVerifyError('Something went wrong. Please try again.');
    }
    setVerifying(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.selectedOffice) {
      alert("Please click 'Check' and select a service area for your pincode.");
      return;
    }

    setSubmitting(true);
    
    const submitData = {
      ...formData,
      type,
      employeeId: employeeData?.id || null,
      organizationName: employeeData?.organization?.companyName || null
    };

    try {
      const res = await fetch('/api/consultation/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });
      if (res.ok) {
        setSuccess(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        alert('Failed to submit your request. Please try again.');
      }
    } catch (err) {
      alert('Something went wrong.');
    }
    setSubmitting(false);
  };

  if (success) {
    return (
      <div className={styles.pageContainer} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <div className={styles.successCard} style={{ maxWidth: '600px', margin: '40px auto', padding: '50px 30px' }}>
          <div className={styles.successIcon}>✓</div>
          <h2 className={styles.successTitle} style={{ color: '#00509e', fontSize: '2rem' }}>Request Submitted Successfully!</h2>
          
          <div style={{ background: '#111111', padding: '30px', borderRadius: '16px', margin: '30px 0', border: '2px dashed #00509e' }}>
            <h3 style={{ fontSize: '1.4rem', color: '#f8fafc', marginBottom: '15px' }}>Next Step: Book Your Free Tele-Consultation</h3>
            <p style={{ fontSize: '1.1rem', color: '#cbd5e0', marginBottom: '25px', lineHeight: '1.6' }}>
              Please call Benva Support now to book your appointment slot for the free tele-consultation.
            </p>
            <div style={{ display: 'inline-block', background: '#0284c7', color: 'white', padding: '16px 32px', borderRadius: '50px', fontSize: '1.8rem', fontWeight: '800', letterSpacing: '1px', boxShadow: '0 10px 25px rgba(2, 132, 199, 0.4)', transition: 'transform 0.2s' }}>
              <a href="tel:+919111145556" style={{ color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                +91 91111 45556
              </a>
            </div>
          </div>

          <p className={styles.successDesc} style={{ fontSize: '1.1rem' }}>Thank you for choosing Benva Healthcare. We look forward to assisting you.</p>
          <button onClick={() => window.location.href = '/'} className={styles.btnSecondary} style={{ width: '100%', marginTop: '10px' }}>Return to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      {/* ── Header ── */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.badge}>Expert Medical Consultation</div>
          <h1 className={styles.mainTitle}>Book Your Free Consultation</h1>
          <p className={styles.mainSubtitle}>Select your path below to get personalized care and connect with our health experts today.</p>
        </div>
      </header>

      <main className={styles.mainContent}>
        {type === 'NONE' && (
          <div className={styles.cardContainer}>
            <div onClick={() => setType('GENERAL')} className={`${styles.selectionCard} ${styles.general}`}>
              <div className={styles.iconWrapper}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              </div>
              <h3 className={styles.cardTitle}>General Public</h3>
              <p className={styles.cardDesc}>I am booking as an individual seeking general consultation.</p>
            </div>
            
            <div onClick={() => setType('CORPORATE')} className={`${styles.selectionCard} ${styles.corporate}`}>
              <div className={styles.iconWrapper}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M12 6h.01"></path><path d="M12 10h.01"></path><path d="M12 14h.01"></path><path d="M16 10h.01"></path><path d="M16 14h.01"></path><path d="M8 10h.01"></path><path d="M8 14h.01"></path></svg>
              </div>
              <h3 className={styles.cardTitle}>Corporate Plan</h3>
              <p className={styles.cardDesc}>My company is enrolled in Benva Healthcare corporate program.</p>
            </div>
          </div>
        )}

        {type === 'CORPORATE' && !corporateConfirmed && (
          <div className={styles.formContainer}>
            <button onClick={() => { setType('NONE'); setEmployeeData(null); setVerifyError(''); }} className={styles.backBtn}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
              Back to Selection
            </button>
            
            <h2 className={styles.formTitle}>Corporate Verification</h2>
            <p className={styles.formDesc}>Please enter your mobile number to verify your corporate enrollment.</p>
            
            {!employeeData ? (
              <form onSubmit={handleVerify}>
                <div className={styles.verifyRow}>
                  <div className={styles.inputGroup} style={{ marginBottom: 0 }}>
                    <input 
                      type="text" 
                      placeholder="Enter 10-digit mobile number" 
                      value={phoneToVerify} 
                      onChange={e => setPhoneToVerify(e.target.value)}
                      className={styles.input}
                      required
                    />
                  </div>
                  <button type="submit" disabled={verifying} className={styles.btnPrimary}>
                    {verifying ? 'Verifying...' : 'Verify'}
                  </button>
                </div>
              </form>
            ) : (
              <div className={styles.detailsCard}>
                <h3>Details Found</h3>
                <div className={styles.detailsGrid}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Name</span>
                    <span className={styles.detailValue}>{employeeData.name}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Organization</span>
                    <span className={styles.detailValue}>{employeeData.organization?.companyName}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Phone</span>
                    <span className={styles.detailValue}>{employeeData.phone}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Email</span>
                    <span className={styles.detailValue}>{employeeData.email || 'N/A'}</span>
                  </div>
                </div>
                <div className={styles.actionRow}>
                  <button onClick={() => setCorporateConfirmed(true)} className={styles.btnSuccess}>Yes, this is me</button>
                  <button onClick={() => setEmployeeData(null)} className={styles.btnSecondary}>No, try another number</button>
                </div>
              </div>
            )}
            
            {verifyError && <div className={styles.errorMsg}>{verifyError}</div>}
          </div>
        )}

        {((type === 'GENERAL') || (type === 'CORPORATE' && corporateConfirmed)) && (
          <div className={styles.formContainer}>
            <button onClick={() => { setType('NONE'); setCorporateConfirmed(false); setEmployeeData(null); }} className={styles.backBtn}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
              Start Over
            </button>
            
            <h2 className={styles.formTitle}>
              {type === 'CORPORATE' ? 'Complete Your Consultation Request' : 'General Consultation Request'}
            </h2>
            
            <form onSubmit={handleSubmit}>
              {/* Personal Details */}
              <div className={styles.grid2}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Full Name *</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required disabled={type === 'CORPORATE'} className={styles.input} />
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Mobile Number *</label>
                  <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required disabled={type === 'CORPORATE'} className={styles.input} />
                </div>
              </div>
              
              <div className={styles.inputGroup}>
                <label className={styles.label}>Email Address</label>
                <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} disabled={type === 'CORPORATE' && !!employeeData?.email} className={styles.input} />
              </div>

              <div className={styles.grid2}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Age</label>
                  <input type="number" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} className={styles.input} />
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Gender</label>
                  <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className={`${styles.input} ${styles.select}`}>
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Location Details */}
              <h3 className={styles.sectionTitle}>Location Details</h3>
              <div className={styles.grid2}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>State *</label>
                  <select 
                    value={formData.state} 
                    onChange={handleStateChange} 
                    required 
                    className={`${styles.input} ${styles.select}`}
                  >
                    <option value="">Select State</option>
                    {locations.map(state => (
                      <option key={state.id} value={state.name}>{state.name}</option>
                    ))}
                  </select>
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>District *</label>
                  <select 
                    value={formData.district} 
                    onChange={handleDistrictChange} 
                    required 
                    disabled={!formData.state}
                    className={`${styles.input} ${styles.select}`}
                  >
                    <option value="">Select District</option>
                    {availableDistricts.map(district => (
                      <option key={district.id} value={district.name}>{district.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className={styles.inputGroup}>
                <label className={styles.label}>Pincode *</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    type="text" 
                    name="pincode" 
                    placeholder="e.g. 533005" 
                    value={formData.pincode} 
                    onChange={e => setFormData({...formData, pincode: e.target.value, selectedOffice: ''})} 
                    className={styles.input} 
                    maxLength={6} 
                  />
                  <button 
                    type="button" 
                    onClick={handleCheckPincode} 
                    disabled={isCheckingArea || formData.pincode.length !== 6} 
                    className={styles.btnPrimary} 
                    style={{ width: 'auto', padding: '0 24px', margin: 0 }}
                  >
                    {isCheckingArea ? '...' : 'Check'}
                  </button>
                </div>
                
                {formData.selectedOffice && (
                  <div style={{ marginTop: '10px', padding: '10px 14px', background: 'rgba(16, 185, 129, 0.1)', border: '1.5px solid #10b981', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#10b981" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    <div>
                      <div style={{ fontSize: '11px', color: '#34d399', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Selected Area</div>
                      <div style={{ fontSize: '14px', color: '#10b981', fontWeight: 700 }}>{formData.selectedOffice}</div>
                    </div>
                  </div>
                )}
                {checkAreaMessage && !formData.selectedOffice && (
                  <span style={{ color: checkAreaMessage.includes('Sorry') ? '#ef4444' : '#10b981', fontSize: '13px', display: 'block', marginTop: '6px' }}>{checkAreaMessage}</span>
                )}
              </div>

              {showAreaSelect && (
                <div style={{ background: '#171717', border: '1px solid #333333', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#f8fafc', marginBottom: '12px' }}>Serviceability</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                    {availableAreas.map((loc) => (
                      <div key={loc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#111111', border: '1px solid #222222', borderRadius: '6px', padding: '12px' }}>
                        <div>
                          <div style={{ fontWeight: 600, color: '#f8fafc', fontSize: '14px' }}>{loc.officeName}</div>
                          <div style={{ fontSize: '12px', color: '#94a3b8' }}>{loc.type} • {loc.area} Area</div>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => selectArea(loc)}
                          style={{ padding: '6px 12px', background: '#e0e7ff', color: '#4338ca', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}
                        >
                          Select
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Medical Details */}
              <h3 className={styles.sectionTitle}>Medical Details</h3>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Primary Problem / Issue *</label>
                <textarea rows={3} value={formData.problem} onChange={e => setFormData({...formData, problem: e.target.value})} required placeholder="Please describe your health issue briefly..." className={`${styles.input} ${styles.textarea}`}></textarea>
              </div>
              
              <div className={styles.inputGroup}>
                <label className={styles.label}>Previous Medication (Optional)</label>
                <textarea rows={2} value={formData.previousMedication} onChange={e => setFormData({...formData, previousMedication: e.target.value})} placeholder="List any medications you are currently taking..." className={`${styles.input} ${styles.textarea}`}></textarea>
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Medical Reports (Optional)</label>
                <div className={styles.fileUpload}>
                  <input type="file" id="reportFile" style={{ display: 'none' }} />
                  <label htmlFor="reportFile" className={styles.fileUploadLabel}>Choose File</label>
                  <p style={{ margin: '10px 0 0 0', fontSize: '13px', color: '#94a3b8' }}>Upload PDF, JPG, or PNG (Max 5MB)</p>
                </div>
              </div>

              <div style={{ marginTop: '30px' }}>
                <button type="submit" disabled={submitting} className={styles.btnPrimary}>
                  {submitting ? 'Submitting Request...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}

