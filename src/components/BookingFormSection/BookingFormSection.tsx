'use client';
import React, { useState, useEffect } from 'react';
import styles from './BookingFormSection.module.css';
import AnimatedHeading from '../AnimatedHeading/AnimatedHeading';

const DISTRICTS_AP = [
  'Visakhapatnam', 'Vijayawada', 'Guntur', 'Kakinada', 'Rajahmundry', 
  'Nellore', 'Kurnool', 'Tirupati', 'Anantapur', 'Eluru', 'Other'
];

const DISTRICTS_TS = [
  'Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam', 
  'Ramagundam', 'Mahbubnagar', 'Nalgonda', 'Adilabad', 'Other'
];

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
    consent: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

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

  const availableDistricts = 
    formData.state === 'Andhra Pradesh' ? DISTRICTS_AP : 
    formData.state === 'Telangana' ? DISTRICTS_TS : [];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Reset district if state changes
    if (name === 'state') {
      setFormData(prev => ({ ...prev, state: value, district: '' }));
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

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full Name is required';
    if (!formData.mobile.trim()) newErrors.mobile = 'Mobile Number is required';
    if (!formData.state) newErrors.state = 'State is required';
    if (!formData.district) newErrors.district = 'District is required';
    if (!formData.area.trim()) newErrors.area = 'Area / Locality is required';
    if (!formData.pincode.trim()) newErrors.pincode = 'Pincode is required';
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
    setFormData({
      fullName: '', mobile: '', whatsapp: '', email: '', state: '',
      district: '', area: '', pincode: '', age: '', gender: '', consent: false,
    });
  };

  const closeForm = () => {
    setIsOpen(false);
    resetForm();
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
          <p className={styles.subHeading}>Fill In Your Details And Our Healthcare Team Will Contact You To Confirm Your Booking.</p>
        </div>

        <form className={styles.formCard} onSubmit={handleSubmit}>
          
          {/* ── Personal Details ── */}
          <div className={styles.formGroup}>
            <div className={styles.groupTitle}>Personal Details</div>
            <div className={styles.formGrid}>
              <div className={styles.field}>
                <label className={styles.label}>Full Name <span>*</span></label>
                <input type="text" name="fullName" placeholder="e.g. Ramesh Kumar" value={formData.fullName} onChange={handleInputChange} className={`${styles.input} ${errors.fullName ? styles.error : ''}`} />
                {errors.fullName && <span className={styles.errorText}>{errors.fullName}</span>}
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Mobile Number <span>*</span></label>
                <input type="tel" name="mobile" placeholder="e.g. 9876543210" value={formData.mobile} onChange={handleInputChange} className={`${styles.input} ${errors.mobile ? styles.error : ''}`} />
                {errors.mobile && <span className={styles.errorText}>{errors.mobile}</span>}
              </div>
              <div className={styles.field}>
                <label className={styles.label}>WhatsApp Number</label>
                <input type="tel" name="whatsapp" placeholder="e.g. 9876543210" value={formData.whatsapp} onChange={handleInputChange} className={`${styles.input} ${errors.whatsapp ? styles.error : ''}`} />
                {errors.whatsapp && <span className={styles.errorText}>{errors.whatsapp}</span>}
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Email Address *</label>
                <input type="email" required name="email" placeholder="e.g. name@gmail.com" value={formData.email} onChange={handleInputChange} className={styles.input} />
              </div>
            </div>
          </div>

          {/* ── Location Details ── */}
          <div className={styles.formGroup}>
            <div className={styles.groupTitle}>Location Details</div>
            <div className={styles.formGrid}>
              <div className={styles.field}>
                <label className={styles.label}>State <span>*</span></label>
                <select name="state" value={formData.state} onChange={handleInputChange} className={`${styles.input} ${errors.state ? styles.error : ''}`}>
                  <option value="">Select State</option>
                  <option value="Andhra Pradesh">Andhra Pradesh</option>
                  <option value="Telangana">Telangana</option>
                </select>
                {errors.state && <span className={styles.errorText}>{errors.state}</span>}
              </div>
              <div className={styles.field}>
                <label className={styles.label}>District <span>*</span></label>
                <select name="district" value={formData.district} onChange={handleInputChange} disabled={!formData.state} className={`${styles.input} ${errors.district ? styles.error : ''}`}>
                  <option value="">{formData.state ? 'Select District' : 'Please select state first'}</option>
                  {availableDistricts.map(dist => (
                    <option key={dist} value={dist}>{dist}</option>
                  ))}
                </select>
                {errors.district && <span className={styles.errorText}>{errors.district}</span>}
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Area / Locality <span>*</span></label>
                <input type="text" name="area" placeholder="e.g. Sarpavaram" value={formData.area} onChange={handleInputChange} className={`${styles.input} ${errors.area ? styles.error : ''}`} />
                {errors.area && <span className={styles.errorText}>{errors.area}</span>}
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Pincode <span>*</span></label>
                <input type="number" name="pincode" placeholder="e.g. 533005" value={formData.pincode} onChange={handleInputChange} className={`${styles.input} ${errors.pincode ? styles.error : ''}`} />
                {errors.pincode && <span className={styles.errorText}>{errors.pincode}</span>}
              </div>
            </div>
          </div>

          {/* ── Patient Details ── */}
          <div className={styles.formGroup}>
            <div className={styles.groupTitle}>Patient Details</div>
            <div className={styles.formGrid}>
              <div className={styles.field}>
                <label className={styles.label}>Age <span>*</span></label>
                <input type="number" name="age" placeholder="e.g. 35" value={formData.age} onChange={handleInputChange} className={`${styles.input} ${errors.age ? styles.error : ''}`} />
                {errors.age && <span className={styles.errorText}>{errors.age}</span>}
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Gender <span>*</span></label>
                <select name="gender" value={formData.gender} onChange={handleInputChange} className={`${styles.input} ${errors.gender ? styles.error : ''}`}>
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
            <span className={styles.consentText}>I Agree To Be Contacted By BENVA Healthcare Regarding My Health Checkup Request.</span>
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
