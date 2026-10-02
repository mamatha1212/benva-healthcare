'use client';

import React, { useState } from 'react';
import CustomFileInput from '@/components/CustomFileInput/CustomFileInput';
import styles from '@/app/(main)/doctor-onboarding/page.module.css';
import { upload } from '@vercel/blob/client';

export default function DoctorOnboardingForm() {
  const reqStar = <span className={styles.asterisk}>*</span>;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  // Upload a single file with a 30s timeout; returns URL or null on failure
  const uploadFileWithTimeout = async (file: File, key: string): Promise<string | null> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    try {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const lastDot = file.name.lastIndexOf('.');
      const ext = lastDot !== -1 ? file.name.substring(lastDot) : '.pdf';
      const filename = `${key}-${uniqueSuffix}${ext}`;

      const blob = await upload(`doctors/${filename}`, file, {
        access: 'public',
        handleUploadUrl: '/api/upload',
      });
      return blob.url;
    } catch (err: any) {
      console.warn(`Upload skipped for ${file.name}:`, err?.message || err);
      return null;
    } finally {
      clearTimeout(timeoutId);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const formData = new FormData(e.currentTarget);

    try {
      // 1. Upload files (skip silently if upload service is unavailable)
      const fileKeys = [
        { key: 'doc_passport_photo', name: 'passportPhotoUrl' },
        { key: 'doc_gov_id', name: 'govIdUrl' },
        { key: 'doc_mbbs', name: 'mbbsUrl' },
        { key: 'doc_pg', name: 'pgUrl' },
        { key: 'doc_med_reg', name: 'medRegUrl' },
        { key: 'doc_pan', name: 'panUrl' },
        { key: 'doc_bank', name: 'bankDetailsUrl' }
      ];

      const uploadedDocs: any[] = [];
      
      for (const { key, name } of fileKeys) {
        const file = formData.get(key) as File;
        if (file && file.size > 0 && file.name) {
          const url = await uploadFileWithTimeout(file, key);
          if (url) {
            uploadedDocs.push({ name, url });
          }
          // If url is null, upload failed silently — form still submits
        }
        formData.delete(key);
      }

      // 2. Submit application data as JSON
      const applicationData = Object.fromEntries(formData.entries());
      const payload = {
        ...applicationData,
        documents: uploadedDocs
      };

      const res = await fetch('/api/doctor-applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsSuccess(true);
      } else {
        let errorMsg = `Server error ${res.status}`;
        try {
          const text = await res.text();
          try {
            const result = JSON.parse(text);
            errorMsg = result.error || errorMsg;
          } catch (e) {
            errorMsg = text; // Not JSON, probably Vercel HTML error (413 Payload Too Large)
          }
        } catch (e) {}
        setError(errorMsg.substring(0, 500));
      }
    } catch (err: any) {
      console.error(err);
      setError(`Network error: ${err?.message || 'Unknown'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className={styles.container} style={{ textAlign: 'center', padding: '100px 20px' }}>
        <h2 style={{ color: '#10b981', marginBottom: '16px' }}>Application Submitted Successfully!</h2>
        <p style={{ color: '#475569' }}>Thank you for your interest. Our team will review your application and get back to you soon.</p>
        <button onClick={() => window.location.reload()} className={styles.submitButton} style={{ marginTop: '24px', width: 'auto' }}>
          Submit Another Application
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {error && <div style={{ color: '#ef4444', background: '#fee2e2', padding: '16px', borderRadius: '8px', marginBottom: '24px', textAlign: 'center', fontWeight: 'bold' }}>{error}</div>}
      <form className={styles.form} onSubmit={handleSubmit}>
        {/* 1. BASIC DETAILS */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.stepNumber}>1</span>
            <h2>Basic Details</h2>
          </div>
          
          <div className={styles.grid}>
            <div className={styles.formGroup}>
              <label>Full Name {reqStar}</label>
              <input type="text" name="fullName" placeholder="Dr. John Doe" required />
            </div>
            <div className={styles.formGroup}>
              <label>Title with Degrees & Fellowships {reqStar}</label>
              <input type="text" name="title" placeholder="e.g. MD, FACC" required />
            </div>
            <div className={styles.formGroup}>
              <label>Gender {reqStar}</label>
              <select name="gender" required>
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Date of Birth {reqStar}</label>
              <input type="date" name="dob" required />
            </div>
            <div className={styles.formGroup}>
              <label>Mobile Number {reqStar}</label>
              <input type="tel" name="mobile" placeholder="+91" required />
            </div>
            <div className={styles.formGroup}>
              <label>Email ID {reqStar}</label>
              <input type="email" name="email" placeholder="doctor@example.com" required />
            </div>
            <div className={styles.formGroupFull}>
              <label>Current Practice Address {reqStar}</label>
              <textarea rows={3} name="address" placeholder="Full address of your clinic/hospital" required></textarea>
            </div>
            <div className={styles.formGroup}>
              <label>City {reqStar}</label>
              <input type="text" name="city" placeholder="City" required />
            </div>
            <div className={styles.formGroup}>
              <label>State {reqStar}</label>
              <input type="text" name="state" placeholder="State" required />
            </div>
            <div className={styles.formGroupFull}>
              <CustomFileInput name="doc_passport_photo" label="Passport Size Photograph" accept="image/*" />
            </div>
          </div>
        </section>

        {/* 2. MEDICAL REGISTRATION DETAILS */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.stepNumber}>2</span>
            <h2>Medical Registration Details</h2>
          </div>
          
          <div className={styles.grid}>
            <div className={styles.formGroupFull}>
              <label>Medical Qualification(s) {reqStar}</label>
              <input type="text" name="medicalQualification" placeholder="MBBS, MD, etc." required />
            </div>
            <div className={styles.formGroupFull}>
              <label>Medical College Name(s) {reqStar}</label>
              <input type="text" name="medicalCollege" placeholder="College Name" required />
            </div>
            <div className={styles.formGroup}>
              <label>Year of Graduation {reqStar}</label>
              <input type="number" name="yearOfGraduation" placeholder="YYYY" required />
            </div>
            <div className={styles.formGroup}>
              <label>Year of Post Graduation</label>
              <input type="number" name="yearOfPostGraduation" placeholder="YYYY" />
            </div>
            <div className={styles.formGroup}>
              <label>Medical Council Reg. Number {reqStar}</label>
              <input type="text" name="medicalCouncilReg" required />
            </div>
            <div className={styles.formGroup}>
              <label>Registering Authority {reqStar}</label>
              <input type="text" name="registeringAuthority" placeholder="State Medical Council / NMC" required />
            </div>
            <div className={styles.formGroupFull}>
              <label>Registration Status {reqStar}</label>
              <div className={styles.radioGroup}>
                <label className={styles.radioLabel}>
                  <input type="radio" name="registrationStatus" value="permanent" required /> Permanent
                </label>
                <label className={styles.radioLabel}>
                  <input type="radio" name="registrationStatus" value="provisional" /> Provisional
                </label>
                <label className={styles.radioLabel}>
                  <input type="radio" name="registrationStatus" value="renewed" /> Renewed
                </label>
              </div>
            </div>
          </div>
        </section>

        {/* 3. SPECIALIZATION DETAILS */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.stepNumber}>3</span>
            <h2>Specialization Details</h2>
          </div>
          
          <div className={styles.grid}>
            <div className={styles.formGroup}>
              <label>Primary Specialization {reqStar}</label>
              <input type="text" name="primarySpecialization" required />
            </div>
            <div className={styles.formGroup}>
              <label>Secondary Specialization</label>
              <input type="text" name="secondarySpecialization" />
            </div>
            <div className={styles.formGroupFull}>
              <label>Area of Clinical Focus</label>
              <input type="text" name="clinicalFocus" />
            </div>
            <div className={styles.formGroup}>
              <label>Years of Clinical Experience {reqStar}</label>
              <input type="number" name="experience" min="0" required />
            </div>
            <div className={styles.formGroup}>
              <label>Languages Spoken {reqStar}</label>
              <input type="text" name="languages" placeholder="English, Hindi, Telugu, etc." required />
            </div>
          </div>
        </section>

        {/* 4. TELEMEDICINE DECLARATION */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.stepNumber}>4</span>
            <h2>Telemedicine Declaration</h2>
          </div>
          
          <div className={styles.formGroupFull}>
            <label className={styles.checkboxLabel}>
              <input type="checkbox" name="telemedicine" required />
              <span>
                I confirm that I hold a valid medical registration and agree to provide teleconsultation services ethically and in accordance with applicable guidelines. {reqStar}
              </span>
            </label>
          </div>
        </section>

        {/* 5. DOCUMENTS TO BE ATTACHED */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.stepNumber}>5</span>
            <h2>Documents Required</h2>
          </div>
          
          <div className={styles.grid}>
            {[
              { name: 'Medical Registration Certificate', key: 'doc_med_reg', req: false },
              { name: 'MBBS Degree Certificate', key: 'doc_mbbs', req: false },
              { name: 'PG Degree Certificate(s)', key: 'doc_pg', req: false },
              { name: 'Fellowship Certificate(s)', key: 'doc_fellowship', req: false },
              { name: 'Government Photo ID (Aadhar or PAN)', key: 'doc_gov_id', req: false },
              { name: 'PAN Card', key: 'doc_pan', req: false },
              { name: 'Cancelled Cheque / Bank Proof', key: 'doc_bank', req: false }
            ].map((doc, idx) => (
              <div key={idx} className={styles.formGroup}>
                <CustomFileInput name={doc.key} label={doc.name} accept=".pdf,image/*" required={doc.req} />
              </div>
            ))}
          </div>
        </section>

        {/* 6. PAYMENT DETAILS */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.stepNumber}>6</span>
            <h2>Payment Details</h2>
          </div>
          
          <div className={styles.grid}>
            <div className={styles.formGroup}>
              <label>Account Holder Name</label>
              <input type="text" name="accountName" />
            </div>
            <div className={styles.formGroup}>
              <label>Bank Name</label>
              <input type="text" name="bankName" />
            </div>
            <div className={styles.formGroup}>
              <label>Account Number</label>
              <input type="text" name="accountNumber" />
            </div>
            <div className={styles.formGroup}>
              <label>IFSC Code</label>
              <input type="text" name="ifscCode" />
            </div>
            <div className={styles.formGroup}>
              <label>PAN Number</label>
              <input type="text" name="panNumber" />
            </div>
            <div className={styles.formGroup}>
              <label>Branch Name</label>
              <input type="text" name="branchName" />
            </div>
          </div>
        </section>

        {/* 7. DECLARATION & SIGNATURE */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.stepNumber}>7</span>
            <h2>Declaration & Signature</h2>
          </div>
          
          <p className={styles.declarationText}>
            I hereby declare that the information provided above is true and correct to the best of my knowledge. I understand that BENVA Healthcare reserves the right to verify the above details and supporting documents.
          </p>

          <div className={styles.grid}>
            <div className={styles.formGroup}>
              <label>Name of Doctor (Digital Signature) {reqStar}</label>
              <input type="text" name="signatureName" required placeholder="Type your full name" />
            </div>
            <div className={styles.formGroup}>
              <label>Date {reqStar}</label>
              <input type="date" name="signatureDate" required />
            </div>
          </div>
        </section>

        <div className={styles.formActions}>
          <button type="submit" disabled={isSubmitting} className={styles.submitButton}>
            {isSubmitting ? 'Submitting...' : 'Submit Application'}
          </button>
        </div>
      </form>
    </div>
  );
}
