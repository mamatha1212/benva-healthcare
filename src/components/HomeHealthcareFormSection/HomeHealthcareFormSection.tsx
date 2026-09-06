'use client';
import React, { useState, useEffect } from 'react';
import styles from './HomeHealthcareFormSection.module.css';
import AnimatedHeading from '../AnimatedHeading/AnimatedHeading';

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

const SERVICES = [
  'BP Check At Home',
  'Sugar Check At Home',
  'ECG At Home',
  'Nurse Visit',
  'Physiotherapy',
  'Elder Care Services',
  'Attender Services',
  'Doctor Home Visit'
];

export default function HomeHealthcareFormSection() {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '', mobile: '', whatsapp: '', email: '',
    state: '', district: '', area: '', pincode: '',
    serviceType: '', consent: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('openHomeCareModal', handleOpen);
    return () => window.removeEventListener('openHomeCareModal', handleOpen);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Required';
    if (!formData.mobile.trim()) newErrors.mobile = 'Required';
    if (!formData.whatsapp.trim()) newErrors.whatsapp = 'Required';
    if (!formData.state) newErrors.state = 'Required';
    if (!formData.district) newErrors.district = 'Required';
    if (!formData.area.trim()) newErrors.area = 'Required';
    if (!formData.pincode.trim()) newErrors.pincode = 'Required';
    if (!formData.serviceType) newErrors.serviceType = 'Required';
    if (!formData.consent) newErrors.consent = 'Required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setIsSubmitting(true);
      try {
        const response = await fetch('/api/home-healthcare', {
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
    setFormData({
      fullName: '', mobile: '', whatsapp: '', email: '',
      state: '', district: '', area: '', pincode: '',
      serviceType: '', consent: false
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
              <AnimatedHeading className={styles.heading}>Book Home Healthcare Service</AnimatedHeading>
              <p className={styles.subHeading}>Fill In Your Details And Our Healthcare Team Will Contact You To Confirm Your Booking.</p>
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
                    <label>WhatsApp Number *</label>
                    <input type="number" name="whatsapp" value={formData.whatsapp} onChange={handleChange} placeholder="e.g. 9876543210" />
                    {errors.whatsapp && <span className={styles.error}>{errors.whatsapp}</span>}
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Email Address *</label>
                    <input type="email" required name="email" value={formData.email} onChange={handleChange} placeholder="e.g. name@gmail.com" />
                  </div>
                </div>
              </div>

              <div className={styles.formSection}>
                <h3 className={styles.sectionTitle}>Address Details</h3>
                <div className={styles.inputGrid}>
                  <div className={styles.inputGroup}>
                    <label>State *</label>
                    <select name="state" value={formData.state} onChange={handleChange}>
                      <option value="">Select State</option>
                      <option value="Andhra Pradesh">Andhra Pradesh</option>
                      <option value="Telangana">Telangana</option>
                    </select>
                    {errors.state && <span className={styles.error}>{errors.state}</span>}
                  </div>
                  <div className={styles.inputGroup}>
                    <label>District *</label>
                    <select name="district" value={formData.district} onChange={handleChange} disabled={!formData.state}>
                      <option value="">Select District</option>
                      {formData.state === 'Andhra Pradesh' && DISTRICTS_AP.map(d => <option key={d} value={d}>{d}</option>)}
                      {formData.state === 'Telangana' && DISTRICTS_TS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    {errors.district && <span className={styles.error}>{errors.district}</span>}
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Area / Locality *</label>
                    <input type="text" name="area" value={formData.area} onChange={handleChange} placeholder="e.g. Sarpavaram" />
                    {errors.area && <span className={styles.error}>{errors.area}</span>}
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Pincode *</label>
                    <input type="number" name="pincode" value={formData.pincode} onChange={handleChange} placeholder="e.g. 533005" />
                    {errors.pincode && <span className={styles.error}>{errors.pincode}</span>}
                  </div>
                </div>
              </div>

              <div className={styles.formSection}>
                <h3 className={styles.sectionTitle}>Service Required</h3>
                <div className={styles.inputGrid}>
                  <div className={styles.inputGroup}>
                    <label>Service Type *</label>
                    <select name="serviceType" value={formData.serviceType} onChange={handleChange}>
                      <option value="">Select Service</option>
                      {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {errors.serviceType && <span className={styles.error}>{errors.serviceType}</span>}
                  </div>
                </div>
              </div>

              <div className={styles.formSection}>
                <label className={styles.checkboxLabel}>
                  <input type="checkbox" name="consent" checked={formData.consent} onChange={handleChange} />
                  I Agree To Be Contacted By BENVA Healthcare Regarding This Service Request.
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
            <h2 className={styles.successHeading}>Thank You For Your Enquiry</h2>
            <p className={styles.successText}>Our Healthcare Team Will Contact You Shortly To Confirm Your Booking.</p>
            
            <div className={styles.successActions}>
              <button className={styles.secondaryBtn} onClick={closeForm}>Back To Home</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
