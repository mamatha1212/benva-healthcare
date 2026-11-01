'use client';

import React, { useState, useEffect } from 'react';
import { 
  Save, 
  Loader2, 
  User, 
  FileText, 
  CheckCircle2, 
  UploadCloud, 
  ExternalLink, 
  Trash2, 
  Camera, 
  AlertCircle, 
  ShieldCheck,
  Building,
  GraduationCap
} from 'lucide-react';

interface DocumentItem {
  name: string;
  url: string;
}

const DOCUMENT_SLOTS = [
  { key: 'reg_cert', label: 'Medical Registration Certificate', required: true, hint: 'State Medical Council or NMC Registration' },
  { key: 'mbbs_degree', label: 'MBBS Degree Certificate', required: true, hint: 'Primary medical qualification degree' },
  { key: 'gov_id', label: 'Government Photo ID (Aadhaar or PAN)', required: true, hint: 'Official government identity proof' },
  { key: 'pg_degree', label: 'PG Degree Certificate(s)', required: false, hint: 'MD / MS / DNB / Diploma (if applicable)' },
  { key: 'fellowship', label: 'Fellowship Certificate(s)', required: false, hint: 'Specialization fellowships / certifications' },
  { key: 'bank_proof', label: 'Cancelled Cheque / Bank Proof', required: false, hint: 'Bank account verification proof' },
];

export default function DoctorProfilePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    qualification: '',
    speciality: '',
    medicalCouncilReg: '',
    signature: ''
  });

  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/doctor/profile');
      if (!res.ok) throw new Error('Failed to fetch profile');
      const data = await res.json();
      setFormData({
        name: data.name || '',
        phone: data.phone || '',
        qualification: data.qualification || '',
        speciality: data.speciality || '',
        medicalCouncilReg: data.medicalCouncilReg || '',
        signature: data.signature || ''
      });
      setPhotoUrl(data.photoUrl || null);
      setDocuments(Array.isArray(data.documents) ? data.documents : []);
    } catch (err: any) {
      setError(err.message || 'Error loading profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    setError('');
    setSuccess('');

    try {
      const uploadData = new FormData();
      uploadData.append('file', file);

      const res = await fetch('/api/upload-direct', {
        method: 'POST',
        body: uploadData,
      });

      if (!res.ok) throw new Error('Failed to upload photograph');
      const data = await res.json();
      const url = data.url || data.fileUrl;
      setPhotoUrl(url);
      setSuccess('Photograph uploaded! Click "Save Profile" below to persist changes.');
    } catch (err: any) {
      setError(err.message || 'Error uploading photograph');
    } finally {
      setIsUploadingPhoto(false);
      e.target.value = '';
    }
  };

  const handleDocumentUpload = async (docLabel: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingDoc(docLabel);
    setError('');
    setSuccess('');

    try {
      const uploadData = new FormData();
      uploadData.append('file', file);

      const res = await fetch('/api/upload-direct', {
        method: 'POST',
        body: uploadData,
      });

      if (!res.ok) throw new Error(`Failed to upload ${docLabel}`);
      const data = await res.json();
      const url = data.url || data.fileUrl;

      setDocuments(prev => {
        const withoutCurrent = prev.filter(d => d.name !== docLabel);
        return [...withoutCurrent, { name: docLabel, url }];
      });
      setSuccess(`"${docLabel}" uploaded! Remember to click "Save Profile" below.`);
    } catch (err: any) {
      setError(err.message || `Error uploading ${docLabel}`);
    } finally {
      setUploadingDoc(null);
      e.target.value = '';
    }
  };

  const handleRemoveDocument = (docLabel: string) => {
    if (!window.confirm(`Are you sure you want to remove "${docLabel}"?`)) return;
    setDocuments(prev => prev.filter(d => d.name !== docLabel));
    setSuccess(`Removed "${docLabel}". Click "Save Profile" to update.`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        ...formData,
        photoUrl,
        documents
      };

      const res = await fetch('/api/doctor/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Failed to update profile');
      setSuccess('Profile and documents updated successfully!');
    } catch (err: any) {
      setError(err.message || 'Error saving profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', color: '#02559d' }}>
        <Loader2 className="animate-spin" size={36} />
      </div>
    );
  }

  const uploadedCount = documents.length;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px 16px' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7' }}>
            <User size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Doctor Profile & Verification</h1>
            <p style={{ color: '#64748b', margin: 0, fontSize: '14px' }}>
              Manage your personal practice details and upload verified certificates for administrative approval.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '14px 18px', borderRadius: '10px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', fontWeight: 500 }}>
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', padding: '14px 18px', borderRadius: '10px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', fontWeight: 500 }}>
          <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        
        {/* SECTION 1: PHOTO & BASIC INFO */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '28px', boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px', marginBottom: '24px' }}>
            <User size={18} color="#0284c7" />
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: 0 }}>Doctor Identity & Avatar</h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap', marginBottom: '24px' }}>
            {/* Avatar Frame */}
            <div style={{ position: 'relative', width: '96px', height: '96px', borderRadius: '50%', background: '#f1f5f9', border: '3px solid #e0f2fe', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {photoUrl ? (
                <img src={photoUrl} alt={formData.name || 'Doctor'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <User size={44} color="#94a3b8" />
              )}
              {isUploadingPhoto && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                  <Loader2 className="animate-spin" size={24} />
                </div>
              )}
            </div>

            {/* Photo Action Buttons */}
            <div>
              <p style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>Passport Size Photograph</p>
              <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#64748b' }}>Upload your formal medical profile portrait (JPG, PNG or WEBP).</p>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: '#0284c7', color: 'white', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: isUploadingPhoto ? 'not-allowed' : 'pointer' }}>
                <Camera size={14} />
                {photoUrl ? 'Change Photo' : 'Upload Photo'}
                <input 
                  type="file" 
                  accept="image/*" 
                  disabled={isUploadingPhoto} 
                  onChange={handlePhotoUpload} 
                  style={{ display: 'none' }} 
                />
              </label>
              {photoUrl && (
                <button
                  type="button"
                  onClick={() => setPhotoUrl(null)}
                  style={{ marginLeft: '10px', background: 'none', border: 'none', color: '#ef4444', fontSize: '13px', cursor: 'pointer', fontWeight: 500 }}
                >
                  Remove
                </button>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', color: '#334155', fontWeight: 600 }}>Doctor Full Name *</label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Dr. John Doe"
                style={{ padding: '11px 14px', borderRadius: '8px', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', color: '#0f172a', outline: 'none', fontSize: '14px' }}
                required
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', color: '#334155', fontWeight: 600 }}>Phone Number *</label>
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="9876543210"
                style={{ padding: '11px 14px', borderRadius: '8px', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', color: '#0f172a', outline: 'none', fontSize: '14px' }}
                required
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', color: '#334155', fontWeight: 600 }}>Qualifications</label>
              <input
                name="qualification"
                value={formData.qualification}
                onChange={handleChange}
                placeholder="e.g. MBBS, MD, FRCS"
                style={{ padding: '11px 14px', borderRadius: '8px', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', color: '#0f172a', outline: 'none', fontSize: '14px' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', color: '#334155', fontWeight: 600 }}>Speciality</label>
              <input
                name="speciality"
                value={formData.speciality}
                onChange={handleChange}
                placeholder="e.g. General Physician, Gynaecology"
                style={{ padding: '11px 14px', borderRadius: '8px', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', color: '#0f172a', outline: 'none', fontSize: '14px' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', color: '#334155', fontWeight: 600 }}>Medical Council Reg. No.</label>
              <input
                name="medicalCouncilReg"
                value={formData.medicalCouncilReg}
                onChange={handleChange}
                placeholder="e.g. APMC/12345/2020"
                style={{ padding: '11px 14px', borderRadius: '8px', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', color: '#0f172a', outline: 'none', fontSize: '14px', fontFamily: 'monospace' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', color: '#334155', fontWeight: 600 }}>Digital Signature Text / Name</label>
              <input
                name="signature"
                value={formData.signature}
                onChange={handleChange}
                placeholder="Dr. John Doe"
                style={{ padding: '11px 14px', borderRadius: '8px', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', color: '#0f172a', outline: 'none', fontSize: '14px' }}
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: VERIFICATION PROOFS & DOCUMENTS */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '28px', boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShieldCheck size={20} color="#16a34a" />
              <div>
                <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: 0 }}>Verification Proofs & Certificates</h2>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  Upload valid certificates and proofs. These documents sync automatically with the Benva Admin verification portal.
                </span>
              </div>
            </div>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#0284c7', background: '#e0f2fe', padding: '4px 12px', borderRadius: '20px' }}>
              {uploadedCount} Attached
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {DOCUMENT_SLOTS.map((slot) => {
              const existingDoc = documents.find(d => d.name === slot.label);
              const isUploadingThis = uploadingDoc === slot.label;
              const isPdf = existingDoc?.url?.toLowerCase().includes('.pdf');

              return (
                <div 
                  key={slot.key}
                  style={{
                    border: existingDoc ? '1.5px solid #86efac' : '1.5px dashed #cbd5e1',
                    borderRadius: '12px',
                    padding: '16px',
                    backgroundColor: existingDoc ? '#f0fdf4' : '#f8fafc',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '140px',
                    transition: 'all 0.2s'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '6px' }}>
                      <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a', lineHeight: 1.3 }}>
                        {slot.label} {slot.required && <span style={{ color: '#ef4444' }}>*</span>}
                      </span>
                      {existingDoc ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '11px', fontWeight: 700, color: '#16a34a', background: '#dcfce7', padding: '2px 8px', borderRadius: '10px', flexShrink: 0 }}>
                          <CheckCircle2 size={12} /> Uploaded
                        </span>
                      ) : (
                        <span style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', background: '#f1f5f9', padding: '2px 8px', borderRadius: '10px', flexShrink: 0 }}>
                          Missing
                        </span>
                      )}
                    </div>
                    <p style={{ margin: '0 0 14px 0', fontSize: '12px', color: '#64748b' }}>{slot.hint}</p>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                    {existingDoc ? (
                      <>
                        <a 
                          href={existingDoc.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 700, color: '#0284c7', textDecoration: 'none' }}
                        >
                          <FileText size={13} /> View {isPdf ? 'PDF' : 'File'} <ExternalLink size={11} />
                        </a>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <label style={{ cursor: isUploadingThis ? 'not-allowed' : 'pointer', fontSize: '12px', fontWeight: 600, color: '#475569', background: '#ffffff', border: '1px solid #cbd5e1', padding: '4px 8px', borderRadius: '6px' }}>
                            {isUploadingThis ? 'Uploading...' : 'Replace'}
                            <input 
                              type="file" 
                              accept=".pdf,image/*" 
                              disabled={isUploadingThis} 
                              onChange={(e) => handleDocumentUpload(slot.label, e)} 
                              style={{ display: 'none' }} 
                            />
                          </label>

                          <button
                            type="button"
                            onClick={() => handleRemoveDocument(slot.label)}
                            title="Remove Document"
                            style={{ background: 'none', border: 'none', color: '#ef4444', padding: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </>
                    ) : (
                      <label style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        width: '100%',
                        padding: '8px 12px',
                        background: '#0284c7',
                        color: 'white',
                        borderRadius: '8px',
                        fontSize: '12.5px',
                        fontWeight: 600,
                        cursor: isUploadingThis ? 'not-allowed' : 'pointer',
                        opacity: isUploadingThis ? 0.7 : 1
                      }}>
                        {isUploadingThis ? (
                          <>
                            <Loader2 className="animate-spin" size={14} /> Uploading...
                          </>
                        ) : (
                          <>
                            <UploadCloud size={14} /> Choose File (.pdf, .jpg, .png)
                          </>
                        )}
                        <input 
                          type="file" 
                          accept=".pdf,image/*" 
                          disabled={isUploadingThis} 
                          onChange={(e) => handleDocumentUpload(slot.label, e)} 
                          style={{ display: 'none' }} 
                        />
                      </label>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Any other custom uploaded documents */}
          {documents.filter(d => !DOCUMENT_SLOTS.some(s => s.label === d.name)).length > 0 && (
            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#334155', margin: '0 0 10px 0' }}>Additional Documents:</p>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {documents.filter(d => !DOCUMENT_SLOTS.some(s => s.label === d.name)).map((doc, idx) => (
                  <div key={idx} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#f1f5f9', padding: '6px 12px', borderRadius: '8px', fontSize: '12px' }}>
                    <a href={doc.url} target="_blank" rel="noopener noreferrer" style={{ color: '#0284c7', textDecoration: 'none', fontWeight: 600 }}>
                      {doc.name}
                    </a>
                    <button type="button" onClick={() => handleRemoveDocument(doc.name)} style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer', padding: 0 }}>
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM SAVE BAR */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '14px', backgroundColor: '#ffffff', padding: '20px 28px', borderRadius: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #f1f5f9' }}>
          <button
            type="submit"
            disabled={isSaving}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 28px',
              backgroundColor: '#0284c7',
              color: '#ffffff',
              borderRadius: '9px',
              fontWeight: 700,
              fontSize: '14px',
              border: 'none',
              cursor: isSaving ? 'not-allowed' : 'pointer',
              opacity: isSaving ? 0.7 : 1,
              boxShadow: '0 4px 10px rgba(2, 132, 199, 0.25)',
              transition: 'background-color 0.2s'
            }}
          >
            {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            {isSaving ? 'Saving Changes...' : 'Save Profile & Documents'}
          </button>
        </div>

      </form>
    </div>
  );
}
