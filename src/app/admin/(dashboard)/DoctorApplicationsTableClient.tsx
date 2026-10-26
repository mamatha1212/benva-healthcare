'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import modalStyles from './DoctorApplicationsModal.module.css';
import { 
  User, 
  FileText, 
  Award, 
  CreditCard, 
  Paperclip, 
  X, 
  Phone, 
  Mail, 
  MessageSquare, 
  MapPin, 
  Calendar, 
  ExternalLink, 
  Printer, 
  Edit3, 
  ShieldCheck, 
  Stethoscope, 
  CheckCircle2, 
  AlertCircle, 
  Check, 
  Copy,
  Building,
  GraduationCap
} from 'lucide-react';

interface DetailTileProps {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  isEditing?: boolean;
  name?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  type?: 'text' | 'select' | 'textarea' | 'date' | 'email' | 'number' | 'readonly';
  options?: string[];
  fullWidth?: boolean;
  isMono?: boolean;
  action?: { label: string; href?: string; onClick?: () => void };
}

const DetailTile = ({
  label,
  value,
  icon,
  isEditing,
  name,
  onChange,
  type = 'text',
  options,
  fullWidth,
  isMono,
  action
}: DetailTileProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`${modalStyles.detailTile} ${fullWidth ? modalStyles.tileFullWidth : ''}`}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className={modalStyles.tileLabel}>
          {icon}
          {label}
        </span>
        {!isEditing && typeof value === 'string' && value && value !== '-' && isMono && (
          <button
            type="button"
            onClick={() => handleCopy(value)}
            style={{
              background: 'none',
              border: 'none',
              padding: '2px 6px',
              fontSize: '11px',
              color: copied ? '#16a34a' : '#94a3b8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
            title="Copy to clipboard"
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        )}
      </div>

      {isEditing ? (
        type === 'select' && options ? (
          <select
            name={name}
            value={value as string || ''}
            onChange={onChange}
            className={modalStyles.editInput}
          >
            {options.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        ) : type === 'textarea' ? (
          <textarea
            name={name}
            value={value as string || ''}
            onChange={onChange}
            className={modalStyles.editInput}
            style={{ minHeight: '80px', resize: 'vertical' }}
          />
        ) : type === 'readonly' ? (
          <span className={`${modalStyles.tileValue} ${isMono ? modalStyles.tileMono : ''}`}>
            {value || '-'}
          </span>
        ) : (
          <input
            type={type}
            name={name}
            value={value as string || ''}
            onChange={onChange}
            className={modalStyles.editInput}
          />
        )
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
          <span className={`${modalStyles.tileValue} ${isMono ? modalStyles.tileMono : ''}`}>
            {value || '-'}
          </span>
          {action && action.href && (
            <a
              href={action.href}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#0284c7',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px'
              }}
            >
              {action.label} <ExternalLink size={11} />
            </a>
          )}
        </div>
      )}
    </div>
  );
};

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
  const [activeModalTab, setActiveModalTab] = useState<'all' | 'personal' | 'medical' | 'clinical' | 'payment' | 'documents'>('all');

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
        if (selectedApp?.id === appToDelete) setSelectedApp(null);
        router.refresh();
      } else alert('Failed to delete application.');
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
      } else alert('Failed to update application.');
    } catch (err) { alert('Network error'); }
    setIsUpdating(false);
  };

  React.useEffect(() => {
    setLocalApps(applications);
  }, [applications]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    setIsUpdating(true);
    try {
      const res = await fetch('/api/admin/doctor-applications/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) {
        setLocalApps(prev => prev.map(app => app.id === id ? { ...app, status: newStatus } : app));
        if (selectedApp && selectedApp.id === id) {
          setSelectedApp((prev: any) => ({ ...prev, status: newStatus }));
        }
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

  const cleanPhone = (phone?: string) => (phone || '').replace(/[^0-9]/g, '');

  if (localApps.length === 0) {
    return <div className={styles.emptyState}>No doctor applications found.</div>;
  }

  // Get photo if available in documents or photoUrl field
  const passportPhoto = selectedApp?.documents?.find((d: any) => 
    d.name === 'Passport Size Photograph' || d.name?.toLowerCase().includes('passport') || d.name?.toLowerCase().includes('photo')
  )?.url || selectedApp?.photoUrl;

  const docCount = selectedApp?.documents?.length || 0;

  return (
    <div>
      {/* ── DELETE CONFIRMATION MODAL ── */}
      {appToDelete && (
        <div className={modalStyles.modalOverlay}>
          <div style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '420px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <div style={{ padding: '28px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', marginBottom: '16px' }}>
                <AlertCircle size={32} strokeWidth={2.5} />
              </div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', color: '#0f172a', fontWeight: '800' }}>Delete Doctor Application?</h3>
              <p style={{ margin: '0 0 24px 0', color: '#64748b', fontSize: '14px', lineHeight: '1.5' }}>
                Are you sure you want to permanently delete this application? All submitted documents and details will be removed.
              </p>
              <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
                <button 
                  onClick={() => setAppToDelete(null)} 
                  className={modalStyles.btnSecondary}
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete} 
                  className={modalStyles.btnDanger}
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── HIGH-END APPLICANT DETAILS & EDIT MODAL ── */}
      {selectedApp && (
        <div className={modalStyles.modalOverlay} onClick={(e) => {
          if (e.target === e.currentTarget) {
            setSelectedApp(null);
            setIsEditing(false);
          }
        }}>
          <div className={modalStyles.modalContainer}>
            {/* HERO PROFILE BANNER */}
            <div className={modalStyles.heroBanner}>
              <div className={modalStyles.bannerTopRow}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <span className={modalStyles.categoryTag}>
                    <Stethoscope size={14} /> DOCTOR ONBOARDING APPLICATION
                  </span>
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                    Applied {selectedApp.createdAt ? new Date(selectedApp.createdAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                  </span>
                </div>
                <button
                  onClick={() => { setSelectedApp(null); setIsEditing(false); }}
                  className={modalStyles.closeButton}
                  title="Close Window"
                >
                  <X size={18} strokeWidth={2.5} />
                </button>
              </div>

              <div className={modalStyles.profileHero}>
                {/* Doctor Avatar / Photo */}
                <div className={modalStyles.avatarContainer}>
                  {passportPhoto ? (
                    <img src={passportPhoto} alt={selectedApp.fullName} className={modalStyles.avatarImg} />
                  ) : (
                    <span className={modalStyles.avatarFallback}>
                      {selectedApp.fullName ? selectedApp.fullName.replace(/^Dr\.?\s*/i, '').slice(0, 2).toUpperCase() : 'DR'}
                    </span>
                  )}
                </div>

                {/* Doctor Info */}
                <div className={modalStyles.doctorIdentity}>
                  <div className={modalStyles.doctorNameRow}>
                    <h2 className={modalStyles.doctorName}>
                      {isEditing ? editForm?.fullName : selectedApp.fullName}
                    </h2>
                    <span style={{ color: '#38bdf8', display: 'flex', alignItems: 'center' }} title="Verified Application">
                      <CheckCircle2 size={18} />
                    </span>
                    <span className={`${modalStyles.statusPill} ${
                      selectedApp.status === 'ACCEPTED' ? modalStyles.statusAccepted :
                      selectedApp.status === 'REJECTED' ? modalStyles.statusRejected :
                      modalStyles.statusPending
                    }`}>
                      {selectedApp.status === 'ACCEPTED' ? '✓ Accepted Doctor' :
                       selectedApp.status === 'REJECTED' ? '✕ Application Rejected' :
                       '⏳ Pending Review'}
                    </span>
                  </div>

                  <p className={modalStyles.doctorTitle}>
                    {isEditing ? editForm?.title : selectedApp.title} • {isEditing ? editForm?.primarySpecialization : selectedApp.primarySpecialization}
                  </p>

                  <div className={modalStyles.metaTagsRow}>
                    <span className={modalStyles.metaChip}>
                      <Award size={13} style={{ color: '#fbbf24' }} /> {selectedApp.experience || '0'} Years Exp
                    </span>
                    <span className={modalStyles.metaChip}>
                      <MapPin size={13} style={{ color: '#f87171' }} /> {selectedApp.city}, {selectedApp.state}
                    </span>
                    <span className={modalStyles.metaChip}>
                      ⚡ Telemedicine: {selectedApp.telemedicine ? 'Available' : 'No'}
                    </span>
                  </div>
                </div>

                {/* Header Direct Quick Actions */}
                <div className={modalStyles.quickActionsBar}>
                  {selectedApp.mobile && (
                    <>
                      <a
                        href={`https://wa.me/91${cleanPhone(selectedApp.mobile)}?text=${encodeURIComponent(`Hello Dr. ${selectedApp.fullName}, we are contacting you regarding your onboarding application at Benva Healthcare.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${modalStyles.actionBtn} ${modalStyles.actionWhatsApp}`}
                        title="Chat on WhatsApp"
                      >
                        <MessageSquare size={14} /> WhatsApp
                      </a>
                      <a
                        href={`tel:${selectedApp.mobile}`}
                        className={`${modalStyles.actionBtn} ${modalStyles.actionCall}`}
                        title="Call Doctor"
                      >
                        <Phone size={14} /> Call
                      </a>
                    </>
                  )}
                  {selectedApp.email && (
                    <a
                      href={`mailto:${selectedApp.email}?subject=Benva%20Healthcare%20Doctor%20Application`}
                      className={`${modalStyles.actionBtn} ${modalStyles.actionEmail}`}
                      title="Send Email"
                    >
                      <Mail size={14} /> Email
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className={`${modalStyles.actionBtn} ${modalStyles.actionCall}`}
                    title="Print Application"
                  >
                    <Printer size={14} /> Print
                  </button>
                </div>
              </div>
            </div>

            {/* TAB NAVIGATION BAR */}
            <div className={modalStyles.tabsNav}>
              <button
                type="button"
                onClick={() => setActiveModalTab('all')}
                className={`${modalStyles.tabBtn} ${activeModalTab === 'all' ? modalStyles.tabBtnActive : ''}`}
              >
                All Sections
              </button>
              <button
                type="button"
                onClick={() => setActiveModalTab('personal')}
                className={`${modalStyles.tabBtn} ${activeModalTab === 'personal' ? modalStyles.tabBtnActive : ''}`}
              >
                <User size={14} /> Personal & Contact
              </button>
              <button
                type="button"
                onClick={() => setActiveModalTab('medical')}
                className={`${modalStyles.tabBtn} ${activeModalTab === 'medical' ? modalStyles.tabBtnActive : ''}`}
              >
                <FileText size={14} /> Medical & Council
              </button>
              <button
                type="button"
                onClick={() => setActiveModalTab('clinical')}
                className={`${modalStyles.tabBtn} ${activeModalTab === 'clinical' ? modalStyles.tabBtnActive : ''}`}
              >
                <Award size={14} /> Specialization & Focus
              </button>
              <button
                type="button"
                onClick={() => setActiveModalTab('payment')}
                className={`${modalStyles.tabBtn} ${activeModalTab === 'payment' ? modalStyles.tabBtnActive : ''}`}
              >
                <CreditCard size={14} /> Banking & Signature
              </button>
              <button
                type="button"
                onClick={() => setActiveModalTab('documents')}
                className={`${modalStyles.tabBtn} ${activeModalTab === 'documents' ? modalStyles.tabBtnActive : ''}`}
              >
                <Paperclip size={14} /> Proofs & Documents
                <span className={modalStyles.tabBadge}>{docCount}</span>
              </button>
            </div>

            {/* MODAL SCROLLABLE BODY */}
            <div className={modalStyles.modalBody}>
              {/* SECTION 1: PERSONAL & CONTACT */}
              {(activeModalTab === 'all' || activeModalTab === 'personal') && (
                <div className={modalStyles.sectionCard}>
                  <div className={modalStyles.sectionHeader}>
                    <div className={modalStyles.sectionIconWrapper} style={{ background: '#eff6ff', color: '#2563eb' }}>
                      <User size={18} strokeWidth={2.5} />
                    </div>
                    <h3 className={modalStyles.sectionTitle}>Personal & Contact Details</h3>
                  </div>

                  <div className={modalStyles.detailGrid}>
                    <DetailTile 
                      label="Full Name" 
                      name="fullName" 
                      value={isEditing ? editForm?.fullName : selectedApp.fullName} 
                      isEditing={isEditing} 
                      onChange={handleInputChange} 
                    />
                    <DetailTile 
                      label="Professional Title / Suffix" 
                      name="title" 
                      value={isEditing ? editForm?.title : selectedApp.title} 
                      isEditing={isEditing} 
                      onChange={handleInputChange} 
                    />
                    <DetailTile 
                      label="Gender" 
                      name="gender" 
                      value={isEditing ? editForm?.gender : (selectedApp.gender ? selectedApp.gender.charAt(0).toUpperCase() + selectedApp.gender.slice(1) : '-')} 
                      isEditing={isEditing} 
                      onChange={handleInputChange} 
                      type="select" 
                      options={['male', 'female', 'other']} 
                    />
                    <DetailTile 
                      label="Date of Birth" 
                      name="dob" 
                      type="date" 
                      icon={<Calendar size={12} />}
                      value={isEditing ? editForm?.dob : selectedApp.dob} 
                      isEditing={isEditing} 
                      onChange={handleInputChange} 
                    />
                    <DetailTile 
                      label="Mobile Number" 
                      name="mobile" 
                      icon={<Phone size={12} />}
                      value={isEditing ? editForm?.mobile : selectedApp.mobile} 
                      isEditing={isEditing} 
                      onChange={handleInputChange} 
                      isMono
                      action={!isEditing && selectedApp.mobile ? { label: 'Call', href: `tel:${selectedApp.mobile}` } : undefined}
                    />
                    <DetailTile 
                      label="Email Address" 
                      name="email" 
                      icon={<Mail size={12} />}
                      type="email" 
                      value={isEditing ? editForm?.email : selectedApp.email} 
                      isEditing={isEditing} 
                      onChange={handleInputChange} 
                      action={!isEditing && selectedApp.email ? { label: 'Mail', href: `mailto:${selectedApp.email}` } : undefined}
                    />
                    <DetailTile 
                      label="Full Residential / Clinic Address" 
                      name="address" 
                      icon={<MapPin size={12} />}
                      value={isEditing ? editForm?.address : selectedApp.address} 
                      isEditing={isEditing} 
                      onChange={handleInputChange} 
                      fullWidth 
                    />
                    <DetailTile 
                      label="City" 
                      name="city" 
                      value={isEditing ? editForm?.city : selectedApp.city} 
                      isEditing={isEditing} 
                      onChange={handleInputChange} 
                    />
                    <DetailTile 
                      label="State" 
                      name="state" 
                      value={isEditing ? editForm?.state : selectedApp.state} 
                      isEditing={isEditing} 
                      onChange={handleInputChange} 
                    />
                  </div>
                </div>
              )}

              {/* SECTION 2: MEDICAL QUALIFICATION & REGISTRATION */}
              {(activeModalTab === 'all' || activeModalTab === 'medical') && (
                <div className={modalStyles.sectionCard}>
                  <div className={modalStyles.sectionHeader}>
                    <div className={modalStyles.sectionIconWrapper} style={{ background: '#ecfdf5', color: '#059669' }}>
                      <GraduationCap size={18} strokeWidth={2.5} />
                    </div>
                    <h3 className={modalStyles.sectionTitle}>Medical Qualifications & Registration</h3>
                  </div>

                  <div className={modalStyles.detailGrid}>
                    <DetailTile 
                      label="Medical Qualification" 
                      name="medicalQualification" 
                      value={isEditing ? editForm?.medicalQualification : selectedApp.medicalQualification} 
                      isEditing={isEditing} 
                      onChange={handleInputChange} 
                    />
                    <DetailTile 
                      label="Medical College / University" 
                      name="medicalCollege" 
                      icon={<Building size={12} />}
                      value={isEditing ? editForm?.medicalCollege : selectedApp.medicalCollege} 
                      isEditing={isEditing} 
                      onChange={handleInputChange} 
                      fullWidth
                    />
                    <DetailTile 
                      label="Year of Graduation" 
                      name="yearOfGraduation" 
                      value={isEditing ? editForm?.yearOfGraduation : selectedApp.yearOfGraduation} 
                      isEditing={isEditing} 
                      onChange={handleInputChange} 
                    />
                    <DetailTile 
                      label="Post Graduation Year" 
                      name="yearOfPostGraduation" 
                      value={isEditing ? editForm?.yearOfPostGraduation : selectedApp.yearOfPostGraduation || '-'} 
                      isEditing={isEditing} 
                      onChange={handleInputChange} 
                    />
                    <DetailTile 
                      label="Medical Council Registration No." 
                      name="medicalCouncilReg" 
                      value={isEditing ? editForm?.medicalCouncilReg : selectedApp.medicalCouncilReg} 
                      isEditing={isEditing} 
                      onChange={handleInputChange} 
                      isMono
                    />
                    <DetailTile 
                      label="Registering Authority / Council" 
                      name="registeringAuthority" 
                      value={isEditing ? editForm?.registeringAuthority : selectedApp.registeringAuthority} 
                      isEditing={isEditing} 
                      onChange={handleInputChange} 
                    />
                    <DetailTile 
                      label="Registration Status" 
                      name="registrationStatus" 
                      value={isEditing ? editForm?.registrationStatus : selectedApp.registrationStatus} 
                      isEditing={isEditing} 
                      onChange={handleInputChange} 
                      type="select" 
                      options={['active', 'expired', 'pending', 'suspended']} 
                    />
                  </div>
                </div>
              )}

              {/* SECTION 3: SPECIALIZATION & CLINICAL EXPERIENCE */}
              {(activeModalTab === 'all' || activeModalTab === 'clinical') && (
                <div className={modalStyles.sectionCard}>
                  <div className={modalStyles.sectionHeader}>
                    <div className={modalStyles.sectionIconWrapper} style={{ background: '#f5f3ff', color: '#7c3aed' }}>
                      <Award size={18} strokeWidth={2.5} />
                    </div>
                    <h3 className={modalStyles.sectionTitle}>Specialization & Clinical Experience</h3>
                  </div>

                  <div className={modalStyles.detailGrid}>
                    <DetailTile 
                      label="Primary Specialization" 
                      name="primarySpecialization" 
                      value={isEditing ? editForm?.primarySpecialization : selectedApp.primarySpecialization} 
                      isEditing={isEditing} 
                      onChange={handleInputChange} 
                    />
                    <DetailTile 
                      label="Secondary Specialization" 
                      name="secondarySpecialization" 
                      value={isEditing ? editForm?.secondarySpecialization : selectedApp.secondarySpecialization || '-'} 
                      isEditing={isEditing} 
                      onChange={handleInputChange} 
                    />
                    <DetailTile 
                      label="Total Years of Experience" 
                      name="experience" 
                      value={isEditing ? editForm?.experience : `${selectedApp.experience} Years`} 
                      isEditing={isEditing} 
                      onChange={handleInputChange} 
                      type="number" 
                    />
                    <DetailTile 
                      label="Languages Spoken" 
                      name="languages" 
                      value={isEditing ? editForm?.languages : selectedApp.languages} 
                      isEditing={isEditing} 
                      onChange={handleInputChange} 
                    />
                    <DetailTile 
                      label="Telemedicine Available" 
                      name="telemedicine" 
                      value={isEditing ? (editForm?.telemedicine ? 'Yes' : 'No') : (selectedApp.telemedicine ? 'Yes (Online Consultations)' : 'No (In-Clinic Only)')} 
                      isEditing={isEditing} 
                      onChange={(e) => setEditForm({...editForm, telemedicine: e.target.value === 'Yes'})} 
                      type="select" 
                      options={['Yes', 'No']} 
                    />
                    <DetailTile 
                      label="Clinical Focus & Expertise" 
                      name="clinicalFocus" 
                      value={isEditing ? editForm?.clinicalFocus : selectedApp.clinicalFocus || '-'} 
                      isEditing={isEditing} 
                      onChange={handleInputChange} 
                      type="textarea" 
                      fullWidth 
                    />
                  </div>
                </div>
              )}

              {/* SECTION 4: PAYMENT DETAILS & SIGNATURE */}
              {(activeModalTab === 'all' || activeModalTab === 'payment') && (
                <div className={modalStyles.sectionCard}>
                  <div className={modalStyles.sectionHeader}>
                    <div className={modalStyles.sectionIconWrapper} style={{ background: '#fffbeb', color: '#d97706' }}>
                      <CreditCard size={18} strokeWidth={2.5} />
                    </div>
                    <h3 className={modalStyles.sectionTitle}>Banking, Payout & Digital Signature</h3>
                  </div>

                  <div className={modalStyles.detailGrid}>
                    <DetailTile 
                      label="Account Holder Name" 
                      name="accountName" 
                      value={isEditing ? editForm?.accountName : selectedApp.accountName} 
                      isEditing={isEditing} 
                      onChange={handleInputChange} 
                    />
                    <DetailTile 
                      label="Bank Name" 
                      name="bankName" 
                      value={isEditing ? editForm?.bankName : selectedApp.bankName} 
                      isEditing={isEditing} 
                      onChange={handleInputChange} 
                    />
                    <DetailTile 
                      label="Account Number" 
                      name="accountNumber" 
                      value={isEditing ? editForm?.accountNumber : selectedApp.accountNumber} 
                      isEditing={isEditing} 
                      onChange={handleInputChange} 
                      isMono 
                    />
                    <DetailTile 
                      label="IFSC Code" 
                      name="ifscCode" 
                      value={isEditing ? editForm?.ifscCode : selectedApp.ifscCode} 
                      isEditing={isEditing} 
                      onChange={handleInputChange} 
                      isMono 
                    />
                    <DetailTile 
                      label="PAN Card Number" 
                      name="panNumber" 
                      value={isEditing ? editForm?.panNumber : selectedApp.panNumber} 
                      isEditing={isEditing} 
                      onChange={handleInputChange} 
                      isMono 
                    />
                    <DetailTile 
                      label="Bank Branch" 
                      name="branchName" 
                      value={isEditing ? editForm?.branchName : selectedApp.branchName} 
                      isEditing={isEditing} 
                      onChange={handleInputChange} 
                    />
                  </div>

                  {/* VERIFIED DIGITAL SIGNATURE BADGE */}
                  <div className={modalStyles.signatureCertificate}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ background: '#16a34a', color: 'white', padding: '10px', borderRadius: '50%', display: 'flex' }}>
                        <ShieldCheck size={24} />
                      </div>
                      <div>
                        <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#166534', fontWeight: 800, letterSpacing: '0.08em', display: 'block' }}>
                          Verified Digital Signature
                        </span>
                        <p className={modalStyles.signatureDoctorName}>
                          {isEditing ? editForm?.signatureName : selectedApp.signatureName || selectedApp.fullName}
                        </p>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#166534', fontWeight: 700, display: 'block' }}>
                        Submission Timestamp
                      </span>
                      <span style={{ fontSize: '13px', color: '#15803d', fontWeight: 700 }}>
                        {selectedApp.signatureDate || (selectedApp.createdAt ? new Date(selectedApp.createdAt).toLocaleDateString() : '-')}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 5: SUBMITTED DOCUMENTS */}
              {(activeModalTab === 'all' || activeModalTab === 'documents') && (
                <div className={modalStyles.sectionCard}>
                  <div className={modalStyles.sectionHeader}>
                    <div className={modalStyles.sectionIconWrapper} style={{ background: '#fdf2f8', color: '#db2777' }}>
                      <Paperclip size={18} strokeWidth={2.5} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                      <h3 className={modalStyles.sectionTitle}>Submitted Proofs & Documents</h3>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#db2777', background: '#fce7f3', padding: '3px 10px', borderRadius: '12px' }}>
                        {docCount} {docCount === 1 ? 'Attachment' : 'Attachments'}
                      </span>
                    </div>
                  </div>

                  {selectedApp.documents && selectedApp.documents.length > 0 ? (
                    <div className={modalStyles.docGrid}>
                      {selectedApp.documents.map((doc: any, i: number) => {
                        const isPdf = (doc.url || '').toLowerCase().includes('.pdf');
                        return (
                          <div key={i} className={modalStyles.docCard}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
                              <div style={{
                                width: '38px',
                                height: '38px',
                                borderRadius: '8px',
                                background: isPdf ? '#fee2e2' : '#eff6ff',
                                color: isPdf ? '#dc2626' : '#2563eb',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                              }}>
                                <FileText size={20} />
                              </div>
                              <div style={{ overflow: 'hidden' }}>
                                <p style={{ margin: 0, fontSize: '13.5px', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {doc.name || `Document #${i + 1}`}
                                </p>
                                <span style={{ fontSize: '11px', color: '#64748b' }}>
                                  {isPdf ? 'PDF Document' : 'Image File'}
                                </span>
                              </div>
                            </div>
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={modalStyles.docLinkBtn}
                              title="Open in new tab"
                            >
                              View <ExternalLink size={12} />
                            </a>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ padding: '36px 20px', textAlign: 'center', background: '#f8fafc', borderRadius: '12px', border: '1.5px dashed #cbd5e1' }}>
                      <Paperclip size={32} style={{ color: '#94a3b8', marginBottom: '8px' }} />
                      <p style={{ margin: 0, color: '#64748b', fontSize: '14px', fontWeight: 500 }}>
                        No file attachments were uploaded with this application.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* MODAL FOOTER */}
            <div className={modalStyles.modalFooter}>
              <div className={modalStyles.footerActionsLeft}>
                {!isEditing ? (
                  <button
                    type="button"
                    onClick={() => { setEditForm(selectedApp); setIsEditing(true); }}
                    className={modalStyles.btnSecondary}
                  >
                    <Edit3 size={15} /> Edit Application Details
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={isUpdating}
                      className={modalStyles.btnSuccess}
                    >
                      <Check size={16} /> {isUpdating ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className={modalStyles.btnSecondary}
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>

              <div className={modalStyles.footerActionsRight}>
                {selectedApp.status === 'PENDING' && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleStatusChange(selectedApp.id, 'ACCEPTED')}
                      disabled={isUpdating}
                      className={modalStyles.btnSuccess}
                    >
                      <CheckCircle2 size={16} /> Approve & Accept Doctor
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusChange(selectedApp.id, 'REJECTED')}
                      disabled={isUpdating}
                      className={modalStyles.btnDanger}
                    >
                      <X size={16} /> Reject Application
                    </button>
                  </>
                )}
                {selectedApp.status === 'ACCEPTED' && (
                  <button
                    type="button"
                    onClick={() => handleStatusChange(selectedApp.id, 'PENDING')}
                    disabled={isUpdating}
                    className={modalStyles.btnSecondary}
                  >
                    Move Back to Pending
                  </button>
                )}
                {selectedApp.status === 'REJECTED' && (
                  <button
                    type="button"
                    onClick={() => handleStatusChange(selectedApp.id, 'ACCEPTED')}
                    disabled={isUpdating}
                    className={modalStyles.btnSuccess}
                  >
                    Re-Approve Doctor
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => { setSelectedApp(null); setIsEditing(false); }}
                  className={modalStyles.btnSecondary}
                >
                  Close Window
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MAIN TABLE VIEW ── */}
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
