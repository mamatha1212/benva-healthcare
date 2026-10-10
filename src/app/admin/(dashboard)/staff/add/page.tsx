'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './AddStaff.module.css';
import { createStaff } from './actions';

export default function AddStaffPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Basic staff details
  const [staffData, setStaffData] = useState({
    name: '',
    email: '',
    mobileNumber: '',
    department: 'Front Desk',
    designation: 'Receptionist',
    username: '',
    password: ''
  });

  // Default permissions setup
  const [permissions, setPermissions] = useState([
    {
      moduleName: 'PATIENTS',
      canView: false, canAdd: false, canEdit: false, canDelete: false, canExport: false,
      fieldAccess: {
        patientName: true,
        mobileNumber: true,
        address: true,
        medicalHistory: false,
        prescription: false,
        labReports: false
      }
    },
    { moduleName: 'APPOINTMENTS', canView: false, canAdd: false, canEdit: false, canDelete: false, canExport: false, fieldAccess: {} },
    { moduleName: 'ALL_LEADS', canView: false, canAdd: false, canEdit: false, canDelete: false, canExport: false, fieldAccess: {} },
    { moduleName: 'MEMBERSHIPS', canView: false, canAdd: false, canEdit: false, canDelete: false, canExport: false, fieldAccess: {} },
    { moduleName: 'CALLBACK_REQUESTS', canView: false, canAdd: false, canEdit: false, canDelete: false, canExport: false, fieldAccess: {} },
    { moduleName: 'DOCTORS', canView: false, canAdd: false, canEdit: false, canDelete: false, canExport: false, fieldAccess: {} },
    { moduleName: 'PAYOUTS', canView: false, canAdd: false, canEdit: false, canDelete: false, canExport: false, fieldAccess: {} },
    { moduleName: 'PRESCRIPTIONS', canView: false, canAdd: false, canEdit: false, canDelete: false, canExport: false, fieldAccess: {} },
    { moduleName: 'REPORTS', canView: false, canAdd: false, canEdit: false, canDelete: false, canExport: false, fieldAccess: {} },
    { moduleName: 'CONTENT_MANAGEMENT', canView: false, canAdd: false, canEdit: false, canDelete: false, canExport: false, fieldAccess: {} }
  ]);

  const handleStaffChange = (e: any) => {
    setStaffData({ ...staffData, [e.target.name]: e.target.value });
  };

  const handleActionToggle = (moduleIndex: number, action: string) => {
    const updated = [...permissions];
    updated[moduleIndex] = {
      ...updated[moduleIndex],
      [action]: !(updated[moduleIndex] as any)[action]
    };
    setPermissions(updated);
  };

  const handleFieldToggle = (moduleIndex: number, field: string) => {
    const updated = [...permissions];
    updated[moduleIndex].fieldAccess = {
      ...updated[moduleIndex].fieldAccess,
      [field]: !(updated[moduleIndex].fieldAccess as any)[field]
    };
    setPermissions(updated);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Only submit modules where at least 'canView' is enabled to save DB space
    const activePermissions = permissions.filter(p => p.canView);

    const result = await createStaff(staffData, activePermissions);

    if (result.success) {
      alert('Staff Member created successfully with assigned permissions!');
      // router.push('/admin/staff'); // Redirect to staff list (create this later)
      window.location.href = '/admin/staff/add'; // Just refresh for now
    } else {
      setError(result.error || 'Something went wrong');
    }
    
    setLoading(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Add New Staff Member</h1>
        <p className={styles.subtitle}>Create a staff account and meticulously assign their permissions.</p>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <form onSubmit={handleSubmit}>
        {/* Basic Details Section */}
        <div className={styles.card}>
          <h2 className={styles.sectionTitle}>Basic Details</h2>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Full Name</label>
              <input required type="text" name="name" className={styles.input} value={staffData.name} onChange={handleStaffChange} placeholder="e.g. Jane Doe" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Mobile Number</label>
              <input required type="text" name="mobileNumber" className={styles.input} value={staffData.mobileNumber} onChange={handleStaffChange} placeholder="10-digit number" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Email Address</label>
              <input required type="email" name="email" className={styles.input} value={staffData.email} onChange={handleStaffChange} placeholder="jane@benva.in" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Department</label>
              <select name="department" className={styles.input} value={staffData.department} onChange={handleStaffChange}>
                <option value="Front Desk">Front Desk</option>
                <option value="Medical">Medical</option>
                <option value="HR">HR</option>
                <option value="Management">Management</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Designation</label>
              <input required type="text" name="designation" className={styles.input} value={staffData.designation} onChange={handleStaffChange} placeholder="e.g. Receptionist" />
            </div>
          </div>
        </div>

        {/* Login Credentials Section */}
        <div className={styles.card}>
          <h2 className={styles.sectionTitle}>Login Credentials</h2>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Username</label>
              <input required type="text" name="username" className={styles.input} value={staffData.username} onChange={handleStaffChange} placeholder="e.g. janedoe" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Temporary Password</label>
              <input required type="text" name="password" className={styles.input} value={staffData.password} onChange={handleStaffChange} placeholder="Will be forced to change on login" />
            </div>
          </div>
        </div>

        {/* Permissions Section */}
        <div className={styles.card}>
          <h2 className={styles.sectionTitle}>Module & Field Permissions</h2>
          <p className={styles.subtitle} style={{marginBottom: '20px'}}>Select exactly what this user can see and do.</p>
          
          {permissions.map((module, mIndex) => (
            <div key={module.moduleName} className={styles.modulePermission}>
              <div className={styles.moduleHeader}>
                <span className={styles.moduleName}>{module.moduleName} MODULE</span>
              </div>
              
              {/* Action Permissions */}
              <div className={styles.actionsGrid}>
                {['canView', 'canAdd', 'canEdit', 'canDelete', 'canExport'].map(action => (
                  <label key={action} className={styles.checkboxGroup}>
                    <input 
                      type="checkbox" 
                      checked={(module as any)[action]}
                      onChange={() => handleActionToggle(mIndex, action)}
                    />
                    <span className={styles.checkboxLabel}>{action.replace('can', '')}</span>
                  </label>
                ))}
              </div>

              {/* Field Permissions (Only show if there are fields defined for this module) */}
              {Object.keys(module.fieldAccess).length > 0 && (
                <div>
                  <p className={styles.label} style={{marginBottom: '10px'}}>Specific Field Access:</p>
                  <div className={styles.fieldsGrid}>
                    {Object.keys(module.fieldAccess).map(field => (
                      <label key={field} className={styles.fieldItem}>
                        <input 
                          type="checkbox" 
                          checked={(module.fieldAccess as any)[field]}
                          onChange={() => handleFieldToggle(mIndex, field)}
                        />
                        <span className={styles.checkboxLabel}>
                          {field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className={styles.footer}>
          <button type="button" className={styles.btnCancel}>Cancel</button>
          <button type="submit" className={styles.btnSave} disabled={loading}>
            {loading ? 'Creating...' : 'Save & Create Staff'}
          </button>
        </div>
      </form>
    </div>
  );
}
