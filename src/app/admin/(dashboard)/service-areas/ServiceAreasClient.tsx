'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { getServiceLocations, updatePhlebo, bulkImportServiceLocations, exportAllLocations, toggleServiceLocationActive } from './actions';

export default function ServiceAreasClient() {
  const [activeTab, setActiveTab] = useState('Telangana');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [locations, setLocations] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [phleboFilter, setPhleboFilter] = useState('ALL');

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [phlebosInput, setPhlebosInput] = useState<{name: string, mobile: string}[]>([{name: '', mobile: ''}]);

  const fetchLocations = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getServiceLocations(activeTab, page, search, statusFilter, phleboFilter);
      setLocations(res.locations);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (e) {
      console.error(e);
    }
    setIsLoading(false);
  }, [activeTab, page, search, statusFilter, phleboFilter]);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSearch('');
    setStatusFilter('ALL');
    setPhleboFilter('ALL');
    setPage(1);
  };

  const handleEdit = (loc: any, addNew: boolean = false) => {
    setEditingId(loc.id);
    let initial = [];
    if (loc.phlebos && Array.isArray(loc.phlebos) && loc.phlebos.length > 0) {
      initial = [...loc.phlebos];
    } else if (loc.phleboName) {
      initial = [{ name: loc.phleboName, mobile: loc.phleboMobile || '' }];
    } else {
      initial = [{ name: '', mobile: '' }];
    }
    if (addNew) {
      initial.push({ name: '', mobile: '' });
    }
    setPhlebosInput(initial);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setPhlebosInput([{ name: '', mobile: '' }]);
  };

  const handleSave = async (id: string) => {
    const validPhlebos = phlebosInput.filter(p => p.name.trim() !== '');
    const res = await updatePhlebo(id, validPhlebos);
    if (res.success) {
      setEditingId(null);
      fetchLocations();
    } else {
      alert('Failed to update phlebotomist info: ' + res.error);
    }
  };

  const [isImporting, setIsImporting] = useState(false);
  const [importText, setImportText] = useState('');
  const [importStatus, setImportStatus] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const handleToggleActive = async (id: string, newStatus: boolean) => {
    try {
      await toggleServiceLocationActive(id, newStatus);
      // Wait a moment and then reload data to reflect changes
      fetchLocations();
    } catch (e) {
      console.error(e);
      alert('Failed to update status');
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const allLocs = await exportAllLocations(activeTab);
      const headers = ['S NO', 'Office Name', 'Pincode', 'Type', 'Circle', 'Region', 'Division', 'Area', 'Phlebotomists'];
      const rows = allLocs.map((loc: any) => {
        let phlebosStr = '';
        if (loc.phlebos && Array.isArray(loc.phlebos) && loc.phlebos.length > 0) {
          phlebosStr = loc.phlebos.map((p: any) => `${p.name} (${p.mobile || 'N/A'})`).join(' | ');
        } else if (loc.phleboName) {
          phlebosStr = `${loc.phleboName} (${loc.phleboMobile || 'N/A'})`;
        }
        
        return [
          loc.sNo, 
          `"${loc.officeName}"`, 
          loc.pincode, 
          loc.type, 
          `"${loc.circle}"`, 
          `"${loc.region}"`, 
          `"${loc.division}"`, 
          `"${loc.area}"`, 
          `"${phlebosStr}"`
        ].join(',');
      });
      
      const csvContent = headers.join(',') + '\n' + rows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `ServiceAreas_${activeTab}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error(e);
      alert('Failed to export data');
    }
    setIsExporting(false);
  };

  const handleImport = async () => {
    setImportStatus('Parsing...');
    const lines = importText.split('\n');
    const records = [];
    const rowRegex = /^(\d+)\s+(.+?)\s+(\d{6})\s+(PO|BO|HO)\s+(.+?Circle)\s+(.+?Region)\s*(.+?Division)\s*(Urban|Rural)$/i;
    
    for (const line of lines) {
      const trimmed = line.trim();
      const match = trimmed.match(rowRegex);
      if (match) {
        records.push({
          sNo: parseInt(match[1], 10),
          officeName: match[2].trim(),
          pincode: match[3],
          type: match[4].toUpperCase(),
          circle: match[5].trim(),
          region: match[6].trim(),
          division: match[7].trim(),
          area: match[8],
          state: activeTab,
        });
      }
    }

    if (records.length === 0) {
      setImportStatus('No valid records found. Make sure the format matches the PDF.');
      return;
    }

    setImportStatus(`Found ${records.length} records. Sending to server... (This might take a moment)`);
    
    // Split into batches of 500 to send
    const batchSize = 500;
    try {
      const res = await bulkImportServiceLocations(records);
      if (res.success) {
        setImportStatus(`Successfully imported ${records.length} records!`);
        setImportText('');
        setIsImporting(false);
        fetchLocations();
      } else {
        setImportStatus('Error: ' + res.error);
      }
    } catch (e: any) {
      setImportStatus('Error: ' + e.message);
    }
  };

  return (
    <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#0f172a', margin: 0 }}>Service Areas ({total})</h2>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={handleExport}
            disabled={isExporting}
            style={{ padding: '8px 16px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: isExporting ? 'not-allowed' : 'pointer' }}
          >
            {isExporting ? 'Exporting...' : 'Export CSV'}
          </button>
          <button 
            onClick={() => setIsImporting(!isImporting)}
            style={{ padding: '8px 16px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer' }}
          >
            Import Data
          </button>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', cursor: 'pointer' }}
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active Only</option>
            <option value="INACTIVE">Inactive Only</option>
          </select>
          <select
            value={phleboFilter}
            onChange={(e) => {
              setPhleboFilter(e.target.value);
              setPage(1);
            }}
            style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', cursor: 'pointer' }}
          >
            <option value="ALL">All Phlebos</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="UNASSIGNED">Unassigned</option>
          </select>
          <input 
            type="text" 
            placeholder="Search pincode, office, division..." 
            value={search}
            onChange={handleSearchChange}
            style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', width: '300px' }}
          />
        </div>
      </div>

      {isImporting && (
        <div style={{ marginBottom: '24px', padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '15px' }}>Import Location Data</h3>
          <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#64748b' }}>Paste the text from the PDF table here. It will automatically parse rows matching the format.</p>
          <textarea 
            value={importText} 
            onChange={e => setImportText(e.target.value)} 
            style={{ width: '100%', height: '150px', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontFamily: 'monospace', fontSize: '12px' }}
            placeholder="1 Gandhi Bhawan S.O 500001 PO Telangana Circle Hyderabad City Region Hyderabad City Division Urban..."
          />
          <div style={{ marginTop: '12px', display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button 
              onClick={handleImport}
              style={{ padding: '8px 16px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
            >
              Parse & Import
            </button>
            <span style={{ fontSize: '13px', color: '#475569' }}>{importStatus}</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e2e8f0', marginBottom: '24px' }}>
        {['Telangana', 'Andhra Pradesh'].map(tab => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            style={{
              padding: '12px 24px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab ? '2px solid #2563eb' : '2px solid transparent',
              color: activeTab === tab ? '#2563eb' : '#64748b',
              fontWeight: activeTab === tab ? 600 : 400,
              cursor: 'pointer',
              fontSize: '15px'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto', width: '100%' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px', whiteSpace: 'nowrap' }}>
          <thead>
            <tr style={{ background: '#f8fafc', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '12px' }}>S NO</th>
              <th style={{ padding: '12px' }}>Office Name</th>
              <th style={{ padding: '12px' }}>Pincode</th>
              <th style={{ padding: '12px' }}>Type</th>
              <th style={{ padding: '12px' }}>Circle</th>
              <th style={{ padding: '12px' }}>Region</th>
              <th style={{ padding: '12px' }}>Division</th>
              <th style={{ padding: '12px' }}>Area</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Status</th>
              <th style={{ padding: '12px' }}>Phlebo Name</th>
              <th style={{ padding: '12px' }}>Phlebo Mobile</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={12} style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>Loading...</td>
              </tr>
            ) : locations.length === 0 ? (
              <tr>
                <td colSpan={12} style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>No service locations found for {activeTab}. Please import data or try a different search.</td>
              </tr>
            ) : (
              locations.map((loc, index) => (
                <tr key={loc.id} style={{ borderBottom: '1px solid #f1f5f9', color: '#1e293b' }}>
                  <td style={{ padding: '12px' }}>{(page - 1) * 50 + index + 1}</td>
                  <td style={{ padding: '12px' }}>{loc.officeName}</td>
                  <td style={{ padding: '12px', fontWeight: 500, color: '#0f172a' }}>{loc.pincode}</td>
                  <td style={{ padding: '12px' }}>{loc.type}</td>
                  <td style={{ padding: '12px' }}>{loc.circle}</td>
                  <td style={{ padding: '12px' }}>{loc.region}</td>
                  <td style={{ padding: '12px' }}>{loc.division}</td>
                  <td style={{ padding: '12px' }}>{loc.area}</td>

                  {/* Status Toggle */}
                  <td style={{ padding: '12px', verticalAlign: 'top', textAlign: 'center' }}>
                    <div 
                      onClick={() => handleToggleActive(loc.id, loc.isActive === false ? true : false)}
                      style={{
                        width: '40px',
                        height: '22px',
                        background: loc.isActive === false ? '#cbd5e1' : '#10b981',
                        borderRadius: '12px',
                        position: 'relative',
                        cursor: 'pointer',
                        transition: 'background 0.2s',
                        display: 'inline-block'
                      }}
                    >
                      <div style={{
                        width: '18px',
                        height: '18px',
                        background: 'white',
                        borderRadius: '50%',
                        position: 'absolute',
                        top: '2px',
                        left: loc.isActive === false ? '2px' : '20px',
                        transition: 'left 0.2s',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                      }} />
                    </div>
                  </td>
                  
                  {/* Editable columns */}
                  <td style={{ padding: '12px', verticalAlign: 'top' }}>
                    {editingId === loc.id ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {phlebosInput.map((p, i) => (
                          <input 
                            key={i}
                            type="text" 
                            value={p.name} 
                            onChange={e => {
                              const newP = [...phlebosInput];
                              newP[i].name = e.target.value;
                              setPhlebosInput(newP);
                            }} 
                            style={{ padding: '6px', border: '1px solid #cbd5e1', borderRadius: '4px', width: '120px' }}
                            placeholder="Name"
                          />
                        ))}
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {loc.phlebos && Array.isArray(loc.phlebos) && loc.phlebos.length > 0 ? (
                          loc.phlebos.map((p: any, i: number) => (
                            <span key={i} style={{ color: '#0f172a' }}>{p.name}</span>
                          ))
                        ) : (
                          <span style={{ color: loc.phleboName ? '#0f172a' : '#94a3b8' }}>
                            {loc.phleboName || 'Unassigned'}
                          </span>
                        )}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '12px', verticalAlign: 'top' }}>
                    {editingId === loc.id ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {phlebosInput.map((p, i) => (
                          <input 
                            key={i}
                            type="text" 
                            value={p.mobile} 
                            onChange={e => {
                              const newP = [...phlebosInput];
                              newP[i].mobile = e.target.value;
                              setPhlebosInput(newP);
                            }} 
                            style={{ padding: '6px', border: '1px solid #cbd5e1', borderRadius: '4px', width: '120px' }}
                            placeholder="Mobile"
                          />
                        ))}
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {loc.phlebos && Array.isArray(loc.phlebos) && loc.phlebos.length > 0 ? (
                          loc.phlebos.map((p: any, i: number) => (
                            <span key={i} style={{ color: '#0f172a' }}>{p.mobile || 'N/A'}</span>
                          ))
                        ) : (
                          <span style={{ color: loc.phleboMobile ? '#0f172a' : '#94a3b8' }}>
                            {loc.phleboMobile || 'N/A'}
                          </span>
                        )}
                      </div>
                    )}
                  </td>

                  {/* Actions */}
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    {editingId === loc.id ? (
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'flex-start' }}>
                        <button onClick={() => handleSave(loc.id)} style={{ padding: '6px 12px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}>Save</button>
                        <button onClick={handleCancelEdit} style={{ padding: '6px 12px', background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}>Cancel</button>
                        <button onClick={() => setPhlebosInput([...phlebosInput, {name: '', mobile: ''}])} style={{ padding: '6px 12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}>+ Add</button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                        <button onClick={() => handleEdit(loc, false)} style={{ padding: '6px 12px', background: '#f8fafc', color: '#2563eb', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}>
                          {loc.phleboName || (loc.phlebos && loc.phlebos.length > 0) ? 'Edit Phlebo' : 'Assign Phlebo'}
                        </button>
                        {(loc.phleboName || (loc.phlebos && loc.phlebos.length > 0)) && (
                          <button onClick={() => handleEdit(loc, true)} style={{ padding: '6px 12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}>
                            + Add
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '14px', color: '#64748b' }}>
            Showing {((page - 1) * 50) + 1} to {Math.min(page * 50, total)} of {total} entries
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))} 
              disabled={page === 1}
              style={{ padding: '8px 16px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: page === 1 ? 'not-allowed' : 'pointer', color: page === 1 ? '#94a3b8' : '#334155' }}
            >
              Previous
            </button>
            <button 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
              disabled={page === totalPages}
              style={{ padding: '8px 16px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: page === totalPages ? 'not-allowed' : 'pointer', color: page === totalPages ? '#94a3b8' : '#334155' }}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
