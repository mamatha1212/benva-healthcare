'use client';
import React, { useState, useEffect } from 'react';
import styles from './AvailabilityFormModal.module.css';
import { getLocationsHierarchy } from '../DoorstepSection/actions';

interface AvailabilityFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Define local types matching what the server action returns
type AreaType = { id: string; name: string };
type DistrictType = { id: string; name: string; areas: AreaType[] };
type StateType = { id: string; name: string; districts: DistrictType[] };

export default function AvailabilityFormModal({ isOpen, onClose }: AvailabilityFormModalProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    whatsapp: '',
    state: '',
    district: '',
    area: '',
    pincode: '',
    requestedState: '',
    requestedDistrict: '',
    requestedArea: '',
  });

  const [locations, setLocations] = useState<StateType[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  useEffect(() => {
    getLocationsHierarchy().then(data => {
      setLocations(data);
    });
  }, []);

  // Prevent background scrolling when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setStatus('idle');
      setFormData({ fullName: '', mobile: '', whatsapp: '', state: '', district: '', area: '', pincode: '', requestedState: '', requestedDistrict: '', requestedArea: '' });
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const response = await fetch('/api/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setStatus('success');
      } else {
        const data = await response.json();
        alert(`Error: ${data.error || 'Something went wrong.'}`);
        setStatus('error');
      }
    } catch (err) {
      console.error(err);
      alert('Network error. Please try again.');
      setStatus('error');
    }
  };

  // Logic for progressive disclosure
  const isAreaSelected = formData.area !== '';
  const isNotListed = formData.district === 'Other' || formData.area === 'Other';
  
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {status === 'success' ? (
          <div className={styles.successState}>
            <div className={styles.successIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                <path d="M22 4L12 14.01l-3-3" />
              </svg>
            </div>
            <h3 className={styles.successTitle}>Thank You For Your Enquiry</h3>
            <p className={styles.successDesc}>Our Team Will Contact You Shortly.</p>
            <button className={styles.okBtn} onClick={onClose}>Okay</button>
          </div>
        ) : (
          <>
            <div className={styles.header}>
              <h3 className={styles.title}>Check Availability</h3>
              <p className={styles.subtitle}>Select your location to see if we serve your area.</p>
            </div>

            <form className={styles.form} onSubmit={handleSubmit}>
              
              {/* STEP 1: Location Selection */}
              <div className={styles.row}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>State *</label>
                  <select
                    required
                    className={styles.input}
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value, district: '', area: '', requestedState: '', requestedDistrict: '', requestedArea: '' })}
                  >
                    <option value="">Select State</option>
                    <option value="Andhra Pradesh">Andhra Pradesh</option>
                    <option value="Telangana">Telangana</option>
                  </select>
                </div>

                {formData.state !== 'Other' && (
                  <div className={styles.formGroup}>
                    <label className={styles.label}>District *</label>
                    <select
                      required
                      className={styles.input}
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value, area: '', requestedDistrict: '', requestedArea: '' })}
                      disabled={!formData.state}
                    >
                      <option value="">Select District</option>
                      {locations.find(s => s.name === formData.state)?.districts.map(dist => (
                        <option key={dist.id} value={dist.name}>{dist.name}</option>
                      ))}
                      <option value="Other">Other / Not Listed</option>
                    </select>
                  </div>
                )}
              </div>

              {formData.state !== 'Other' && formData.district !== 'Other' && (
                <div className={styles.row}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Area / Locality *</label>
                    <select
                      required
                      className={styles.input}
                      value={formData.area}
                      onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                      disabled={!formData.district}
                    >
                      <option value="">Select Area / Locality</option>
                      {locations.find(s => s.name === formData.state)?.districts.find(d => d.name === formData.district)?.areas.map(area => (
                        <option key={area.id} value={area.name}>{area.name}</option>
                      ))}
                      <option value="Other">Other / Not Listed</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Pincode *</label>
                    <input
                      type="text"
                      required
                      placeholder="6-digit pincode"
                      pattern="[0-9]{6}"
                      className={styles.input}
                      value={formData.pincode}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {/* STEP 2: Progressive Feedback & Lead Capture */}
              {(isAreaSelected || formData.state === 'Other' || isNotListed) && (
                <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px dashed #cbd5e1', animation: 'fadeIn 0.5s ease-out' }}>
                  
                  {isNotListed || formData.state === 'Other' ? (
                    <>
                      <div style={{ padding: '12px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', marginBottom: '20px', color: '#92400e', fontSize: '13px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                        <span style={{ fontSize: '16px' }}>🚀</span>
                        <div>
                          <strong>We are expanding rapidly!</strong>
                          <div style={{ marginTop: '4px' }}>Please leave your details and our team will notify you as soon as we launch in your area.</div>
                        </div>
                      </div>
                      
                      {formData.state === 'Other' ? (
                        <>
                          <div className={styles.row}>
                            <div className={styles.formGroup}>
                              <label className={styles.label}>Which state? *</label>
                              <input type="text" required placeholder="e.g. Karnataka" className={styles.input} value={formData.requestedState} onChange={(e) => setFormData({ ...formData, requestedState: e.target.value })} />
                            </div>
                            <div className={styles.formGroup}>
                              <label className={styles.label}>Which district? *</label>
                              <input type="text" required placeholder="e.g. Bangalore Urban" className={styles.input} value={formData.requestedDistrict} onChange={(e) => setFormData({ ...formData, requestedDistrict: e.target.value })} />
                            </div>
                          </div>
                          <div className={styles.row}>
                            <div className={styles.formGroup}>
                              <label className={styles.label}>Which area / locality? *</label>
                              <input type="text" required placeholder="e.g. Koramangala" className={styles.input} value={formData.requestedArea} onChange={(e) => setFormData({ ...formData, requestedArea: e.target.value })} />
                            </div>
                            <div className={styles.formGroup}>
                              <label className={styles.label}>Pincode *</label>
                              <input type="text" required placeholder="6-digit pincode" pattern="[0-9]{6}" className={styles.input} value={formData.pincode} onChange={(e) => setFormData({ ...formData, pincode: e.target.value })} />
                            </div>
                          </div>
                        </>
                      ) : formData.district === 'Other' ? (
                        <>
                          <div className={styles.row}>
                            <div className={styles.formGroup}>
                              <label className={styles.label}>Which district? *</label>
                              <input type="text" required placeholder="e.g. Medak" className={styles.input} value={formData.requestedDistrict} onChange={(e) => setFormData({ ...formData, requestedDistrict: e.target.value })} />
                            </div>
                            <div className={styles.formGroup}>
                              <label className={styles.label}>Which area / locality? *</label>
                              <input type="text" required placeholder="e.g. Patancheru" className={styles.input} value={formData.requestedArea} onChange={(e) => setFormData({ ...formData, requestedArea: e.target.value })} />
                            </div>
                          </div>
                          <div className={styles.row}>
                            <div className={styles.formGroup}>
                              <label className={styles.label}>Pincode *</label>
                              <input type="text" required placeholder="6-digit pincode" pattern="[0-9]{6}" className={styles.input} value={formData.pincode} onChange={(e) => setFormData({ ...formData, pincode: e.target.value })} />
                            </div>
                            <div className={styles.formGroup} style={{ visibility: 'hidden' }}></div>
                          </div>
                        </>
                      ) : formData.area === 'Other' ? (
                        <div className={styles.row}>
                          <div className={styles.formGroup}>
                            <label className={styles.label}>Which area / locality? *</label>
                            <input type="text" required placeholder="e.g. Kondapur, Hyderabad" className={styles.input} value={formData.requestedArea} onChange={(e) => setFormData({ ...formData, requestedArea: e.target.value })} />
                          </div>
                          <div className={styles.formGroup}>
                            <label className={styles.label}>Pincode *</label>
                            <input type="text" required placeholder="6-digit pincode" pattern="[0-9]{6}" className={styles.input} value={formData.pincode} onChange={(e) => setFormData({ ...formData, pincode: e.target.value })} />
                          </div>
                        </div>
                      ) : null}
                    </>
                  ) : (
                    <div style={{ padding: '12px', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', marginBottom: '20px', color: '#065f46', fontSize: '13px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <span style={{ fontSize: '16px' }}>✅</span>
                      <div>
                        <strong>Great news! We serve your area.</strong>
                        <div style={{ marginTop: '4px' }}>Please enter your details below and our healthcare team will get in touch with you shortly.</div>
                      </div>
                    </div>
                  )}

                  <div className={styles.formGroup} style={{ marginBottom: '16px' }}>
                    <label className={styles.label}>Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="Your Full Name"
                      className={styles.input}
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    />
                  </div>

                  <div className={styles.row}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Mobile Number *</label>
                      <input
                        type="tel"
                        required
                        placeholder="10-digit mobile number"
                        pattern="[0-9]{10}"
                        className={styles.input}
                        value={formData.mobile}
                        onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>WhatsApp Number (Optional)</label>
                      <input
                        type="tel"
                        placeholder="10-digit WhatsApp number"
                        pattern="[0-9]{10}"
                        className={styles.input}
                        value={formData.whatsapp}
                        onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className={styles.submitBtn} 
                    disabled={status === 'loading'}
                  >
                    {status === 'loading' ? 'Submitting...' : 'Request Callback'}
                  </button>
                </div>
              )}

            </form>
          </>
        )}
      </div>
    </div>
  );
}
