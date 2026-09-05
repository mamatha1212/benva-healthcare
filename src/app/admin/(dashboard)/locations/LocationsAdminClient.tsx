'use client';

import React, { useState } from 'react';
import { addState, updateState, deleteState, addDistrict, updateDistrict, deleteDistrict, addArea, updateArea, deleteArea } from './actions';

type Area = {
  id: string;
  name: string;
  districtId: string;
};

type District = {
  id: string;
  name: string;
  stateId: string;
  areas: Area[];
};

type State = {
  id: string;
  name: string;
  districts: District[];
};

export default function LocationsAdminClient({ states }: { states: State[] }) {
  const [selectedStateId, setSelectedStateId] = useState<string | null>(states[0]?.id || null);
  const [selectedDistrictId, setSelectedDistrictId] = useState<string | null>(null);
  
  const [editingStateId, setEditingStateId] = useState<string | null>(null);
  const [editingDistrictId, setEditingDistrictId] = useState<string | null>(null);
  const [editingAreaId, setEditingAreaId] = useState<string | null>(null);

  const selectedState = states.find(s => s.id === selectedStateId);
  const selectedDistrict = selectedState?.districts.find(d => d.id === selectedDistrictId);

  // Automatically select the first district if a state is selected but no district is, or if the district doesn't belong to the state
  if (selectedState && (!selectedDistrictId || !selectedState.districts.find(d => d.id === selectedDistrictId))) {
    if (selectedState.districts.length > 0) {
      setSelectedDistrictId(selectedState.districts[0].id);
    } else if (selectedDistrictId !== null) {
      setSelectedDistrictId(null);
    }
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', alignItems: 'start' }}>
      
      {/* --- Column 1: States --- */}
      <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ padding: '16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600 }}>States</h3>
          <span style={{ background: '#e2e8f0', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 600 }}>{states.length}</span>
        </div>

        <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
          {states.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>No states yet.</div>
          ) : (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {states.map(state => (
                <li 
                  key={state.id} 
                  style={{ 
                    padding: '12px 16px', 
                    borderBottom: '1px solid #f1f5f9',
                    cursor: 'pointer',
                    background: selectedStateId === state.id ? '#eff6ff' : 'white',
                    borderLeft: selectedStateId === state.id ? '3px solid #2563eb' : '3px solid transparent',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                  onClick={() => setSelectedStateId(state.id)}
                >
                  {editingStateId === state.id ? (
                    <form 
                      action={async (fd) => { await updateState(state.id, fd); setEditingStateId(null); }}
                      style={{ display: 'flex', gap: '8px', width: '100%' }}
                      onClick={e => e.stopPropagation()}
                    >
                      <input name="name" defaultValue={state.name} autoFocus style={{ flex: 1, padding: '4px 8px', border: '1px solid #cbd5e1', borderRadius: '4px', width: '100px' }} />
                      <button type="submit" style={{ background: '#10b981', color: 'white', border: 'none', borderRadius: '4px', padding: '0 8px', cursor: 'pointer' }}>✓</button>
                      <button type="button" onClick={() => setEditingStateId(null)} style={{ background: '#cbd5e1', border: 'none', borderRadius: '4px', padding: '0 8px', cursor: 'pointer' }}>×</button>
                    </form>
                  ) : (
                    <>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', overflow: 'hidden' }}>
                        <span style={{ fontSize: '14px', fontWeight: selectedStateId === state.id ? 600 : 400, color: '#334155', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{state.name}</span>
                        <span style={{ fontSize: '11px', color: '#64748b' }}>{state.districts.length} districts</span>
                      </div>
                      <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                        <button onClick={(e) => { e.stopPropagation(); setEditingStateId(state.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>✏️</button>
                        <form action={deleteState} onClick={e => e.stopPropagation()}>
                          <input type="hidden" name="id" value={state.id} />
                          <button type="submit" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }} title="Delete State">🗑️</button>
                        </form>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div style={{ padding: '16px', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
          <form action={addState} style={{ display: 'flex', gap: '8px' }}>
            <input name="name" required placeholder="New State..." style={{ flex: 1, padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', width: '100px' }} />
            <button type="submit" style={{ background: '#2563eb', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>Add</button>
          </form>
        </div>
      </div>

      {/* --- Column 2: Districts --- */}
      <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        {selectedState ? (
          <>
            <div style={{ padding: '16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600 }}>Districts in <span style={{ color: '#2563eb' }}>{selectedState.name}</span></h3>
              <span style={{ background: '#e2e8f0', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 600 }}>{selectedState.districts.length}</span>
            </div>

            <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
              {selectedState.districts.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>No districts yet.</div>
              ) : (
                <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  {selectedState.districts.map(dist => (
                    <li 
                      key={dist.id} 
                      style={{ 
                        padding: '12px 16px', 
                        borderBottom: '1px solid #f1f5f9',
                        cursor: 'pointer',
                        background: selectedDistrictId === dist.id ? '#eff6ff' : 'white',
                        borderLeft: selectedDistrictId === dist.id ? '3px solid #2563eb' : '3px solid transparent',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                      onClick={() => setSelectedDistrictId(dist.id)}
                    >
                      {editingDistrictId === dist.id ? (
                        <form 
                          action={async (fd) => { await updateDistrict(dist.id, fd); setEditingDistrictId(null); }}
                          style={{ display: 'flex', gap: '8px', width: '100%' }}
                          onClick={e => e.stopPropagation()}
                        >
                          <input name="name" defaultValue={dist.name} autoFocus style={{ flex: 1, padding: '4px 8px', border: '1px solid #cbd5e1', borderRadius: '4px', width: '100px' }} />
                          <button type="submit" style={{ background: '#10b981', color: 'white', border: 'none', borderRadius: '4px', padding: '0 8px', cursor: 'pointer' }}>✓</button>
                          <button type="button" onClick={() => setEditingDistrictId(null)} style={{ background: '#cbd5e1', border: 'none', borderRadius: '4px', padding: '0 8px', cursor: 'pointer' }}>×</button>
                        </form>
                      ) : (
                        <>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', overflow: 'hidden' }}>
                            <span style={{ fontSize: '14px', fontWeight: selectedDistrictId === dist.id ? 600 : 400, color: '#334155', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{dist.name}</span>
                            <span style={{ fontSize: '11px', color: '#64748b' }}>{dist.areas.length} areas</span>
                          </div>
                          <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                            <button onClick={(e) => { e.stopPropagation(); setEditingDistrictId(dist.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>✏️</button>
                            <form action={deleteDistrict} onClick={e => e.stopPropagation()}>
                              <input type="hidden" name="id" value={dist.id} />
                              <button type="submit" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }} title="Delete District">🗑️</button>
                            </form>
                          </div>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div style={{ padding: '16px', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
              <form action={addDistrict} style={{ display: 'flex', gap: '8px' }}>
                <input type="hidden" name="stateId" value={selectedState.id} />
                <input name="name" required placeholder="New District..." style={{ flex: 1, padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', width: '100px' }} />
                <button type="submit" style={{ background: '#2563eb', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>Add</button>
              </form>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#64748b', padding: '40px', textAlign: 'center' }}>
            Select a state on the left to manage its districts.
          </div>
        )}
      </div>


      {/* --- Column 3: Areas --- */}
      <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        {selectedDistrict ? (
          <>
            <div style={{ padding: '16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600 }}>Areas in <span style={{ color: '#2563eb' }}>{selectedDistrict.name}</span></h3>
              <span style={{ background: '#e2e8f0', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 600 }}>{selectedDistrict.areas.length}</span>
            </div>

            <div style={{ padding: '16px', maxHeight: '500px', overflowY: 'auto' }}>
              {selectedDistrict.areas.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#64748b', fontSize: '14px', padding: '40px 0' }}>No areas here yet.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedDistrict.areas.map((area, index) => (
                    <div key={area.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                      
                      {editingAreaId === area.id ? (
                        <form 
                          action={async (fd) => { await updateArea(area.id, fd); setEditingAreaId(null); }}
                          style={{ display: 'flex', gap: '8px', width: '100%' }}
                        >
                          <input name="name" defaultValue={area.name} autoFocus style={{ flex: 1, padding: '4px 8px', border: '1px solid #cbd5e1', borderRadius: '4px', width: '100px' }} />
                          <button type="submit" style={{ background: '#10b981', color: 'white', border: 'none', borderRadius: '4px', padding: '0 8px', cursor: 'pointer', fontSize: '12px' }}>✓</button>
                          <button type="button" onClick={() => setEditingAreaId(null)} style={{ background: '#cbd5e1', border: 'none', borderRadius: '4px', padding: '0 8px', cursor: 'pointer', fontSize: '12px' }}>×</button>
                        </form>
                      ) : (
                        <>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
                            <span style={{ fontSize: '14px', color: '#334155', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{area.name}</span>
                          </div>
                          
                          <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                            <button onClick={() => setEditingAreaId(area.id)} style={{ background: '#e0e7ff', color: '#4f46e5', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Edit</button>
                            <form action={deleteArea}>
                              <input type="hidden" name="id" value={area.id} />
                              <button type="submit" style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Delete</button>
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
              <form action={addArea} style={{ display: 'flex', gap: '8px' }}>
                <input type="hidden" name="districtId" value={selectedDistrict.id} />
                <input name="name" required placeholder="Add area..." style={{ flex: 1, padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', width: '100px' }} />
                <button type="submit" style={{ background: '#2563eb', color: 'white', border: 'none', padding: '10px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}>Add</button>
              </form>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#64748b', padding: '40px', textAlign: 'center' }}>
            Select a district to manage its areas.
          </div>
        )}
      </div>

    </div>
  );
}
