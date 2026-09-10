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
  phlebos?: any;
  isActive: boolean;
}

export default function ServiceabilityCheck({ initialPincode }: { initialPincode?: string }) {
  const [pincode, setPincode] = useState(initialPincode || '');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<LocationData[] | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const handleCopyAll = () => {
    if (!results) return;
    const text = results.map(loc => {
      let t = `Pincode: ${loc.pincode}\n`;
      t += `${loc.officeName} (${loc.type})\n`;
      t += `State: ${loc.state} | Area: ${loc.area}\n`;
      t += `Division: ${loc.division} | Region: ${loc.region}\n`;
      return t;
    }).join('\n\n');
    
    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleCopy = (loc: LocationData) => {
    let text = `Pincode: ${loc.pincode}\n`;
    text += `${loc.officeName} (${loc.type})\n`;
    text += `State: ${loc.state} | Area: ${loc.area}\n`;
    text += `Division: ${loc.division} | Region: ${loc.region}\n`;
    
    navigator.clipboard.writeText(text);
    setCopiedId(loc.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

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
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', color: '#1e293b' }}>
                  Serviceability: {pincode}
                </h3>
                {results && results.length > 0 && (
                  <button 
                    onClick={handleCopyAll}
                    style={{
                      background: copiedAll ? '#10b981' : '#f1f5f9',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      padding: '4px 8px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      color: copiedAll ? 'white' : '#475569',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontWeight: 500,
                      transition: 'all 0.2s'
                    }}
                  >
                    {copiedAll ? (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        Copied All
                      </>
                    ) : (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                        Copy All Locations
                      </>
                    )}
                  </button>
                )}
              </div>
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
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button 
                          onClick={() => handleCopy(loc)}
                          style={{
                            background: 'none',
                            border: '1px solid #cbd5e1',
                            borderRadius: '4px',
                            padding: '2px 6px',
                            fontSize: '11px',
                            cursor: 'pointer',
                            color: copiedId === loc.id ? '#10b981' : '#64748b',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          {copiedId === loc.id ? (
                            <>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                              Copied
                            </>
                          ) : (
                            <>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                              Copy
                            </>
                          )}
                        </button>
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
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px', color: '#475569', marginBottom: '12px' }}>
                      <div><strong>State:</strong> {loc.state}</div>
                      <div><strong>Area:</strong> {loc.area}</div>
                      <div><strong>Division:</strong> {loc.division}</div>
                      <div><strong>Region:</strong> {loc.region}</div>
                    </div>

                    <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '12px' }}>
                      <strong style={{ fontSize: '13px', color: '#334155' }}>Phlebotomist Details:</strong>
                      {loc.phlebos && Array.isArray(loc.phlebos) && loc.phlebos.length > 0 ? (
                        <div style={{ fontSize: '13px', color: '#0f172a', marginTop: '4px', backgroundColor: '#e0f2fe', padding: '8px', borderRadius: '6px' }}>
                          {loc.phlebos.map((p: any, i: number) => (
                            <div key={i} style={{ marginBottom: i < loc.phlebos.length - 1 ? '6px' : 0, paddingBottom: i < loc.phlebos.length - 1 ? '6px' : 0, borderBottom: i < loc.phlebos.length - 1 ? '1px solid #bae6fd' : 'none' }}>
                              <div>Name: <strong>{p.name || 'N/A'}</strong></div>
                              <div>Phone: <strong>{p.mobile || 'N/A'}</strong></div>
                            </div>
                          ))}
                        </div>
                      ) : loc.phleboName || loc.phleboMobile ? (
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
