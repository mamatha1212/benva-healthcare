'use client';
import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from './BookCheckupClient.module.css';
import { useLocations } from '@/hooks/useLocations';
import SearchableSelect from '@/components/SearchableSelect/SearchableSelect';

interface BookCheckupClientProps {
  availablePackages: { title: string; price: string | null }[];
  initialLocations: any[];
}

export default function BookCheckupClient({ availablePackages, initialLocations }: BookCheckupClientProps) {
  const searchParams = useSearchParams();
  const initPackageTitle = searchParams.get('packageTitle') || '';
  const initPackagePrice = searchParams.get('packagePrice') || '';

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
    packageTitle: initPackageTitle,
    packagePrice: initPackagePrice,
    selectedOffice: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Area check states
  const [isCheckingArea, setIsCheckingArea] = useState(false);
  const [availableAreas, setAvailableAreas] = useState<any[]>([]);
  const [showAreaSelect, setShowAreaSelect] = useState(false);
  const [checkAreaMessage, setCheckAreaMessage] = useState('');

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
    } else if (name === 'pincode') {
      setFormData(prev => ({ ...prev, pincode: value, selectedOffice: '' }));
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
    setAvailableAreas([]);
    setShowAreaSelect(false);
    setCheckAreaMessage('');
    setFormData({
      fullName: '', mobile: '', whatsapp: '', email: '', state: '',
      district: '', area: '', pincode: '', age: '', gender: '', consent: false,
      packageTitle: '', packagePrice: '', selectedOffice: ''
    });
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

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.heading}>Book Your Health Checkup</h1>
        <p className={styles.subHeading}>Share your details and we'll confirm your booking shortly.</p>
      </div>

      <form className={styles.formCard} onSubmit={handleSubmit}>
        
        {/* ── Basic Details ── */}
        <div className={styles.formGroup}>
          <div className={styles.groupTitle}>Basic Details</div>
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
          
          <div className={styles.field} style={{ gridColumn: '1 / -1', marginBottom: '16px' }}>
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

        {/* ── Patient Details ── */}
        <div className={styles.formGroup}>
          <div className={styles.groupTitle}>Patient Details</div>
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
          <div className={styles.formGrid}>
            <div className={styles.field} style={{ gridColumn: '1 / -1' }}>
              {formData.packageTitle ? (
                <div className={styles.packageBox}>
                  <span className={styles.packageTitle}>{formData.packageTitle}</span>
                  {formData.packagePrice && <span className={styles.packagePrice}>₹{formData.packagePrice}</span>}
                </div>
              ) : (
                <div style={{ color: '#aaa', padding: '12px', background: '#222', border: '1px solid #333', borderRadius: '8px' }}>
                  No package selected. Please go back and select a package.
                </div>
              )}
              {errors.packageTitle && <span className={styles.errorText}>{errors.packageTitle}</span>}
            </div>
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
