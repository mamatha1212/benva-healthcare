'use client';
import React, { useState } from 'react';
import styles from './BookCheckupClient.module.css';

interface BookCheckupClientProps {
  availablePackages: { title: string; price: string | null }[];
  initialLocations: any[];
}

export default function BookCheckupClient({ availablePackages, initialLocations }: BookCheckupClientProps) {
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
    packageTitle: '',
    packagePrice: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const locations = initialLocations;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name === 'packageTitle') {
      const selectedPkg = availablePackages.find(p => p.title === value);
      setFormData(prev => ({ ...prev, packageTitle: value, packagePrice: selectedPkg?.price || '' }));
    } else if (name === 'state') {
      setFormData(prev => ({ ...prev, state: value, district: '', area: '' }));
    } else if (name === 'district') {
      setFormData(prev => ({ ...prev, district: value, area: '' }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
      }));
    }

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
    if (!formData.packageTitle) newErrors.packageTitle = 'Package is required';
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
          body: JSON.stringify(formData)
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
      packageTitle: '', packagePrice: ''
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.heading}>Book Your Health Checkup</h1>
        <p className={styles.subHeading}>Share your details and we'll confirm your booking shortly.</p>
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
              <input type="tel" name="whatsapp" placeholder="e.g. 9876543210" value={formData.whatsapp} onChange={handleInputChange} className={styles.input} />
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
          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label className={styles.label}>State <span>*</span></label>
              <select name="state" value={formData.state} onChange={handleInputChange} className={`${styles.input} ${errors.state ? styles.error : ''}`}>
                <option value="">Select State</option>
                {locations.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
              </select>
              {errors.state && <span className={styles.errorText}>{errors.state}</span>}
            </div>
            <div className={styles.field}>
              <label className={styles.label}>District <span>*</span></label>
              <select name="district" value={formData.district} onChange={handleInputChange} disabled={!formData.state} className={`${styles.input} ${errors.district ? styles.error : ''}`}>
                <option value="">{formData.state ? 'Select District' : 'Please select state first'}</option>
                {locations.find(s => s.name === formData.state)?.districts.map((d: any) => (
                  <option key={d.id} value={d.name}>{d.name}</option>
                ))}
              </select>
              {errors.district && <span className={styles.errorText}>{errors.district}</span>}
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Area / Locality <span>*</span></label>
              <select name="area" value={formData.area} onChange={handleInputChange} disabled={!formData.district} className={`${styles.input} ${errors.area ? styles.error : ''}`}>
                <option value="">{formData.district ? 'Select Area' : 'Please select district first'}</option>
                {locations.find(s => s.name === formData.state)?.districts.find((d: any) => d.name === formData.district)?.areas.map((a: any) => (
                  <option key={a.id} value={a.name}>{a.name}</option>
                ))}
              </select>
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
          <div className={styles.groupTitle}>Select Package</div>
          <div className={styles.formGrid}>
            <div className={styles.field} style={{ gridColumn: '1 / -1' }}>
              <label className={styles.label}>Health Package <span>*</span></label>
              <select name="packageTitle" value={formData.packageTitle} onChange={handleInputChange} className={`${styles.input} ${errors.packageTitle ? styles.error : ''}`}>
                <option value="">Select Package</option>
                {availablePackages.map((pkg, idx) => (
                  <option key={idx} value={pkg.title}>{pkg.title}</option>
                ))}
              </select>
              {errors.packageTitle && <span className={styles.errorText}>{errors.packageTitle}</span>}
            </div>
            {formData.packageTitle && formData.packagePrice && (
              <div className={styles.packageBox}>
                <span className={styles.packageTitle}>{formData.packageTitle}</span>
                <span className={styles.packagePrice}>₹{formData.packagePrice}</span>
              </div>
            )}
          </div>
        </div>

        <label className={styles.consentField}>
          <input type="checkbox" name="consent" checked={formData.consent} onChange={handleInputChange} />
          <span className={styles.consentText}>I Agree To Be Contacted By BENVA Healthcare Regarding My Health Checkup Request.</span>
        </label>
        {errors.consent && <div className={styles.errorText} style={{ marginTop: '-12px', marginBottom: '24px', marginLeft: '32px' }}>{errors.consent}</div>}

        <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit Request'}
        </button>
      </form>

      {/* ── Success Modal ── */}
      {showSuccess && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalCard}>
            <div className={styles.successIcon}>✓</div>
            <h3 className={styles.modalTitle}>Thank You For Submitting Your Details</h3>
            <p className={styles.modalDesc}>Our Healthcare Team Will Contact You Shortly To Confirm Your Booking.</p>
            
            <div className={styles.modalActions}>
              <a href="/" className={styles.submitBtn} style={{ textDecoration: 'none', display: 'inline-block' }}>Back To Home</a>
              <button className={styles.btnSecondary} onClick={resetForm}>Book Another Service</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
