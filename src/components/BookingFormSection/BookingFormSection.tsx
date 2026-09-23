'use client';
import React, { useState, useEffect } from 'react';
import styles from './BookingFormSection.module.css';
import AnimatedHeading from '../AnimatedHeading/AnimatedHeading';
import { useLocations } from '@/hooks/useLocations';
import SearchableSelect from '../SearchableSelect/SearchableSelect';

export default function BookingFormSection() {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    whatsapp: '',
    email: '',
    state: '',
    district: '',
    area: '',
    pincode: '',
    age: '',
    gender: '',
    consent: true,
    selectedOffice: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  
  // Area check states
  const [isCheckingArea, setIsCheckingArea] = useState(false);
  const [availableAreas, setAvailableAreas] = useState<any[]>([]);
  const [showAreaSelect, setShowAreaSelect] = useState(false);
  const [checkAreaMessage, setCheckAreaMessage] = useState('');

  const { locations, loading: locationsLoading } = useLocations();

  const [selectedPackage, setSelectedPackage] = useState({ title: 'BENVA Premium Full Body Health Checkup', price: '1,999' });

  useEffect(() => {
    const handleOpen = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setSelectedPackage({
          title: customEvent.detail.title || 'BENVA Premium Full Body Health Checkup',
          price: customEvent.detail.price || '1,999'
        });
      }
      setIsOpen(true);
    };
    window.addEventListener('openBookingModal', handleOpen);
    return () => window.removeEventListener('openBookingModal', handleOpen);
  }, []);



  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Reset district if state changes
    if (name === 'state') {
      setFormData(prev => ({ ...prev, state: value, district: '' }));
    } else if (name === 'pincode') {
      setFormData(prev => ({ ...prev, pincode: value, selectedOffice: '' }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
      }));
    }

    // Clear error on type
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleProtectedFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!formData.selectedOffice) {
      e.target.blur();
      setErrors(prev => ({ ...prev, pincode: 'Please click Check and select an area first' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full Name is required';
    if (!formData.mobile.trim()) newErrors.mobile = 'Mobile Number is required';
    if (!formData.state) newErrors.state = 'State is required';
    if (!formData.district) newErrors.district = 'District is required';
    if (!formData.pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
    } else if (formData.pincode.length !== 6) {
      newErrors.pincode = 'Enter a valid 6 digit pincode';
    } else if (!formData.selectedOffice) {
      newErrors.pincode = 'Please click Check and select an area';
    }
    if (!formData.age.trim()) newErrors.age = 'Age is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.consent) newErrors.consent = 'You must agree to be contacted';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setIsSubmitting(true);
      try {
        const response = await fetch('/api/book-checkup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, packageTitle: selectedPackage.title, packagePrice: selectedPackage.price })
        });

        if (response.ok) {
          setShowSuccess(true);
        } else {
          alert('Something went wrong. Please try again.');
        }
      } catch (err) {
        console.error(err);
        alert('Something went wrong. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const resetForm = () => {
    setShowSuccess(false);
    setAvailableAreas([]);
    setShowAreaSelect(false);
    setCheckAreaMessage('');
    setFormData({
      fullName: '', mobile: '', whatsapp: '', email: '', state: '',
      district: '', area: '', pincode: '', age: '', gender: '', consent: false, selectedOffice: ''
    });
  };

  const closeForm = () => {
    setIsOpen(false);
    resetForm();
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
        setCheckAreaMessage('No service areas found for this pincode. Please select manually below.');
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
  };

  if (!isOpen) return null;

  return (
    <div className={styles.mainOverlay}>
      <div className={styles.modalContainer}>
        
        <button className={styles.closeBtn} onClick={closeForm}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div className={styles.header}>
          <AnimatedHeading className={styles.heading}>Book Your Health Checkup</AnimatedHeading>
          <p className={styles.subHeading}>Share your details and we'll confirm your booking shortly.</p>
        </div>

        <form className={styles.formCard} onSubmit={handleSubmit}>
          
          {/* ── Basic Details ── */}
          <div className={styles.formGroup}>
            <div className={styles.groupTitle}>Basic Details</div>
            <div className={styles.formGrid}>
              <div className={styles.field}>
                <label className={styles.label}>Full Name <span>*</span></label>
                <input type="text" name="fullName" placeholder="e.g. your name" value={formData.fullName} onChange={handleInputChange} className={`${styles.input} ${errors.fullName ? styles.error : ''}`} />
                {errors.fullName && <span className={styles.errorText}>{errors.fullName}</span>}
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Mobile Number <span>*</span></label>
                <input type="tel" name="mobile" placeholder="e.g. 9111145556" value={formData.mobile} onChange={handleInputChange} className={`${styles.input} ${errors.mobile ? styles.error : ''}`} />
                {errors.mobile && <span className={styles.errorText}>{errors.mobile}</span>}
              </div>
              <div className={styles.field}>
                <label className={styles.label}>WhatsApp Number</label>
                <input type="tel" name="whatsapp" placeholder="e.g. 9111145556" value={formData.whatsapp} onChange={handleInputChange} className={`${styles.input} ${errors.whatsapp ? styles.error : ''}`} />
                {errors.whatsapp && <span className={styles.errorText}>{errors.whatsapp}</span>}
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Email Address</label>
                <input type="email" name="email" placeholder="e.g. name@gmail.com" value={formData.email} onChange={handleInputChange} className={styles.input} />
              </div>
            </div>
          </div>

          {/* ── Location Details ── */}
          <div className={styles.formGroup}>
            <div className={styles.groupTitle}>Location Details</div>

            <div className={styles.formGrid} style={{ marginBottom: '16px' }}>
              <div className={styles.field}>
                <label className={styles.label}>State <span>*</span></label>
                <SearchableSelect
                  name="state"
                  value={formData.state}
                  onChange={(val) => handleInputChange({ target: { name: 'state', value: val } } as any)}
                  options={[
                    { value: '', label: 'Select State' },
                    ...locations.map(s => ({ value: s.name, label: s.name }))
                  ]}
                  className={`${errors.state ? styles.error : ''}`}
                  placeholder="Select State"
                />
                {errors.state && <span className={styles.errorText}>{errors.state}</span>}
              </div>
              <div className={styles.field}>
                <label className={styles.label}>District <span>*</span></label>
                <SearchableSelect
                  name="district"
                  value={formData.district}
                  onChange={(val) => handleInputChange({ target: { name: 'district', value: val } } as any)}
                  disabled={!formData.state}
                  options={[
                    { value: '', label: formData.state ? 'Select District' : 'Please select state first' },
                    ...(locations.find(s => s.name === formData.state)?.districts.map((d: any) => ({ value: d.name, label: d.name })) || [])
                  ]}
                  className={`${errors.district ? styles.error : ''}`}
                  placeholder="Select District"
                />
                {errors.district && <span className={styles.errorText}>{errors.district}</span>}
              </div>
            </div>
            
            <div className={styles.field} style={{ gridColumn: '1 / -1' }}>
              <label className={styles.label}>Pincode <span>*</span></label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input type="text" name="pincode" placeholder="e.g. 533005" value={formData.pincode} onChange={handleInputChange} className={`${styles.input} ${errors.pincode ? styles.error : ''}`} maxLength={6} />
                <button type="button" onClick={handleCheckPincode} disabled={isCheckingArea || formData.pincode.length !== 6} className={styles.submitBtn} style={{ width: 'auto', padding: '0 24px', margin: 0 }}>
                  {isCheckingArea ? '...' : 'Check'}
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
              {errors.pincode && <span className={styles.errorText}>{errors.pincode}</span>}
              {checkAreaMessage && !errors.pincode && !formData.selectedOffice && <span className={styles.errorText} style={{ color: checkAreaMessage.includes('Sorry') ? '#dc2626' : '#059669' }}>{checkAreaMessage}</span>}
            </div>

            {showAreaSelect && (
              <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
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
                        style={{ padding: '6px 12px', background: '#e0e7ff', color: '#4338ca', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}
                      >
                        Select
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Patient Details (No Heading) ── */}
          <div className={styles.formGroup}>
            <div className={styles.formGrid}>
              <div className={styles.field}>
                <label className={styles.label}>Age <span>*</span></label>
                <input type="number" name="age" placeholder="e.g. 35" value={formData.age} onChange={handleInputChange} onFocus={handleProtectedFocus} className={`${styles.input} ${errors.age ? styles.error : ''}`} />
                {errors.age && <span className={styles.errorText}>{errors.age}</span>}
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Gender <span>*</span></label>
                <select name="gender" value={formData.gender} onChange={handleInputChange} onFocus={handleProtectedFocus} className={`${styles.input} ${errors.gender ? styles.error : ''}`}>
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                {errors.gender && <span className={styles.errorText}>{errors.gender}</span>}
              </div>
            </div>
          </div>

          {/* ── Health Package ── */}
          <div className={styles.formGroup}>
            <div className={styles.groupTitle}>Selected Package</div>
            <div className={styles.packageBox}>
              <span className={styles.packageTitle}>{selectedPackage.title}</span>
              <span className={styles.packagePrice}>₹{selectedPackage.price}</span>
            </div>
          </div>

          <label className={styles.consentField}>
            <input type="checkbox" name="consent" checked={formData.consent} onChange={handleInputChange} />
            <span className={styles.consentText}>I consent to be contacted by BENVA Healthcare regarding my health check-up booking and related services.</span>
          </label>
          {errors.consent && <div className={styles.errorText} style={{ marginTop: '-24px', marginBottom: '24px', marginLeft: '32px' }}>{errors.consent}</div>}

          <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
            {isSubmitting ? <div className={styles.spinner} /> : 'Submit Request'}
          </button>
        </form>
      </div>

      {/* ── Success Modal ── */}
      {showSuccess && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalCard}>
            <div className={styles.successIcon}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <h3 className={styles.modalTitle}>Thank You For Submitting Your Details</h3>
            <p className={styles.modalDesc}>Our Healthcare Team Will Contact You Shortly To Confirm Your Booking.</p>
            
            <div className={styles.modalActions}>
              <button className={styles.submitBtn} onClick={() => { closeForm(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Back To Home</button>
              <button className={styles.btnSecondary} onClick={resetForm}>Book Another Service</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
