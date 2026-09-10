'use client';
import React, { useRef, useState } from 'react';
import Papa from 'papaparse';
import { useSearchParams } from 'next/navigation';
import { importLeads, getLeadsForExport } from '@/app/admin/(dashboard)/actions';
import styles from './ImportExportButtons.module.css';

export default function ImportExportButtons() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    try {
      setLoading(true);
      const filters = {
        tab: searchParams.get('tab') || 'all',
        status: searchParams.get('status') || 'all',
        search: searchParams.get('search') || '',
        membershipType: searchParams.get('membershipType') || 'all'
      };

      const leads = await getLeadsForExport(filters);
      
      const csv = Papa.unparse(leads);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `leads_export_${new Date().getTime()}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export data.");
    } finally {
      setLoading(false);
    }
  };

  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const res = await importLeads(results.data);
          if (res.success) {
            alert(`Successfully imported ${res.count} leads.`);
          }
        } catch (error) {
          console.error("Import failed:", error);
          alert("Failed to import leads. Please check the CSV format.");
        } finally {
          setLoading(false);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }
      },
      error: (error) => {
        console.error("CSV Parsing Error:", error);
        alert("Failed to read CSV file.");
        setLoading(false);
      }
    });
  };

  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      <button 
        onClick={handleExport} 
        disabled={loading}
        style={{ 
          padding: '6px 12px', 
          background: '#edf2f7', 
          color: '#4a5568', 
          border: '1px solid #cbd5e0', 
          borderRadius: '8px', 
          cursor: loading ? 'wait' : 'pointer', 
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '12px'
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
        <span className={styles.btnText}>Export</span>
      </button>

      <button 
        onClick={handleImportClick} 
        disabled={loading}
        style={{ 
          padding: '6px 12px', 
          background: '#fff', 
          color: '#3182ce', 
          border: '1px solid #3182ce', 
          borderRadius: '8px', 
          cursor: loading ? 'wait' : 'pointer', 
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '12px'
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="17 8 12 3 7 8"></polyline>
          <line x1="12" y1="3" x2="12" y2="15"></line>
        </svg>
        <span className={styles.btnText}>Import</span>
      </button>

      <input 
        type="file" 
        accept=".csv"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </div>
  );
}
