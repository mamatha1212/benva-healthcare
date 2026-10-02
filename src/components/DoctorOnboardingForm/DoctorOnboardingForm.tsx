'use client';

import React, { useState } from 'react';
import CustomFileInput from '@/components/CustomFileInput/CustomFileInput';
import styles from '@/app/(main)/doctor-onboarding/page.module.css';

const MOBILE_REGEX = /^(\+91|91)?[6-9]\d{9}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function DoctorOnboardingForm() {
  const reqStar = <span className={styles.asterisk}>*</span>;
  const today = new Date().toISOString().split('T')[0];
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [mobileError, setMobileError] = useState('');
  const [emailError, setEmailError] = useState('');

  const validateMobile = (val: string) => {
    if (!val) return 'Mobile number is required';
    if (!MOBILE_REGEX.test(val.replace(/\s/g, '')))
      return 'Enter a valid 10-digit Indian mobile number (e.g. 9876543210)';
    return '';
  };

  const validateEmail = (val: string) => {
    if (!val) return 'Email is required';
    if (!EMAIL_REGEX.test(val)) return 'Enter a valid email address (e.g. doctor@example.com)';
    return '';
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Run field-level validation before submit
    const form = e.currentTarget;
    const mobileVal = (form.elements.namedItem('mobile') as HTMLInputElement)?.value || '';
    const emailVal = (form.elements.namedItem('email') as HTMLInputElement)?.value || '';
    const mobileErr = validateMobile(mobileVal);
    const emailErr = validateEmail(emailVal);
    setMobileError(mobileErr);
    setEmailError(emailErr);
    if (mobileErr || emailErr) return;

    setIsSubmitting(true);
    setError('');

    try {
      // Send the entire form (including files) as multipart FormData.
      // Files are uploaded to Vercel Blob server-side — no CORS issues.
      const formData = new FormData(e.currentTarget);

      const res = await fetch('/api/doctor-applications', {
        method: 'POST',
        body: formData,
        // Do NOT set Content-Type — browser sets it with the correct boundary
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
          } catch {
            errorMsg = text.substring(0, 500);
          }
        } catch { /* ignore */ }
        setError(errorMsg);
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
              <label>Title with Degrees &amp; Fellowships {reqStar}</label>
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
              <input
                type="tel"
                name="mobile"
                placeholder="e.g. 9876543210 or +919876543210"
                required
                maxLength={13}
                onBlur={(e) => setMobileError(validateMobile(e.target.value))}
                onChange={(e) => { if (mobileError) setMobileError(validateMobile(e.target.value)); }}
                style={mobileError ? { borderColor: '#ef4444', boxShadow: '0 0 0 3px rgba(239,68,68,0.1)' } : {}}
              />
              {mobileError && (
                <span style={{ color: '#ef4444', fontSize: '12px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  ⚠ {mobileError}
                </span>
              )}
            </div>
            <div className={styles.formGroup}>
              <label>Email ID {reqStar}</label>
              <input
                type="email"
                name="email"
                placeholder="doctor@example.com"
                required
                onBlur={(e) => setEmailError(validateEmail(e.target.value))}
                onChange={(e) => { if (emailError) setEmailError(validateEmail(e.target.value)); }}
                style={emailError ? { borderColor: '#ef4444', boxShadow: '0 0 0 3px rgba(239,68,68,0.1)' } : {}}
              />
              {emailError && (
                <span style={{ color: '#ef4444', fontSize: '12px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  ⚠ {emailError}
                </span>
              )}
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
              <select name="state" required>
                <option value="">Select State</option>
                <optgroup label="States">
                  <option value="Andhra Pradesh">Andhra Pradesh</option>
                  <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                  <option value="Assam">Assam</option>
                  <option value="Bihar">Bihar</option>
                  <option value="Chhattisgarh">Chhattisgarh</option>
                  <option value="Goa">Goa</option>
                  <option value="Gujarat">Gujarat</option>
                  <option value="Haryana">Haryana</option>
                  <option value="Himachal Pradesh">Himachal Pradesh</option>
                  <option value="Jharkhand">Jharkhand</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Kerala">Kerala</option>
                  <option value="Madhya Pradesh">Madhya Pradesh</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Manipur">Manipur</option>
                  <option value="Meghalaya">Meghalaya</option>
                  <option value="Mizoram">Mizoram</option>
                  <option value="Nagaland">Nagaland</option>
                  <option value="Odisha">Odisha</option>
                  <option value="Punjab">Punjab</option>
                  <option value="Rajasthan">Rajasthan</option>
                  <option value="Sikkim">Sikkim</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Telangana">Telangana</option>
                  <option value="Tripura">Tripura</option>
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
                  <option value="Uttarakhand">Uttarakhand</option>
                  <option value="West Bengal">West Bengal</option>
                </optgroup>
                <optgroup label="Union Territories">
                  <option value="Andaman and Nicobar Islands">Andaman and Nicobar Islands</option>
                  <option value="Chandigarh">Chandigarh</option>
                  <option value="Dadra and Nagar Haveli and Daman and Diu">Dadra and Nagar Haveli and Daman and Diu</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Jammu and Kashmir">Jammu and Kashmir</option>
                  <option value="Ladakh">Ladakh</option>
                  <option value="Lakshadweep">Lakshadweep</option>
                  <option value="Puducherry">Puducherry</option>
                </optgroup>
              </select>
            </div>

            <div className={styles.formGroupFull}>
              <CustomFileInput name="doc_passport_photo" label="Passport Size Photograph" accept="image/*" required={true} />
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
              { name: 'Medical Registration Certificate', key: 'doc_med_reg', req: true },
              { name: 'MBBS Degree Certificate', key: 'doc_mbbs', req: true },
              { name: 'PG Degree Certificate(s)', key: 'doc_pg', req: false },
              { name: 'Fellowship Certificate(s)', key: 'doc_fellowship', req: false },
              { name: 'Government Photo ID (Aadhar or PAN)', key: 'doc_gov_id', req: true },
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
            <h2>Declaration &amp; Signature</h2>
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
              <label>Date</label>
              <input
                type="date"
                name="signatureDate"
                defaultValue={today}
                readOnly
                suppressHydrationWarning
                style={{ background: '#f1f5f9', cursor: 'not-allowed', color: '#475569' }}
              />
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
