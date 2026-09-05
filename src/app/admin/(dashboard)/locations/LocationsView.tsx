'use client';

import React, { useState } from 'react';
import LocationsAdminClient from './LocationsAdminClient';

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

export default function LocationsView({ states }: { states: State[] }) {
  const [isManaging, setIsManaging] = useState(false);

  // Flatten data for table view
  const flatData: { stateName: string; districtName: string; areaName: string; id: string }[] = [];
  
  states.forEach(state => {
    if (state.districts.length === 0) {
      flatData.push({ stateName: state.name, districtName: '-', areaName: '-', id: `s-${state.id}` });
    } else {
      state.districts.forEach(district => {
        if (district.areas.length === 0) {
          flatData.push({ stateName: state.name, districtName: district.name, areaName: '-', id: `d-${district.id}` });
        } else {
          district.areas.forEach(area => {
            flatData.push({ stateName: state.name, districtName: district.name, areaName: area.name, id: `a-${area.id}` });
          });
        }
      });
    }
  });

  if (isManaging) {
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#1e293b', margin: '0 0 8px 0' }}>Manage Service Locations</h1>
            <p style={{ color: '#64748b', margin: 0, fontSize: '14px' }}>Add, edit, and delete States, Districts, and Areas.</p>
          </div>
          <button 
            onClick={() => setIsManaging(false)}
            style={{ padding: '8px 16px', background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}
          >
            ← Back to List
          </button>
        </div>
        <LocationsAdminClient states={states} />
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#1e293b', margin: '0 0 8px 0' }}>Service Locations</h1>
          <p style={{ color: '#64748b', margin: 0, fontSize: '14px' }}>Overview of all serviced areas.</p>
        </div>
        <button 
          onClick={() => setIsManaging(true)}
          style={{ padding: '10px 20px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
          Manage Service Areas
        </button>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '16px', fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', width: '60px' }}>S.NO</th>
              <th style={{ padding: '16px', fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>State</th>
              <th style={{ padding: '16px', fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>District</th>
              <th style={{ padding: '16px', fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Area / Locality</th>
            </tr>
          </thead>
          <tbody>
            {flatData.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>No locations found.</td>
              </tr>
            ) : (
              flatData.map((row, i) => (
                <tr key={row.id} style={{ borderBottom: i === flatData.length - 1 ? 'none' : '1px solid #f1f5f9' }}>
                  <td style={{ padding: '16px', fontSize: '14px', color: '#475569', fontWeight: 500 }}>{i + 1}</td>
                  <td style={{ padding: '16px', fontSize: '14px', color: '#334155', fontWeight: 500 }}>{row.stateName}</td>
                  <td style={{ padding: '16px', fontSize: '14px', color: '#475569' }}>{row.districtName}</td>
                  <td style={{ padding: '16px', fontSize: '14px', color: '#475569' }}>{row.areaName}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
