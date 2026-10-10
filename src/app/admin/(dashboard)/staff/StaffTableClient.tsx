'use client';

import React, { useState, useEffect } from 'react';
import styles from '../page.module.css';

const MODULES = [
  'PATIENTS',
  'ALL_LEADS',
  'HEALTH_CHECKUPS',
  'MEMBERSHIPS',
  'DIET_PLANS',
  'AREA_ENQUIRIES',
  'CONTACT_MESSAGES',
  'CALLBACK_REQUESTS',
  'DOCTOR_APPLICATIONS',
  'FREE_CONSULTATIONS',
  'MANAGE_DOCTORS',
  'DR_PAYOUTS',
  'PATIENT_RECORDS',
  'PRESCRIPTIONS',
  'REPORTS',
  'STATIC_PAGES'
];

export default function StaffTableClient({ staffMembers }: { staffMembers: any[] }) {
  const [editingPermissionsFor, setEditingPermissionsFor] = useState<any>(null);
  const [selectedModule, setSelectedModule] = useState('PATIENTS');
  
  // This state will hold the form edits before they hit the server
  const [permissionsState, setPermissionsState] = useState({
    canView: false,
    canAdd: false,
    canEdit: false,
    canDelete: false,
    fieldAccess: {
      patientName: true,
      mobileNumber: true,
      address: true,
      medicalHistory: true,
    }
  });

  const loadModulePermissions = (staff: any, moduleName: string) => {
    const existingPerm = staff.permissions.find((p: any) => p.moduleName === moduleName);
    if (existingPerm) {
      setPermissionsState({
        canView: existingPerm.canView,
        canAdd: existingPerm.canAdd,
        canEdit: existingPerm.canEdit,
        canDelete: existingPerm.canDelete,
        fieldAccess: existingPerm.fieldAccess || { patientName: true, mobileNumber: true, address: true, medicalHistory: true }
      });
    } else {
      setPermissionsState({
        canView: false,
        canAdd: false,
        canEdit: false,
        canDelete: false,
        fieldAccess: { patientName: true, mobileNumber: true, address: true, medicalHistory: true }
      });
    }
  };

  const openPermissionsModal = (staff: any) => {
    setEditingPermissionsFor(staff);
    setSelectedModule('PATIENTS');
    loadModulePermissions(staff, 'PATIENTS');
  };

  const handleModuleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newModule = e.target.value;
    setSelectedModule(newModule);
    if (editingPermissionsFor) {
      loadModulePermissions(editingPermissionsFor, newModule);
    }
  };

  const savePermissions = async () => {
    try {
      const res = await fetch('/api/admin/staff/permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staffId: editingPermissionsFor.id,
          moduleName: selectedModule,
          permissions: permissionsState
        })
      });
      if (res.ok) {
        alert(`${selectedModule} permissions updated successfully!`);
        window.location.reload();
      } else {
        alert('Failed to update permissions');
      }
    } catch (err) {
      alert('Error updating permissions');
    }
  };

  return (
    <>
      <div className={styles.tableContainer}>
        {staffMembers.length === 0 ? (
          <div className={styles.emptyState}>
            No staff members found. Click "Add New Staff" to get started.
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Employee ID</th>
                <th className={styles.th}>Name</th>
                <th className={styles.th}>Role</th>
                <th className={styles.th}>Modules Assigned</th>
                <th className={styles.th}>Status</th>
                <th className={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {staffMembers.map((staff) => (
                <tr key={staff.id} className={styles.tr}>
                  <td className={styles.td}>
                    <span style={{ fontWeight: 600, color: '#3b82f6' }}>{staff.employeeId}</span>
                  </td>
                  <td className={styles.td}>
                    <div style={{ fontWeight: 600, color: '#1e293b' }}>{staff.name}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{staff.email}</div>
                  </td>
                  <td className={styles.td}>
                    <div style={{ fontWeight: 500 }}>{staff.designation}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{staff.department}</div>
                  </td>
                  <td className={styles.td}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {staff.permissions.map((p: any) => (
                        <span key={p.id} style={{
                          background: '#f1f5f9', color: '#475569', padding: '2px 8px', 
                          borderRadius: '4px', fontSize: '11px', fontWeight: 600
                        }}>
                          {p.moduleName}
                        </span>
                      ))}
                      {staff.permissions.length === 0 && (
                        <span style={{ color: '#ef4444', fontSize: '12px' }}>No access</span>
                      )}
                    </div>
                  </td>
                  <td className={styles.td}>
                    <span className={styles.statusBadge} style={{
                      background: staff.status === 'ACTIVE' ? '#dcfce7' : '#fee2e2',
                      color: staff.status === 'ACTIVE' ? '#166534' : '#991b1b',
                      padding: '4px 8px', borderRadius: '12px', fontSize: '12px'
                    }}>
                      {staff.status}
                    </span>
                  </td>
                  <td className={styles.td}>
                    <button onClick={() => openPermissionsModal(staff)} style={{
                      padding: '6px 12px', border: '1px solid #cbd5e1', background: 'white', 
                      borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 500, color: '#334155'
                    }}>
                      Edit Permissions
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {editingPermissionsFor && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: '12px', width: '100%', maxWidth: '500px' }}>
            <h2 style={{ marginTop: 0, color: '#0f172a' }}>Edit Permissions: {editingPermissionsFor.name}</h2>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>Configure exactly what this staff member can see and do.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* MODULE SELECTOR */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>Select Module to Configure:</label>
                <select value={selectedModule} onChange={handleModuleChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', color: '#0f172a', backgroundColor: '#f8fafc' }}>
                  {MODULES.map(m => (
                    <option key={m} value={m}>{m.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>

              {/* ACTION PERMISSIONS */}
              <div>
                <h4 style={{ margin: '0 0 12px 0', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', color: '#0f172a' }}>Action Permissions ({selectedModule.replace(/_/g, ' ')})</h4>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#334155', fontSize: '14px' }}>
                  <input type="checkbox" checked={permissionsState.canView} onChange={e => setPermissionsState({...permissionsState, canView: e.target.checked})} />
                  Can View Module
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#334155', fontSize: '14px' }}>
                  <input type="checkbox" checked={permissionsState.canAdd} onChange={e => setPermissionsState({...permissionsState, canAdd: e.target.checked})} />
                  Can Add Records
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#334155', fontSize: '14px' }}>
                  <input type="checkbox" checked={permissionsState.canEdit} onChange={e => setPermissionsState({...permissionsState, canEdit: e.target.checked})} />
                  Can Edit Records
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#334155', fontSize: '14px' }}>
                  <input type="checkbox" checked={permissionsState.canDelete} onChange={e => setPermissionsState({...permissionsState, canDelete: e.target.checked})} />
                  Can Delete Records
                </label>
              </div>
              {/* FIELD LEVEL PERMISSIONS */}
              {selectedModule === 'PATIENTS' && (
                <div>
                  <h4 style={{ margin: '0 0 12px 0', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', color: '#0f172a' }}>Field-Level Access (Hide/Show Columns)</h4>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#334155', fontSize: '14px' }}>
                    <input type="checkbox" checked={permissionsState.fieldAccess.patientName} onChange={e => setPermissionsState({...permissionsState, fieldAccess: {...permissionsState.fieldAccess, patientName: e.target.checked}})} />
                    Show Patient Name
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#334155', fontSize: '14px' }}>
                    <input type="checkbox" checked={permissionsState.fieldAccess.mobileNumber} onChange={e => setPermissionsState({...permissionsState, fieldAccess: {...permissionsState.fieldAccess, mobileNumber: e.target.checked}})} />
                    Show Mobile Number
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#334155', fontSize: '14px' }}>
                    <input type="checkbox" checked={permissionsState.fieldAccess.address} onChange={e => setPermissionsState({...permissionsState, fieldAccess: {...permissionsState.fieldAccess, address: e.target.checked}})} />
                    Show Address
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#334155', fontSize: '14px' }}>
                    <input type="checkbox" checked={permissionsState.fieldAccess.medicalHistory} onChange={e => setPermissionsState({...permissionsState, fieldAccess: {...permissionsState.fieldAccess, medicalHistory: e.target.checked}})} />
                    Show Medical History
                  </label>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
              <button onClick={() => setEditingPermissionsFor(null)} style={{ flex: 1, padding: '10px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
              <button onClick={savePermissions} style={{ flex: 1, padding: '10px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Save Permissions</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
