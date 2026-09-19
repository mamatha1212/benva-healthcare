'use client';
import React, { useState, useEffect } from 'react';
import styles from './MembershipFormSection.module.css';
import AnimatedHeading from '../AnimatedHeading/AnimatedHeading';
import SearchableSelect from '../SearchableSelect/SearchableSelect';

const DISTRICTS_AP = [
  'Anantapur', 'Chittoor', 'East Godavari', 'Guntur', 'Krishna', 'Kurnool', 
  'Prakasam', 'SPSR Nellore', 'Srikakulam', 'Visakhapatnam', 'Vizianagaram', 
  'West Godavari', 'YSR Kadapa'
];

const DISTRICTS_TS = [
  'Adilabad', 'Bhadradri Kothagudem', 'Hyderabad', 'Jagtial', 'Jangaon', 
  'Jayashankar Bhupalpally', 'Jogulamba Gadwal', 'Kamareddy', 'Karimnagar', 
  'Khammam', 'Komaram Bheem', 'Mahabubabad', 'Mahabubnagar', 'Mancherial', 
  'Medak', 'Medchal', 'Mulugu', 'Nagarkurnool', 'Nalgonda', 'Narayanpet', 
  'Nirmal', 'Nizamabad', 'Peddapalli', 'Rajanna Sircilla', 'Rangareddy', 
  'Sangareddy', 'Siddipet', 'Suryapet', 'Vikarabad', 'Wanaparthy', 
  'Warangal Rural', 'Warangal Urban', 'Yadadri Bhuvanagiri'
];
import { useLocations } from '@/hooks/useLocations';

export default function MembershipFormSection() {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '', mobile: '', whatsapp: '', email: '',
    state: '', district: '', area: '', pincode: '',
    membershipType: '', consent: false, selectedOffice: ''
  });
  
  // Area check states
  const [isCheckingArea, setIsCheckingArea] = useState(false);
  const [availableAreas, setAvailableAreas] = useState<any[]>([]);
  const [showAreaSelect, setShowAreaSelect] = useState(false);
  const [checkAreaMessage, setCheckAreaMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const { locations, loading: locationsLoading } = useLocations();

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('openMembershipModal', handleOpen);
    return () => window.removeEventListener('openMembershipModal', handleOpen);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (name === 'pincode') {
      setFormData(prev => ({ ...prev, pincode: value, selectedOffice: '' }));
    } else if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleProtectedFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!formData.selectedOffice && formData.pincode.length === 6 && showAreaSelect) {
      e.target.blur();
      setErrors(prev => ({ ...prev, pincode: 'Please click Check and select an area first' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Required';
    if (!formData.mobile.trim()) newErrors.mobile = 'Required';
    if (!formData.state) newErrors.state = 'Required';
    if (!formData.district) newErrors.district = 'Required';
    
    if (!formData.pincode.trim()) {
      newErrors.pincode = 'Required';
    } else if (formData.pincode.length !== 6) {
      newErrors.pincode = 'Enter a valid 6 digit pincode';
    } else if (!formData.selectedOffice && showAreaSelect) {
      newErrors.pincode = 'Please select an area from the search dropdown';
    }

    if (!formData.membershipType) newErrors.membershipType = 'Required';
    if (!formData.consent) newErrors.consent = 'Required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
        setCheckAreaMessage('No service areas found for this pincode. Please select manually.');
      }
    } catch (e) {
      setCheckAreaMessage('Failed to check availability. Please select manually.');
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
    if (errors.pincode) setErrors(prev => ({ ...prev, pincode: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setIsSubmitting(true);
      try {
        const response = await fetch('/api/membership', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });

        if (response.ok) {
          setShowSuccess(true);
        } else {
          const data = await response.json().catch(() => ({}));
          alert(`Error: ${data.error || 'Something went wrong. Please try again.'}`);
        }
      } catch (err: any) {
        console.error(err);
        alert(`Error: ${err.message || 'Something went wrong. Please try again.'}`);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const closeForm = () => {
    setIsOpen(false);
    setShowSuccess(false);
    setAvailableAreas([]);
    setShowAreaSelect(false);
    setCheckAreaMessage('');
    setFormData({
      fullName: '', mobile: '', whatsapp: '', email: '',
      state: '', district: '', area: '', pincode: '',
      membershipType: '', consent: false, selectedOffice: ''
    });
    setErrors({});
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        
        <button className={styles.closeBtn} onClick={closeForm}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {!showSuccess ? (
          <>
            <div className={styles.header}>
              <h2 className={styles.heading}>Apply For BENVA Healthcare Membership</h2>
              <p className={styles.subHeading}>Fill In Your Details And Our Team Will Contact You Regarding Membership Registration.</p>
            </div>

            <form className={styles.form} onSubmit={handleSubmit}>
              
              <div className={styles.formSection}>
                <h3 className={styles.sectionTitle}>Personal Details</h3>
                <div className={styles.inputGrid}>
                  <div className={styles.inputGroup}>
                    <label>Full Name *</label>
                    <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="e.g. Ramesh Kumar" />
                    {errors.fullName && <span className={styles.error}>{errors.fullName}</span>}
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Mobile Number *</label>
                    <input type="number" name="mobile" value={formData.mobile} onChange={handleChange} placeholder="e.g. 9876543210" />
                    {errors.mobile && <span className={styles.error}>{errors.mobile}</span>}
                  </div>
                  <div className={styles.inputGroup}>
                    <label>WhatsApp Number</label>
                    <input type="number" name="whatsapp" value={formData.whatsapp} onChange={handleChange} placeholder="e.g. 9876543210" />
                    {errors.whatsapp && <span className={styles.error}>{errors.whatsapp}</span>}
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Email Address</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="e.g. name@gmail.com" />
                    {errors.email && <span className={styles.error}>{errors.email}</span>}
                  </div>
                </div>
              </div>

              <div className={styles.formSection}>
                <h3 className={styles.sectionTitle}>Address Details</h3>
                <div className={styles.inputGrid}>
                  <div className={styles.inputGroup}>
                    <label>State *</label>
                    <SearchableSelect
                      name="state"
                      value={formData.state}
                      onChange={(val) => handleChange({ target: { name: 'state', value: val, type: 'select-one' } } as any)}
                      options={[
                        { value: '', label: 'Select State' },
                        ...locations.map(s => ({ value: s.name, label: s.name }))
                      ]}
                      className={errors.state ? styles.error : ''}
                      placeholder="Select State"
                    />
                    {errors.state && <span className={styles.error}>{errors.state}</span>}
                  </div>
                  <div className={styles.inputGroup}>
                    <label>District *</label>
                    <SearchableSelect
                      name="district"
                      value={formData.district}
                      onChange={(val) => handleChange({ target: { name: 'district', value: val, type: 'select-one' } } as any)}
                      disabled={!formData.state}
                      options={[
                        { value: '', label: formData.state ? 'Select District' : 'Please select state first' },
                        ...(locations.find(s => s.name === formData.state)?.districts.map((d: any) => ({ value: d.name, label: d.name })) || [])
                      ]}
                      className={errors.district ? styles.error : ''}
                      placeholder="Select District"
                    />
                    {errors.district && <span className={styles.error}>{errors.district}</span>}
                  </div>

                  <div className={styles.inputGroup} style={{ position: 'relative', gridColumn: '1 / -1' }}>
                    <label>Pincode *</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input type="number" name="pincode" value={formData.pincode} onChange={handleChange} placeholder="e.g. 533005" style={{ flex: 1 }} />
                      <button 
                        type="button" 
                        onClick={handleCheckPincode}
                        disabled={isCheckingArea || formData.pincode.length < 6}
                        style={{
                          background: 'var(--color-primary, #1d4ed8)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '0 16px',
                          fontWeight: '600',
                          cursor: (isCheckingArea || formData.pincode.length < 6) ? 'not-allowed' : 'pointer',
                          opacity: (isCheckingArea || formData.pincode.length < 6) ? 0.7 : 1,
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {isCheckingArea ? 'Checking...' : 'Check'}
                      </button>
                    </div>
                    {formData.selectedOffice && !errors.pincode && (
                      <div style={{ marginTop: '10px', padding: '10px 14px', background: '#ecfdf5', border: '1.5px solid #10b981', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="#10b981" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        <div>
                          <div style={{ fontSize: '11px', color: '#065f46', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Selected Area</div>
                          <div style={{ fontSize: '14px', color: '#047857', fontWeight: 700 }}>{formData.selectedOffice}</div>
                        </div>
                      </div>
                    )}
                    {checkAreaMessage && (
                      <div style={{ 
                        fontSize: '12px', 
                        marginTop: '6px', 
                        color: checkAreaMessage.includes('Error') || checkAreaMessage.includes('not found') || checkAreaMessage.includes('Failed') ? '#ef4444' : '#10b981',
                        fontWeight: 500
                      }}>
                        {checkAreaMessage}
                      </div>
                    )}
                    {errors.pincode && <span className={styles.error}>{errors.pincode}</span>}
                  </div>
                  
                  {showAreaSelect && availableAreas.length > 0 && (
                    <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '16px', marginBottom: '24px', gridColumn: '1 / -1' }}>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#334155', marginBottom: '12px' }}>Serviceability</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                        {availableAreas.map((loc) => (
                          <div key={loc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '12px' }}>
                            <div>
                              <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '14px' }}>{loc.officeName}</div>
                              <div style={{ fontSize: '12px', color: '#64748b' }}>{loc.type} • {loc.area} Area</div>
                            </div>
                            <button 
                              type="button" 
                              onClick={() => selectArea(loc)}
                              style={{
                                background: '#e0e7ff',
                                color: '#4f46e5',
                                border: 'none',
                                padding: '6px 12px',
                                borderRadius: '4px',
                                fontSize: '12px',
                                fontWeight: 600,
                                cursor: 'pointer'
                              }}
                            >
                              Select
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.formSection}>
                <h3 className={styles.sectionTitle}>Membership Details</h3>
                <div className={styles.inputGrid}>
                  <div className={styles.inputGroup}>
                    <label>Membership Type *</label>
                    <select name="membershipType" value={formData.membershipType} onChange={handleChange}>
                      <option value="">Select Membership</option>
                      <option value="Individual Membership">Individual Membership</option>
                      <option value="Family Membership">Family Membership</option>
                    </select>
                    {errors.membershipType && <span className={styles.error}>{errors.membershipType}</span>}
                  </div>
                </div>
              </div>

              <div className={styles.formSection}>
                <label className={styles.checkboxLabel}>
                  <input type="checkbox" name="consent" checked={formData.consent} onChange={handleChange} />
                  I Agree To Be Contacted By BENVA Healthcare Regarding Membership Registration.
                </label>
                {errors.consent && <span className={styles.error} style={{ display: 'block', marginTop: '4px' }}>Please agree to proceed</span>}
              </div>

              <div className={styles.submitWrapper}>
                <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit Request'}
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </button>
              </div>

            </form>
          </>
        ) : (
          <div className={styles.successState}>
            <div className={styles.successIcon}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <h2 className={styles.successHeading}>Thank You For Your Interest</h2>
            <p className={styles.successText}>Our Healthcare Team Will Contact You Soon Regarding Membership Registration.</p>
            
            <div className={styles.successActions}>
              <button className={styles.secondaryBtn} onClick={closeForm}>Back To Home</button>
              <button className={styles.primaryBtn} onClick={() => {
                closeForm();
                window.location.href = '/services';
              }}>
                Explore Services
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
