'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { User, FileText, Award, CreditCard, Paperclip, X } from 'lucide-react';

const DetailItem = ({ label, value, isEditing, name, onChange, type = 'text', options }: { label: string, value: React.ReactNode, isEditing?: boolean, name?: string, onChange?: any, type?: string, options?: string[] }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
    <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 700, letterSpacing: '0.08em' }}>{label}</span>
    {isEditing ? (
      type === 'select' && options ? (
        <select name={name} value={value as string || ''} onChange={onChange} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e0', fontSize: '14px', width: '100%', boxSizing: 'border-box' }}>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : type === 'textarea' ? (
        <textarea name={name} value={value as string || ''} onChange={onChange} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e0', fontSize: '14px', minHeight: '80px', width: '100%', boxSizing: 'border-box' }} />
      ) : type === 'readonly' ? (
        <span style={{ fontSize: '15px', color: '#1e293b', fontWeight: 500, lineHeight: '1.4' }}>{value || '-'}</span>
      ) : (
        <input type={type} name={name} value={value as string || ''} onChange={onChange} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e0', fontSize: '14px', width: '100%', boxSizing: 'border-box' }} />
      )
    ) : (
      <span style={{ fontSize: '15px', color: '#1e293b', fontWeight: 500, lineHeight: '1.4' }}>{value || '-'}</span>
    )}
  </div>
);

export default function DoctorApplicationsTableClient({
  applications,
  currentPage,
  pageSize
}: {
  applications: any[];
  currentPage: number;
  pageSize: number;
}) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>(null);
  const [appToDelete, setAppToDelete] = useState<string | null>(null);
  const [localApps, setLocalApps] = useState<any[]>(applications);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const confirmDelete = async () => {
    if (!appToDelete) return;
    try {
      const res = await fetch(`/api/admin/doctor-applications/${appToDelete}`, { method: 'DELETE' });
      if (res.ok) {
        setLocalApps(prev => prev.filter(a => a.id !== appToDelete));
        setAppToDelete(null);
        router.refresh();
      } else alert('Failed to delete');
    } catch (err) { alert('Network error'); }
  };

  const handleSave = async () => {
    if (!editForm) return;
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/admin/doctor-applications/${editForm.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        setLocalApps(prev => prev.map(a => a.id === editForm.id ? editForm : a));
        setSelectedApp(editForm);
        setIsEditing(false);
        router.refresh();
      } else alert('Failed to update');
    } catch (err) { alert('Network error'); }
    setIsUpdating(false);
  };

  // Sync if prop changes
  React.useEffect(() => {
    setLocalApps(applications);
  }, [applications]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    if (!window.confirm(`Are you sure you want to change status to ${newStatus}?`)) return;
    setIsUpdating(true);
    try {
      const res = await fetch('/api/admin/doctor-applications/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) {
        setLocalApps(prev => prev.map(app => app.id === id ? { ...app, status: newStatus } : app));
        router.refresh();
      } else {
        const errData = await res.json().catch(() => null);
        alert(`Failed to update status: ${errData?.details || errData?.error || res.statusText}`);
      }
    } catch (err) {
      alert('Network error');
    } finally {
      setIsUpdating(false);
    }
  };

  if (localApps.length === 0) {
    return <div className={styles.emptyState}>No doctor applications found.</div>;
  }

  return (
    <div>
      {appToDelete && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 10000,
          padding: '20px'
        }}>
          <div style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '400px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', marginBottom: '16px' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
              </div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', color: '#0f172a', fontWeight: '800' }}>Delete Application?</h3>
              <p style={{ margin: '0 0 24px 0', color: '#64748b', fontSize: '15px', lineHeight: '1.5' }}>Are you sure you want to permanently delete this doctor application? This action cannot be undone.</p>
              <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
                <button onClick={() => setAppToDelete(null)} style={{ flex: 1, padding: '12px', borderRadius: '8px', background: '#f1f5f9', color: '#475569', border: 'none', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}>Cancel</button>
                <button onClick={confirmDelete} style={{ flex: 1, padding: '12px', borderRadius: '8px', background: '#ef4444', color: 'white', border: 'none', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedApp && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            background: '#f8fafc',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '850px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Header */}
            <div className={styles.modalHeader}>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.03em' }}>{isEditing ? 'Edit Application' : 'Applicant Details'}</h2>
                <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '14px' }}>{isEditing ? 'Make changes to the application below.' : 'Review the doctor\'s full application below.'}</p>
              </div>
              <button 
                onClick={() => setSelectedApp(null)}
                style={{ background: 'white', border: '1px solid #e2e8f0', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b', transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', flexShrink: 0 }}
                onMouseOver={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.borderColor = '#ef4444'; }}
                onMouseOut={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#64748b'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>
            
            {/* Content Body */}
            <div className={styles.modalContent}>
              
              {/* Section 1: Basic Details */}
              <div className={styles.modalSection}>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ background: '#eff6ff', padding: '8px', borderRadius: '10px', color: '#3b82f6', display: 'flex' }}><User size={18} strokeWidth={2.5} /></div> Basic Details
                </h3>
                
                <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap-reverse' }}>
                  <div style={{ flex: '1 1 250px' }} className={styles.modalGrid}>
                    <DetailItem label="Full Name" name="fullName" value={isEditing ? editForm?.fullName : selectedApp.fullName} isEditing={isEditing} onChange={handleInputChange} />
                    <DetailItem label="Title" name="title" value={isEditing ? editForm?.title : selectedApp.title} isEditing={isEditing} onChange={handleInputChange} />
                    <DetailItem label="Gender" name="gender" value={isEditing ? editForm?.gender : selectedApp.gender} isEditing={isEditing} onChange={handleInputChange} type="select" options={['male', 'female', 'other']} />
                    <DetailItem label="Date of Birth" name="dob" type="date" value={isEditing ? editForm?.dob : selectedApp.dob} isEditing={isEditing} onChange={handleInputChange} />
                    <DetailItem label="Mobile Number" name="mobile" value={isEditing ? editForm?.mobile : selectedApp.mobile} isEditing={isEditing} onChange={handleInputChange} />
                    <DetailItem label="Email Address" name="email" value={isEditing ? editForm?.email : selectedApp.email} isEditing={isEditing} onChange={handleInputChange} type="email" />
                    <DetailItem label="Address" name="address" value={isEditing ? editForm?.address : selectedApp.address} isEditing={isEditing} onChange={handleInputChange} />
                    <DetailItem label="City" name="city" value={isEditing ? editForm?.city : selectedApp.city} isEditing={isEditing} onChange={handleInputChange} />
                    <DetailItem label="State" name="state" value={isEditing ? editForm?.state : selectedApp.state} isEditing={isEditing} onChange={handleInputChange} />
                  </div>

                  {(() => {
                    const passportPhoto = selectedApp.documents?.find((d: any) => d.name === 'Passport Size Photograph');
                    if (passportPhoto) {
                      return (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <div style={{ width: '130px', height: '130px', borderRadius: '50%', overflow: 'hidden', border: '4px solid #eff6ff', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
                            <img src={passportPhoto.url} alt="Passport" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
              </div>

              {/* Section 2: Registration */}
              <div className={styles.modalSection}>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ background: '#ecfdf5', padding: '8px', borderRadius: '10px', color: '#10b981', display: 'flex' }}><FileText size={18} strokeWidth={2.5} /></div> Registration Details
                </h3>
                <div className={styles.modalGrid}>
                  <DetailItem label="Medical Qualification" name="medicalQualification" value={isEditing ? editForm?.medicalQualification : selectedApp.medicalQualification} isEditing={isEditing} onChange={handleInputChange} />
                  <DetailItem label="College/University" name="medicalCollege" value={isEditing ? editForm?.medicalCollege : selectedApp.medicalCollege} isEditing={isEditing} onChange={handleInputChange} />
                  <DetailItem label="Graduation Year" name="yearOfGraduation" value={isEditing ? editForm?.yearOfGraduation : selectedApp.yearOfGraduation} isEditing={isEditing} onChange={handleInputChange} />
                  <DetailItem label="Post Graduation Year" name="yearOfPostGraduation" value={isEditing ? editForm?.yearOfPostGraduation : selectedApp.yearOfPostGraduation || '-'} isEditing={isEditing} onChange={handleInputChange} />
                  <DetailItem label="Council Reg No." name="medicalCouncilReg" value={isEditing ? editForm?.medicalCouncilReg : selectedApp.medicalCouncilReg} isEditing={isEditing} onChange={handleInputChange} />
                  <DetailItem label="Registering Authority" name="registeringAuthority" value={isEditing ? editForm?.registeringAuthority : selectedApp.registeringAuthority} isEditing={isEditing} onChange={handleInputChange} />
                  <DetailItem label="Registration Status" name="registrationStatus" value={isEditing ? editForm?.registrationStatus : selectedApp.registrationStatus} isEditing={isEditing} onChange={handleInputChange} type="select" options={['active', 'expired', 'pending', 'suspended']} />
                </div>
              </div>

              {/* Section 3: Specialization */}
              <div className={styles.modalSection}>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ background: '#f5f3ff', padding: '8px', borderRadius: '10px', color: '#8b5cf6', display: 'flex' }}><Award size={18} strokeWidth={2.5} /></div> Specialization & Experience
                </h3>
                <div className={styles.modalGrid}>
                  <DetailItem label="Primary Specialization" name="primarySpecialization" value={isEditing ? editForm?.primarySpecialization : selectedApp.primarySpecialization} isEditing={isEditing} onChange={handleInputChange} />
                  <DetailItem label="Secondary Specialization" name="secondarySpecialization" value={isEditing ? editForm?.secondarySpecialization : selectedApp.secondarySpecialization || '-'} isEditing={isEditing} onChange={handleInputChange} />
                  <DetailItem label="Clinical Focus" name="clinicalFocus" value={isEditing ? editForm?.clinicalFocus : selectedApp.clinicalFocus || '-'} isEditing={isEditing} onChange={handleInputChange} type="textarea" />
                  <DetailItem label="Years of Experience" name="experience" value={isEditing ? editForm?.experience : selectedApp.experience} isEditing={isEditing} onChange={handleInputChange} type="number" />
                  <DetailItem label="Languages Spoken" name="languages" value={isEditing ? editForm?.languages : selectedApp.languages} isEditing={isEditing} onChange={handleInputChange} />
                  <DetailItem label="Telemedicine" name="telemedicine" value={isEditing ? (editForm?.telemedicine ? 'Yes' : 'No') : (selectedApp.telemedicine ? 'Yes' : 'No')} isEditing={isEditing} onChange={(e: any) => setEditForm({...editForm, telemedicine: e.target.value === 'Yes'})} type="select" options={['Yes', 'No']} />
                </div>
              </div>

              {/* Section 4: Payment */}
              <div className={styles.modalSection}>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ background: '#fffbeb', padding: '8px', borderRadius: '10px', color: '#f59e0b', display: 'flex' }}><CreditCard size={18} strokeWidth={2.5} /></div> Payment & Signature
                </h3>
                <div className={styles.modalGrid}>
                  <DetailItem label="Account Name" name="accountName" value={isEditing ? editForm?.accountName : selectedApp.accountName} isEditing={isEditing} onChange={handleInputChange} />
                  <DetailItem label="Bank Name" name="bankName" value={isEditing ? editForm?.bankName : selectedApp.bankName} isEditing={isEditing} onChange={handleInputChange} />
                  <DetailItem label="Account Number" name="accountNumber" value={isEditing ? editForm?.accountNumber : selectedApp.accountNumber} isEditing={isEditing} onChange={handleInputChange} />
                  <DetailItem label="IFSC Code" name="ifscCode" value={isEditing ? editForm?.ifscCode : selectedApp.ifscCode} isEditing={isEditing} onChange={handleInputChange} />
                  <DetailItem label="PAN Number" name="panNumber" value={isEditing ? editForm?.panNumber : selectedApp.panNumber} isEditing={isEditing} onChange={handleInputChange} />
                  <DetailItem label="Branch Name" name="branchName" value={isEditing ? editForm?.branchName : selectedApp.branchName} isEditing={isEditing} onChange={handleInputChange} />
                  <div style={{ gridColumn: '1 / -1', background: '#f8fafc', padding: '20px', borderRadius: '12px', marginTop: '8px', border: '1px dashed #cbd5e1' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '24px', flexWrap: 'wrap' }}>
                      <DetailItem label="Digital Signature" name="signatureName" value={isEditing ? editForm?.signatureName : selectedApp.signatureName} isEditing={isEditing} onChange={handleInputChange} />
                      <DetailItem label="Signature Date" value={selectedApp.signatureDate} isEditing={isEditing} type="readonly" />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Section 5: Documents */}
              <div className={styles.modalSection}>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ background: '#fdf2f8', padding: '8px', borderRadius: '10px', color: '#ec4899', display: 'flex' }}><Paperclip size={18} strokeWidth={2.5} /></div> Submitted Proofs / Documents
                </h3>
                {selectedApp.documents && selectedApp.documents.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                    {selectedApp.documents.map((doc: any, i: number) => (
                      <a 
                        key={i} 
                        href={doc.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '10px', 
                          padding: '12px 20px', 
                          background: 'white', 
                          border: '1px solid #e2e8f0', 
                          borderRadius: '12px', 
                          textDecoration: 'none', 
                          color: '#334155',
                          fontSize: '14px',
                          fontWeight: '600',
                          transition: 'all 0.2s',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.color = '#3b82f6'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(59,130,246,0.1)'; }}
                        onMouseOut={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#334155'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)'; }}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>
                        {doc.name}
                      </a>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: '32px', textAlign: 'center', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '15px' }}>No documents were attached to this application.</p>
                  </div>
                )}
              </div>
            </div>

            <div style={{ padding: '24px 32px', background: 'white', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px' }}>
              <div>
                {!isEditing && (
                  <button onClick={() => { setEditForm(selectedApp); setIsEditing(true); }} style={{ padding: '10px 24px', borderRadius: '8px', backgroundColor: '#d97706', color: 'white', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>Edit Application</button>
                )}
                {isEditing && (
                  <button onClick={handleSave} disabled={isUpdating} style={{ padding: '10px 24px', borderRadius: '8px', backgroundColor: '#10b981', color: 'white', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '14px', marginRight: '12px' }}>{isUpdating ? 'Saving...' : 'Save Changes'}</button>
                )}
                {isEditing && (
                  <button onClick={() => setIsEditing(false)} style={{ padding: '10px 24px', borderRadius: '8px', backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>Cancel</button>
                )}
              </div>
              <button 
                onClick={() => { setSelectedApp(null); setIsEditing(false); }}
                style={{ padding: '10px 24px', borderRadius: '8px', backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', cursor: 'pointer', fontWeight: '600', fontSize: '14px', transition: 'all 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e2e8f0'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ overflowX: 'auto', width: '100%', WebkitOverflowScrolling: 'touch', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
        <table className={styles.table} style={{ minWidth: '960px' }}>
          <thead>
            <tr className={styles.tr}>
              <th className={styles.th}>S.NO</th>
              <th className={styles.th}>DATE</th>
              <th className={styles.th} style={{ minWidth: '180px' }}>DOCTOR DETAILS</th>
              <th className={styles.th} style={{ minWidth: '220px' }}>QUALIFICATIONS & EXP</th>
              <th className={styles.th} style={{ minWidth: '150px' }}>REGISTRATION</th>
              <th className={styles.th} style={{ minWidth: '240px' }}>CONTACT / LOCATION</th>
              <th className={styles.th}>STATUS</th>
              <th className={styles.th} style={{ minWidth: '140px' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {localApps.map((app, index) => (
              <tr key={app.id} className={styles.tr}>
                <td className={styles.td} style={{ fontWeight: 'bold' }}>
                  {(currentPage - 1) * pageSize + index + 1}
                </td>
                <td className={styles.td} suppressHydrationWarning>
                  {new Date(app.createdAt).toLocaleDateString()}
                </td>
                <td className={styles.td}>
                  <strong>{app.fullName}</strong><br />
                  <span style={{ fontSize: '13px', color: '#4a5568' }}>{app.title}</span><br />
                  <span style={{ fontSize: '12px', color: '#718096' }}>{app.gender} | {app.dob}</span>
                </td>
                <td className={styles.td}>
                  <strong style={{ color: 'var(--color-primary)' }}>{app.primarySpecialization}</strong><br />
                  <span style={{ fontSize: '12px' }}>{app.medicalQualification} ({app.yearOfGraduation})</span><br />
                  <span style={{ fontSize: '12px', color: '#718096' }}>Exp: {app.experience} years | Lang: {app.languages}</span>
                </td>
                <td className={styles.td}>
                  {app.medicalCouncilReg}<br/>
                  <span style={{ fontSize: '12px', color: '#718096' }}>{app.registeringAuthority}</span>
                </td>
                <td className={styles.td}>
                  M: {app.mobile}<br/>
                  <span style={{ fontSize: '12px', color: '#718096' }}>E: {app.email}</span><br/>
                  <span style={{ fontSize: '12px' }}>{app.city}, {app.state}</span>
                </td>
                <td className={styles.td}>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    backgroundColor: app.status === 'ACCEPTED' ? '#c6f6d5' : app.status === 'REJECTED' ? '#fed7d7' : '#feebc8',
                    color: app.status === 'ACCEPTED' ? '#22543d' : app.status === 'REJECTED' ? '#742a2a' : '#7b341e',
                  }}>
                    {app.status}
                  </span>
                </td>
                <td className={styles.td}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', minWidth: '120px' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => { setSelectedApp(app); setIsEditing(false); }}
                        style={{ flex: 1, padding: '8px 4px', borderRadius: '6px', backgroundColor: '#3182ce', color: 'white', border: 'none', fontSize: '12px', cursor: 'pointer', fontWeight: '600', transition: 'background-color 0.2s' }}
                        title="View Details"
                      >
                        View
                      </button>
                      <button
                        onClick={() => { setSelectedApp(app); setEditForm(app); setIsEditing(true); }}
                        style={{ flex: 1, padding: '8px 4px', borderRadius: '6px', backgroundColor: '#d97706', color: 'white', border: 'none', fontSize: '12px', cursor: 'pointer', fontWeight: '600', transition: 'background-color 0.2s' }}
                        title="Edit Details"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setAppToDelete(app.id)}
                        style={{ flex: 1, padding: '8px 4px', borderRadius: '6px', backgroundColor: '#ef4444', color: 'white', border: 'none', fontSize: '12px', cursor: 'pointer', fontWeight: '600', transition: 'background-color 0.2s' }}
                        title="Delete Application"
                      >
                        Del
                      </button>
                    </div>
                    <select 
                      value={app.status} 
                      onChange={(e) => handleStatusChange(app.id, e.target.value)}
                      disabled={isUpdating}
                      style={{
                        padding: '8px 10px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e0',
                        fontSize: '13px',
                        backgroundColor: '#fff',
                        cursor: 'pointer',
                        width: '100%',
                        fontWeight: '500'
                      }}
                    >
                      <option value="PENDING">Pending</option>
                      <option value="ACCEPTED">Accept</option>
                      <option value="REJECTED">Reject</option>
                    </select>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
