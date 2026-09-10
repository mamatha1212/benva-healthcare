'use client';

import React, { useState, useOptimistic, startTransition } from 'react';
import { 
  createTestProfile, 
  updateTestProfile, 
  deleteTestProfile,
  addTestParameter,
  deleteTestParameter,
  updateTestParameter,
  toggleProfileInPackage
} from './test-profile-actions';
import styles from '../page.module.css';

type TestParameter = {
  id: string;
  name: string;
};

type TestProfile = {
  id: string;
  name: string;
  parameters: TestParameter[];
};

type HealthPackage = {
  id: string;
  title: string;
  profiles: TestProfile[];
};

export default function TestAdminClient({ 
  packages, 
  profiles 
}: { 
  packages: HealthPackage[], 
  profiles: TestProfile[] 
}) {
  const [activeTab, setActiveTab] = useState<'profiles' | 'assignment'>('profiles');
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(profiles[0]?.id || null);
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null);
  const [editingParameterId, setEditingParameterId] = useState<string | null>(null);
  
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(packages[0]?.id || null);

  const [optimisticPackages, addOptimisticPackageUpdate] = useOptimistic(
    packages,
    (state: HealthPackage[], update: { packageId: string, profile: TestProfile, isLinked: boolean }) => {
      return state.map(pkg => {
        if (pkg.id === update.packageId) {
          if (update.isLinked) {
            return { ...pkg, profiles: pkg.profiles.filter(p => p.id !== update.profile.id) };
          } else {
            return { ...pkg, profiles: [...pkg.profiles, update.profile] };
          }
        }
        return pkg;
      });
    }
  );

  type ProfileUpdateAction = 
    | { type: 'update_profile', id: string, name: string }
    | { type: 'update_parameter', profileId: string, paramId: string, name: string };

  const [optimisticProfiles, dispatchProfileUpdate] = useOptimistic(
    profiles,
    (state, action: ProfileUpdateAction) => {
      switch (action.type) {
        case 'update_profile':
          return state.map(p => p.id === action.id ? { ...p, name: action.name } : p);
        case 'update_parameter':
          return state.map(p => p.id === action.profileId ? { 
            ...p, 
            parameters: p.parameters.map(param => param.id === action.paramId ? { ...param, name: action.name } : param)
          } : p);
        default:
          return state;
      }
    }
  );

  const selectedProfile = optimisticProfiles.find(p => p.id === selectedProfileId);
  const selectedPackage = optimisticPackages.find(p => p.id === selectedPackageId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Tabs */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', flexWrap: 'wrap' }}>
        <button 
          onClick={() => setActiveTab('profiles')}
          style={{ 
            background: activeTab === 'profiles' ? '#2563eb' : 'transparent',
            color: activeTab === 'profiles' ? 'white' : '#64748b',
            border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600
          }}>
          Manage Profiles & Parameters
        </button>
        <button 
          onClick={() => setActiveTab('assignment')}
          style={{ 
            background: activeTab === 'assignment' ? '#2563eb' : 'transparent',
            color: activeTab === 'assignment' ? 'white' : '#64748b',
            border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600
          }}>
          Assign to Packages
        </button>
      </div>

      {activeTab === 'profiles' && (
        <div className={styles.testsGrid}>
          
          {/* Left: Profiles */}
          <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <div style={{ padding: '16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600 }}>Test Profiles</h3>
              <span style={{ background: '#e2e8f0', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 600 }}>{profiles.length}</span>
            </div>

            <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
              {profiles.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>No profiles yet. Add one below.</div>
              ) : (
                <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  {optimisticProfiles.map(profile => (
                    <li 
                      key={profile.id} 
                      style={{ 
                        padding: '12px 16px', 
                        borderBottom: '1px solid #f1f5f9',
                        cursor: 'pointer',
                        background: selectedProfileId === profile.id ? '#eff6ff' : 'white',
                        borderLeft: selectedProfileId === profile.id ? '3px solid #2563eb' : '3px solid transparent',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                      onClick={() => setSelectedProfileId(profile.id)}
                    >
                      {editingProfileId === profile.id ? (
                        <form 
                          action={(fd) => { 
                            const name = fd.get('name') as string;
                            startTransition(() => {
                              dispatchProfileUpdate({ type: 'update_profile', id: profile.id, name });
                              updateTestProfile(profile.id, fd); 
                              setEditingProfileId(null);
                            });
                          }}
                          style={{ display: 'flex', gap: '4px', width: '100%' }}
                        >
                          <input name="name" defaultValue={profile.name} autoFocus style={{ flex: 1, padding: '4px', border: '1px solid #cbd5e1', borderRadius: '4px' }} required />
                          <button type="submit" style={{ background: '#10b981', color: 'white', border: 'none', borderRadius: '4px', padding: '0 8px', cursor: 'pointer', fontSize: '12px' }}>✓</button>
                          <button type="button" onClick={(e) => { e.stopPropagation(); setEditingProfileId(null); }} style={{ background: '#cbd5e1', border: 'none', borderRadius: '4px', padding: '0 8px', cursor: 'pointer', fontSize: '12px' }}>✕</button>
                        </form>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: selectedProfileId === profile.id ? 600 : 400, color: '#334155' }}>{profile.name}</div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>{profile.parameters.length} params</div>
                          </div>
                          <div style={{ display: 'flex', gap: '12px', flexShrink: 0, alignItems: 'center' }}>
                            <button onClick={(e) => { e.stopPropagation(); setEditingProfileId(profile.id); }} style={{ background: 'transparent', color: '#4f46e5', border: 'none', cursor: 'pointer', fontSize: '12px', padding: '4px', fontWeight: 600 }}>Edit</button>
                            <form action={deleteTestProfile} onClick={e => e.stopPropagation()} style={{ margin: 0 }}>
                              <input type="hidden" name="id" value={profile.id} />
                              <button type="submit" style={{ background: 'transparent', color: '#ef4444', border: 'none', cursor: 'pointer', fontSize: '12px', padding: '4px', fontWeight: 600 }}>Del</button>
                            </form>
                          </div>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            <div style={{ padding: '12px', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
              <form action={createTestProfile} style={{ display: 'flex', gap: '8px' }}>
                <input name="name" required placeholder="New Profile (e.g. Thyroid)" style={{ flex: 1, padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }} />
                <button type="submit" style={{ background: '#2563eb', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>Add</button>
              </form>
            </div>
          </div>

          {/* Right: Parameters */}
          <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            {selectedProfile ? (
              <>
                <div style={{ padding: '16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600 }}>Parameters for <span style={{ color: '#2563eb' }}>{selectedProfile.name}</span></h3>
                  <span style={{ background: '#e2e8f0', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 600 }}>{selectedProfile.parameters.length}</span>
                </div>

                <div style={{ padding: '16px', maxHeight: '500px', overflowY: 'auto' }}>
                  {selectedProfile.parameters.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#64748b', fontSize: '14px', padding: '40px 0' }}>No parameters added yet.</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {selectedProfile.parameters.map((param, index) => (
                        <div key={param.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                          
                          {editingParameterId === param.id ? (
                            <form 
                              action={(fd) => {
                                const name = fd.get('name') as string;
                                startTransition(() => {
                                  dispatchProfileUpdate({ type: 'update_parameter', profileId: selectedProfile.id, paramId: param.id, name });
                                  updateTestParameter(param.id, fd);
                                  setEditingParameterId(null);
                                });
                              }}
                              style={{ display: 'flex', gap: '4px', width: '100%' }}
                            >
                              <span style={{ width: '24px', height: '24px', background: '#f1f5f9', color: '#64748b', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 600 }}>{index + 1}</span>
                              <input name="name" defaultValue={param.name} autoFocus style={{ flex: 1, padding: '4px', border: '1px solid #cbd5e1', borderRadius: '4px' }} required />
                              <button type="submit" style={{ background: '#10b981', color: 'white', border: 'none', borderRadius: '4px', padding: '0 8px', cursor: 'pointer', fontSize: '12px' }}>✓</button>
                              <button type="button" onClick={() => setEditingParameterId(null)} style={{ background: '#cbd5e1', border: 'none', borderRadius: '4px', padding: '0 8px', cursor: 'pointer', fontSize: '12px' }}>✕</button>
                            </form>
                          ) : (
                            <>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{ width: '24px', height: '24px', background: '#f1f5f9', color: '#64748b', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 600 }}>{index + 1}</span>
                                <span style={{ fontSize: '14px', color: '#334155', fontWeight: 500 }}>{param.name}</span>
                              </div>
                              
                              <div style={{ display: 'flex', gap: '12px', flexShrink: 0, alignItems: 'center' }}>
                                <button onClick={() => setEditingParameterId(param.id)} style={{ background: 'transparent', color: '#4f46e5', border: 'none', cursor: 'pointer', fontSize: '12px', padding: '4px', fontWeight: 600 }}>Edit</button>
                                <form action={deleteTestParameter} style={{ margin: 0 }}>
                                  <input type="hidden" name="id" value={param.id} />
                                  <button type="submit" style={{ background: 'transparent', color: '#ef4444', border: 'none', cursor: 'pointer', fontSize: '12px', padding: '4px', fontWeight: 600 }}>Delete</button>
                                </form>
                              </div>
                            </>
                          )}
                          
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ padding: '16px', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                  <form action={addTestParameter} style={{ display: 'flex', gap: '8px' }}>
                    <input type="hidden" name="profileId" value={selectedProfile.id} />
                    <input name="name" required placeholder="New Parameter (e.g. HbA1c)" style={{ flex: 1, padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }} />
                    <button type="submit" style={{ background: '#10b981', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}>+ Add Parameter</button>
                  </form>
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#64748b', padding: '40px' }}>
                Select a profile on the left to manage its parameters.
              </div>
            )}
          </div>

        </div>
      )}

      {activeTab === 'assignment' && (
        <div className={styles.testsGrid}>
          
          {/* Left: Packages */}
          <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <div style={{ padding: '16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600 }}>Packages</h3>
            </div>
            <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {optimisticPackages.map(pkg => (
                  <li 
                    key={pkg.id} 
                    style={{ 
                      padding: '12px 16px', 
                      borderBottom: '1px solid #f1f5f9',
                      cursor: 'pointer',
                      background: selectedPackageId === pkg.id ? '#eff6ff' : 'white',
                      borderLeft: selectedPackageId === pkg.id ? '3px solid #2563eb' : '3px solid transparent',
                    }}
                    onClick={() => setSelectedPackageId(pkg.id)}
                  >
                    <div style={{ fontSize: '14px', fontWeight: selectedPackageId === pkg.id ? 600 : 400, color: '#334155' }}>{pkg.title}</div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>{pkg.profiles.length} profiles linked</div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right: Profiles Selection */}
          <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            {selectedPackage ? (
              <>
                <div style={{ padding: '16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600 }}>Assign Profiles to <span style={{ color: '#2563eb' }}>{selectedPackage.title}</span></h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b' }}>Select the profiles that are included in this package.</p>
                </div>
                
                <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
                  {profiles.map(profile => {
                    const isLinked = selectedPackage.profiles.some(p => p.id === profile.id);
                    return (
                      <div 
                        key={profile.id}
                        style={{ 
                          border: isLinked ? '1px solid #3b82f6' : '1px solid #e2e8f0', 
                          borderRadius: '8px', 
                          padding: '12px',
                          background: isLinked ? '#eff6ff' : 'white',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '12px'
                        }}
                        onClick={() => {
                          startTransition(() => {
                            addOptimisticPackageUpdate({ packageId: selectedPackage.id, profile, isLinked });
                            toggleProfileInPackage(selectedPackage.id, profile.id, isLinked);
                          });
                        }}
                      >
                        <input 
                          type="checkbox" 
                          checked={isLinked} 
                          readOnly 
                          style={{ marginTop: '2px', cursor: 'pointer' }}
                        />
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 600, color: isLinked ? '#1e40af' : '#334155' }}>{profile.name}</div>
                          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{profile.parameters.length} parameters</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#64748b', padding: '40px' }}>
                Select a package to assign profiles.
              </div>
            )}
          </div>

        </div>
      )}
      
    </div>
  );
}
