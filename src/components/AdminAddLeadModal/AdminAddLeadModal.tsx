'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './AdminAddLeadModal.module.css';
import { useLocations } from '@/hooks/useLocations';

interface AdminAddLeadModalProps {
  onClose: () => void;
  availablePackages: { title: string; price?: string }[];
}

export default function AdminAddLeadModal({ onClose, availablePackages }: AdminAddLeadModalProps) {
  const router = useRouter();
  const { locations } = useLocations();
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    packageTitle: availablePackages[0]?.title || '',
    packagePrice: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'packageTitle') {
      const selectedPkg = availablePackages.find(p => p.title === value);
      setFormData(prev => ({ ...prev, packageTitle: value, packagePrice: selectedPkg?.price || '' }));
    } else if (name === 'state') {
      setFormData(prev => ({ ...prev, state: value, district: '', area: '' }));
    } else if (name === 'district') {
      setFormData(prev => ({ ...prev, district: value, area: '' }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const res = await fetch('/api/book-checkup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        alert('Lead added successfully!');
        router.refresh(); // Refresh page to see new lead
        onClose();
      } else {
        alert('Failed to add lead. Please try again.');
      }
    } catch (error) {
      console.error(error);
      alert('Error adding lead.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>Add New Health Checkup Lead</h2>
          <button className={styles.closeBtn} onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.grid}>
            <div className={styles.formGroup}>
              <label>Full Name *</label>
              <input required name="fullName" value={formData.fullName} onChange={handleChange} />
            </div>
            <div className={styles.formGroup}>
              <label>Mobile Number *</label>
              <input required type="tel" name="mobile" value={formData.mobile} onChange={handleChange} />
            </div>
            <div className={styles.formGroup}>
              <label>WhatsApp Number</label>
              <input type="tel" name="whatsapp" value={formData.whatsapp} onChange={handleChange} />
            </div>
            <div className={styles.formGroup}>
              <label>Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} />
            </div>
            <div className={styles.formGroup}>
              <label>Age</label>
              <input type="number" name="age" value={formData.age} onChange={handleChange} />
            </div>
            <div className={styles.formGroup}>
              <label>Gender</label>
              <select name="gender" value={formData.gender} onChange={handleChange}>
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>State *</label>
              <select required name="state" value={formData.state} onChange={handleChange}>
                <option value="">Select State</option>
                {locations.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>District *</label>
              <select required name="district" value={formData.district} onChange={handleChange} disabled={!formData.state}>
                <option value="">{formData.state ? 'Select District' : 'Please select state first'}</option>
                {locations.find(s => s.name === formData.state)?.districts.map((d: any) => (
                  <option key={d.id} value={d.name}>{d.name}</option>
                ))}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Area / Locality *</label>
              <select required name="area" value={formData.area} onChange={handleChange} disabled={!formData.district}>
                <option value="">{formData.district ? 'Select Area' : 'Please select district first'}</option>
                {locations.find(s => s.name === formData.state)?.districts.find((d: any) => d.name === formData.district)?.areas.map((a: any) => (
                  <option key={a.id} value={a.name}>{a.name}</option>
                ))}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Pincode *</label>
              <input required name="pincode" value={formData.pincode} onChange={handleChange} />
            </div>
            <div className={styles.formGroup}>
              <label>Select Package *</label>
              <select required name="packageTitle" value={formData.packageTitle} onChange={handleChange}>
                <option value="">Select Package</option>
                {availablePackages.map((pkg, idx) => (
                  <option key={idx} value={pkg.title}>{pkg.title}</option>
                ))}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Package Price (optional manually)</label>
              <input name="packagePrice" placeholder="e.g. 1999" value={formData.packagePrice} onChange={handleChange} />
            </div>
          </div>
          
          <div className={styles.actions}>
            <button type="button" onClick={onClose} className={styles.cancelBtn}>Cancel</button>
            <button type="submit" disabled={isSubmitting} className={styles.submitBtn}>
              {isSubmitting ? 'Adding...' : 'Add Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
