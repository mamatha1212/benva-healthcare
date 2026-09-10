'use client';

import React, { useState } from 'react';

interface LocationData {
  id: string;
  state: string;
  officeName: string;
  pincode: string;
  type: string;
  circle: string;
  region: string;
  division: string;
  area: string;
  phleboName: string | null;
  phleboMobile: string | null;
  isActive: boolean;
}

export default function ServiceabilityCheck({ initialPincode }: { initialPincode?: string }) {
  const [pincode, setPincode] = useState(initialPincode || '');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<LocationData[] | null>(null);
  const [showModal, setShowModal] = useState(false);

  const checkPincode = async () => {
    if (!pincode || pincode.trim() === '') return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/service-locations/check?pincode=${encodeURIComponent(pincode.trim())}`);
      const data = await res.json();
      if (res.ok) {
        setResults(data.locations || []);
      } else {
        setResults([]);
      }
    } catch (error) {
      console.error('Failed to fetch service locations:', error);
      setResults([]);
    } finally {
      setLoading(false);
      setShowModal(true);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
        <input 
          type="text" 
          value={pincode}
          onChange={(e) => setPincode(e.target.value)}
          placeholder="Enter Pincode"
          style={{ 
            padding: '6px 8px', 
            borderRadius: '4px', 
            border: '1px solid #cbd5e1', 
            width: '100px',
            fontSize: '13px'
          }}
        />
        <button 
          onClick={checkPincode}
          disabled={loading || !pincode.trim()}
          style={{ 
            padding: '6px 10px', 
            backgroundColor: '#3182ce', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: loading || !pincode.trim() ? 'not-allowed' : 'pointer',
            fontSize: '12px',
            fontWeight: 600,
            opacity: loading || !pincode.trim() ? 0.7 : 1
          }}
        >
          {loading ? '...' : 'Check'}
        </button>
      </div>

      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '80vh',
            overflowY: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', color: '#1e293b' }}>
                Serviceability: {pincode}
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748b' }}
              >
                &times;
              </button>
            </div>

            {results && results.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {results.map((loc, idx) => (
                  <div key={loc.id} style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <strong style={{ color: '#0f172a' }}>{loc.officeName} ({loc.type})</strong>
                      <span style={{ 
                        padding: '2px 8px', 
                        borderRadius: '12px', 
                        fontSize: '11px', 
                        fontWeight: 'bold',
                        backgroundColor: loc.isActive ? '#dcfce7' : '#fee2e2',
                        color: loc.isActive ? '#166534' : '#991b1b'
                      }}>
                        {loc.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px', color: '#475569', marginBottom: '12px' }}>
                      <div><strong>State:</strong> {loc.state}</div>
                      <div><strong>Area:</strong> {loc.area}</div>
                      <div><strong>Division:</strong> {loc.division}</div>
                      <div><strong>Region:</strong> {loc.region}</div>
                    </div>

                    <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '12px' }}>
                      <strong style={{ fontSize: '13px', color: '#334155' }}>Phlebotomist Details:</strong>
                      {loc.phleboName || loc.phleboMobile ? (
                        <div style={{ fontSize: '13px', color: '#0f172a', marginTop: '4px', backgroundColor: '#e0f2fe', padding: '8px', borderRadius: '6px' }}>
                          <div>Name: <strong>{loc.phleboName || 'N/A'}</strong></div>
                          <div>Phone: <strong>{loc.phleboMobile || 'N/A'}</strong></div>
                        </div>
                      ) : (
                        <div style={{ fontSize: '13px', color: '#ef4444', marginTop: '4px' }}>
                          Not Assigned
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '24px 0', color: '#64748b' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '12px', opacity: 0.8 }}><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                <div style={{ fontSize: '16px', fontWeight: 500, color: '#0f172a' }}>Not Serviceable</div>
                <div style={{ fontSize: '14px', marginTop: '4px' }}>No service areas found in AP/TS for pincode "{pincode}".</div>
              </div>
            )}
            
            <div style={{ marginTop: '20px', textAlign: 'right' }}>
              <button 
                onClick={() => setShowModal(false)}
                style={{ padding: '8px 16px', backgroundColor: '#e2e8f0', color: '#0f172a', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
