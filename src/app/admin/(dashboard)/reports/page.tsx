'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export default function ReportsManagement() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [view, setView] = useState<'YEARS' | 'MONTHS' | 'CALENDAR' | 'REPORTS' | 'SEARCH'>('YEARS');
  
  const [years, setYears] = useState<any[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null); 
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  const [reports, setReports] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [selectedReportIds, setSelectedReportIds] = useState<Set<string>>(new Set());

  // Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilterYear, setSearchFilterYear] = useState('');
  const [searchFilterMonth, setSearchFilterMonth] = useState('');
  const [searchFilterDate, setSearchFilterDate] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // New states for Report Details modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    patientId: '',
    patientName: '',
    mobileNumber: '',
    testName: '',
    labName: '',
    reference: '',
    remarks: '',
    title: '',
    needsReminder: false
  });
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

  const [isPreparingShare, setIsPreparingShare] = useState(false);
  const [shareReadyFiles, setShareReadyFiles] = useState<File[] | null>(null);

  const navigateView = (newView: 'YEARS' | 'MONTHS' | 'CALENDAR' | 'REPORTS' | 'SEARCH', y?: number | null, m?: number | null, d?: number | null) => {
    setView(newView);
    const params = new URLSearchParams(window.location.search);
    params.delete('search');

    if (newView === 'YEARS') {
      params.delete('year'); params.delete('month'); params.delete('date');
    } else if (newView === 'MONTHS' && y !== undefined && y !== null) {
      params.set('year', y.toString()); params.delete('month'); params.delete('date');
    } else if (newView === 'CALENDAR' && y !== undefined && y !== null && m !== undefined && m !== null) {
      params.set('year', y.toString()); params.set('month', m.toString()); params.delete('date');
    } else if (newView === 'REPORTS' && y !== undefined && y !== null && m !== undefined && m !== null && d !== undefined && d !== null) {
      params.set('year', y.toString()); params.set('month', m.toString()); params.set('date', d.toString());
    } else if (newView === 'SEARCH') {
      params.set('search', 'true');
    }
    
    const qs = params.toString();
    router.push(qs ? `/admin/reports?${qs}` : '/admin/reports');
  };

  useEffect(() => {
    fetchYears();
    fetchPatients();
  }, []);

  useEffect(() => {
    const year = searchParams.get('year');
    const month = searchParams.get('month');
    const date = searchParams.get('date');
    const search = searchParams.get('search');

    if (search === 'true') {
      setView('SEARCH');
    } else if (year && month && date) {
      const y = parseInt(year);
      const m = parseInt(month);
      const d = parseInt(date);
      const dt = new Date(y, m, d);
      setSelectedYear(y);
      setSelectedMonth(m);
      setSelectedDate(dt);
      fetchReportsForDate(dt);
      setView('REPORTS');
    } else if (year && month) {
      setSelectedYear(parseInt(year));
      setSelectedMonth(parseInt(month));
      setView('CALENDAR');
    } else if (year) {
      setSelectedYear(parseInt(year));
      setView('MONTHS');
    } else {
      setSelectedYear(null);
      setSelectedMonth(null);
      setSelectedDate(null);
      setView('YEARS');
    }
  }, [searchParams]);

  const fetchYears = async () => {
    try {
      const res = await fetch('/api/admin/report-years');
      const data = await res.json();
      setYears(data);
    } catch (e) { console.error(e); }
  };

  const fetchPatients = async () => {
    try {
      const res = await fetch('/api/admin/patients/lite');
      const data = await res.json();
      setPatients(data);
    } catch (e) { console.error(e); }
  };

  const handlePatientSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const patientId = e.target.value;
    if (!patientId) {
      setFormData(prev => ({ ...prev, patientId: '', patientName: '', mobileNumber: '' }));
      return;
    }
    const patient = patients.find(p => p.id === patientId);
    if (patient) {
      setFormData(prev => ({
        ...prev,
        patientId: patient.id,
        patientName: patient.name,
        mobileNumber: patient.phone
      }));
    }
  };

  const handleAddYear = async () => {
    const yearInput = prompt('Enter a new year (e.g., 2026):');
    if (!yearInput) return;
    const year = parseInt(yearInput);
    if (isNaN(year)) return alert('Invalid year');

    try {
      const res = await fetch('/api/admin/report-years', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year })
      });
      if (res.ok) fetchYears();
      else alert((await res.json()).error || 'Failed to add year');
    } catch (e) {
      console.error(e);
      alert('Error adding year');
    }
  };

  const fetchReportsForDate = async (date: Date) => {
    try {
      const offset = date.getTimezoneOffset() * 60000;
      const localISOTime = (new Date(date.getTime() - offset)).toISOString().slice(0, -1);
      
      const res = await fetch(`/api/admin/reports?date=${localISOTime}`);
      if (res.ok) setReports(await res.json());
    } catch (e) { console.error(e); }
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSearching(true);
    try {
      let query = `/api/admin/reports/search?q=${encodeURIComponent(searchQuery)}`;
      if (searchFilterYear) query += `&year=${searchFilterYear}`;
      if (searchFilterMonth !== '') query += `&month=${searchFilterMonth}`;
      if (searchFilterDate) query += `&date=${searchFilterDate}`;

      const res = await fetch(query);
      if (res.ok) {
        setSearchResults(await res.json());
        navigateView('SEARCH');
      }
    } catch (error) {
      console.error(error);
    }
    setIsSearching(false);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedFiles || selectedFiles.length === 0) {
      return alert('Please select at least one file');
    }

    setIsUploading(true);
    let successCount = 0;

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        
        // 25MB Size Limit Check
        if (file.size > 25 * 1024 * 1024) {
          alert(`File "${file.name}" is too large. Please keep each report under 25MB.`);
          setIsUploading(false);
          return;
        }

        await new Promise<void>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = async () => {
            try {
              const base64Data = reader.result;
              const offset = selectedDate.getTimezoneOffset() * 60000;
              const localISOTime = (new Date(selectedDate.getTime() - offset)).toISOString().slice(0, -1);

              const payload = {
                date: localISOTime,
                title: formData.title || formData.testName || `Report ${i+1}`,
                fileName: file.name,
                fileUrl: base64Data,
                patientName: formData.patientName,
                patientId: formData.patientId,
                mobileNumber: formData.mobileNumber,
                testName: formData.testName,
                labName: formData.labName,
                reference: formData.reference,
                remarks: formData.remarks,
                needsReminder: formData.needsReminder
              };

              const res = await fetch('/api/admin/reports', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
              });

              if (res.ok) successCount++;
              resolve();
            } catch (err) {
              reject(err);
            }
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }

      if (successCount === selectedFiles.length) {
        fetchReportsForDate(selectedDate);
        setIsModalOpen(false);
        setFormData({ patientId: '', patientName: '', mobileNumber: '', testName: '', labName: '', reference: '', remarks: '', title: '', needsReminder: false });
        setSelectedFiles(null);
      } else {
        alert(`Failed to upload ${selectedFiles.length - successCount} reports.`);
        fetchReportsForDate(selectedDate); 
      }
      setIsUploading(false);
      
    } catch (error) {
      console.error(error);
      alert('Error uploading files');
      setIsUploading(false);
    }
  };

  const handleDeleteReport = async (id: string, isFromSearch = false) => {
    if (!confirm('Delete this report?')) return;
    try {
      const res = await fetch(`/api/admin/reports/${id}`, { method: 'DELETE' });
      if (res.ok) {
        if (isFromSearch) handleSearch();
        else if (selectedDate) fetchReportsForDate(selectedDate);
      }
    } catch (error) { console.error(error); }
  };

  const downloadBackup = async (type: 'year' | 'month' | 'day') => {
    if (isBackingUp) return;
    
    let queryParams = `?type=${type}`;
    if (type === 'year') {
      queryParams += `&year=${selectedYear}`;
    } else if (type === 'month') {
      queryParams += `&year=${selectedYear}&month=${selectedMonth}`;
    } else if (type === 'day') {
      queryParams += `&year=${selectedYear}&month=${selectedMonth}&day=${selectedDate?.getDate()}`;
    }

    setIsBackingUp(true);
    try {
      const res = await fetch(`/api/admin/reports/backup${queryParams}`);
      if (!res.ok) throw new Error('Failed to fetch backup data');
      const data = await res.json();

      if (data.length === 0) {
        alert(`No reports found for this ${type}.`);
        setIsBackingUp(false);
        return;
      }

      const zip = new JSZip();
      const folderName = `Backup_${type.toUpperCase()}_${new Date().getTime()}`;
      const folder = zip.folder(folderName);

      data.forEach((report: any, index: number) => {
        if (report.fileUrl && folder) {
          const base64Data = report.fileUrl.split(',')[1]; 
          const uniqueFileName = `${index}_${report.fileName}`;
          folder.file(uniqueFileName, base64Data, { base64: true });
        }
      });

      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `${folderName}.zip`);

    } catch (e) {
      console.error(e);
      alert('Failed to generate backup ZIP');
    }
    setIsBackingUp(false);
  };

  const downloadSelectedReports = async (sourceReports: any[]) => {
    if (selectedReportIds.size === 0) return alert('No reports selected');
    if (isBackingUp) return;
    setIsBackingUp(true);
    try {
      const zip = new JSZip();
      const folderName = `Selected_Reports_${new Date().getTime()}`;
      const folder = zip.folder(folderName);

      for (const [index, report] of sourceReports.entries()) {
        if (selectedReportIds.has(report.id) && folder) {
          const res = await fetch(`/api/admin/reports/${report.id}`);
          const data = await res.json();
          if (data.fileUrl) {
            const base64Data = data.fileUrl.split(',')[1]; 
            const uniqueFileName = `${index}_${report.fileName}`;
            folder.file(uniqueFileName, base64Data, { base64: true });
          }
        }
      }

      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `${folderName}.zip`);
      
      setSelectedReportIds(new Set());
    } catch (e) {
      console.error(e);
      alert('Failed to generate ZIP');
    }
    setIsBackingUp(false);
  };

  const shareReports = async (reportsToShare: any[]) => {
    if (!navigator.canShare) {
      alert("Sharing is not supported on this browser. Please download the files instead.");
      return;
    }
    setIsPreparingShare(true);
    try {
      const filesArray: File[] = [];
      for (const report of reportsToShare) {
        const res = await fetch(`/api/admin/reports/${report.id}`);
        const data = await res.json();
        if (data.fileUrl) {
          const fetchRes = await fetch(data.fileUrl);
          const blob = await fetchRes.blob();
          filesArray.push(new File([blob], report.fileName, { type: blob.type || 'application/pdf' }));
        }
      }
      if (filesArray.length === 0) {
        alert('No valid files to share.');
      } else {
        setShareReadyFiles(filesArray);
      }
    } catch (error: any) { 
      console.error('Error preparing file:', error); 
      alert('Error preparing file: ' + error.message);
    }
    setIsPreparingShare(false);
  };

  const executeShare = async () => {
    if (!shareReadyFiles) return;
    try {
      if (navigator.canShare({ files: shareReadyFiles })) {
        await navigator.share({ title: 'Patient Reports', text: 'Please find the attached patient reports.', files: shareReadyFiles });
        setShareReadyFiles(null);
      } else {
        alert("Your browser doesn't support sharing these files directly.");
      }
    } catch (error: any) {
      console.error('Share execution error:', error);
      if (error.name !== 'AbortError') {
        alert('Error sharing: ' + error.message);
      }
    }
  };

  const handleDownloadReport = async (report: any) => {
    try {
      const res = await fetch(`/api/admin/reports/${report.id}`);
      const data = await res.json();
      if (data.fileUrl) {
        const a = document.createElement('a');
        a.href = data.fileUrl;
        a.download = report.fileName;
        a.click();
      }
    } catch(e) { console.error(e); }
  };

  const toggleReportSelection = (id: string) => {
    const newSelected = new Set(selectedReportIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedReportIds(newSelected);
  };

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  return (
    <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <div style={{ marginBottom: '24px', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1a202c', margin: '0 0 8px 0' }}>Report Management</h1>
          <div style={{ display: 'flex', gap: '8px', color: '#64748b', fontSize: '15px' }}>
            <span style={{ cursor: 'pointer', color: view === 'YEARS' ? '#1a202c' : '#2563eb', fontWeight: view === 'YEARS' ? 600 : 400 }} onClick={() => navigateView('YEARS')}>Years</span>
            {selectedYear && view !== 'SEARCH' && (
              <>
                <span>/</span>
                <span style={{ cursor: 'pointer', color: view === 'MONTHS' ? '#1a202c' : '#2563eb', fontWeight: view === 'MONTHS' ? 600 : 400 }} onClick={() => navigateView('MONTHS', selectedYear)}>
                  {selectedYear}
                </span>
              </>
            )}
            {selectedMonth !== null && view !== 'SEARCH' && (
              <>
                <span>/</span>
                <span style={{ cursor: 'pointer', color: view === 'CALENDAR' ? '#1a202c' : '#2563eb', fontWeight: view === 'CALENDAR' ? 600 : 400 }} onClick={() => navigateView('CALENDAR', selectedYear, selectedMonth)}>
                  {months[selectedMonth]}
                </span>
              </>
            )}
            {selectedDate && view !== 'SEARCH' && (
              <>
                <span>/</span>
                <span style={{ color: view === 'REPORTS' ? '#1a202c' : '#2563eb', fontWeight: view === 'REPORTS' ? 600 : 400 }}>{selectedDate.toLocaleDateString()}</span>
              </>
            )}
            {view === 'SEARCH' && (
              <>
                <span>/</span>
                <span style={{ color: '#1a202c', fontWeight: 600 }}>Search Results</span>
              </>
            )}
          </div>
        </div>
        
        <div>
          {view === 'MONTHS' && (
            <button onClick={() => downloadBackup('year')} disabled={isBackingUp} style={{ background: '#f59e0b', color: 'white', padding: '8px 16px', borderRadius: '6px', border: 'none', fontWeight: 600, cursor: 'pointer', opacity: isBackingUp ? 0.6 : 1 }}>
              {isBackingUp ? 'Zipping...' : `Backup ${selectedYear}`}
            </button>
          )}
          {view === 'CALENDAR' && (
            <button onClick={() => downloadBackup('month')} disabled={isBackingUp} style={{ background: '#f59e0b', color: 'white', padding: '8px 16px', borderRadius: '6px', border: 'none', fontWeight: 600, cursor: 'pointer', opacity: isBackingUp ? 0.6 : 1 }}>
              {isBackingUp ? 'Zipping...' : `Backup ${months[selectedMonth!]} ${selectedYear}`}
            </button>
          )}
        </div>
      </div>

      {/* Global Search Bar */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px', marginBottom: '24px', padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 200px' }}>
          <input 
            type="text" 
            placeholder="Search by Patient Name, ID, Mobile, or Test Name..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input 
            type="number" 
            placeholder="Year" 
            value={searchFilterYear}
            onChange={(e) => setSearchFilterYear(e.target.value)}
            style={{ width: '80px', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          />
          <select 
            value={searchFilterMonth}
            onChange={(e) => setSearchFilterMonth(e.target.value)}
            style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'white' }}
          >
            <option value="">Month</option>
            {months.map((m, idx) => <option key={m} value={idx}>{m}</option>)}
          </select>
          <input 
            type="number" 
            placeholder="Date" 
            value={searchFilterDate}
            onChange={(e) => setSearchFilterDate(e.target.value)}
            style={{ width: '80px', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          />
        </div>
        <button type="submit" disabled={isSearching} style={{ background: '#1e293b', color: 'white', padding: '10px 24px', borderRadius: '6px', fontWeight: 600, border: 'none', cursor: isSearching ? 'not-allowed' : 'pointer' }}>
          {isSearching ? 'Searching...' : 'Search'}
        </button>
      </form>

      {view === 'YEARS' && (
        <div>
          <button onClick={handleAddYear} style={{ background: '#2563eb', color: 'white', padding: '10px 20px', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer', marginBottom: '24px' }}>
            + Add Year
          </button>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
            {years.map(y => (
              <div 
                key={y.id} 
                onClick={() => { setSelectedYear(y.year); navigateView('MONTHS', y.year); }}
                style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '24px', textAlign: 'center', cursor: 'pointer', fontSize: '24px', fontWeight: 700, color: '#334155', transition: 'all 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.borderColor = '#2563eb'}
                onMouseOut={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
              >
                📁 {y.year}
              </div>
            ))}
            {years.length === 0 && <p style={{ color: '#64748b' }}>No years added yet.</p>}
          </div>
        </div>
      )}

      {view === 'MONTHS' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
          {months.map((m, idx) => (
            <div 
              key={m} 
              onClick={() => { setSelectedMonth(idx); navigateView('CALENDAR', selectedYear, idx); }}
              style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '24px', textAlign: 'center', cursor: 'pointer', fontSize: '18px', fontWeight: 600, color: '#334155', transition: 'all 0.2s' }}
              onMouseOver={(e) => e.currentTarget.style.borderColor = '#2563eb'}
              onMouseOut={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
            >
              📁 {m}
            </div>
          ))}
        </div>
      )}

      {view === 'CALENDAR' && selectedYear && selectedMonth !== null && (
        <div>
          <h2 style={{ marginBottom: '16px', color: '#1e293b' }}>Select a Date in {months[selectedMonth]} {selectedYear}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', maxWidth: '600px' }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} style={{ textAlign: 'center', fontWeight: 600, color: '#64748b', paddingBottom: '8px' }}>{day}</div>
            ))}
            {Array.from({ length: getFirstDayOfMonth(selectedYear, selectedMonth) }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: getDaysInMonth(selectedYear, selectedMonth) }).map((_, i) => {
              const day = i + 1;
              return (
                <div 
                  key={day}
                  onClick={() => { 
                    const date = new Date(selectedYear, selectedMonth, day);
                    setSelectedDate(date); 
                    fetchReportsForDate(date);
                    navigateView('REPORTS', selectedYear, selectedMonth, day); 
                  }}
                  style={{ background: '#f1f5f9', borderRadius: '8px', padding: '16px 8px', textAlign: 'center', cursor: 'pointer', fontWeight: 500, color: '#334155', border: '1px solid transparent' }}
                  onMouseOver={(e) => { e.currentTarget.style.background = '#e2e8f0'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.borderColor = 'transparent'; }}
                >
                  {day}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* REUSABLE REPORT RENDERER */}
      {(view === 'REPORTS' || view === 'SEARCH') && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ color: '#1e293b', margin: 0 }}>
              {view === 'SEARCH' ? `Search Results (${searchResults.length})` : `Reports for ${selectedDate?.toLocaleDateString()}`}
            </h2>
            <div style={{ display: 'flex', gap: '12px' }}>
              {selectedReportIds.size > 0 && (
                <>
                  <button 
                    onClick={() => shareReports((view === 'SEARCH' ? searchResults : reports).filter(r => selectedReportIds.has(r.id)))}
                    style={{ background: '#8b5cf6', color: 'white', padding: '10px 20px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', border: 'none' }}
                  >
                    📤 Share Selected
                  </button>
                  <button 
                    onClick={() => downloadSelectedReports(view === 'SEARCH' ? searchResults : reports)} disabled={isBackingUp}
                    style={{ background: '#3b82f6', color: 'white', padding: '10px 20px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', border: 'none', opacity: isBackingUp ? 0.6 : 1 }}
                  >
                    {isBackingUp ? 'Zipping...' : `📥 Save Selected (${selectedReportIds.size})`}
                  </button>
                </>
              )}
              {view === 'REPORTS' && (
                <button 
                  onClick={() => downloadBackup('day')} disabled={isBackingUp}
                  style={{ background: '#f59e0b', color: 'white', padding: '10px 20px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', border: 'none', opacity: isBackingUp ? 0.6 : 1 }}
                >
                  {isBackingUp ? 'Zipping...' : '📥 Save All Reports'}
                </button>
              )}
              {view === 'REPORTS' && (
                <button 
                  onClick={() => setIsModalOpen(true)}
                  style={{ background: '#10b981', color: 'white', padding: '10px 20px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', border: 'none' }}
                >
                  + Upload Reports
                </button>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {(view === 'SEARCH' ? searchResults : reports).map(report => (
              <div key={report.id} style={{ border: selectedReportIds.has(report.id) ? '2px solid #3b82f6' : '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative' }}>
                <input 
                  type="checkbox" 
                  checked={selectedReportIds.has(report.id)} 
                  onChange={() => toggleReportSelection(report.id)}
                  style={{ position: 'absolute', top: '16px', right: '16px', width: '18px', height: '18px', cursor: 'pointer' }} 
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingRight: '24px' }}>
                  <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '16px' }}>{report.title}</div>
                  <span style={{ fontSize: '11px', background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px', color: '#475569' }}>{report.testName || 'Unknown Test'}</span>
                </div>
                
                {view === 'SEARCH' && (
                  <div style={{ fontSize: '12px', color: '#f59e0b', fontWeight: 600, marginTop: '-8px' }}>
                    📅 Date: {new Date(report.date).toLocaleDateString()}
                  </div>
                )}
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px', color: '#475569', background: '#f8fafc', padding: '12px', borderRadius: '6px' }}>
                  <div><strong>Patient:</strong> {report.patientName || 'N/A'}</div>
                  <div><strong>ID:</strong> {report.patientId || 'N/A'}</div>
                  <div><strong>Mobile:</strong> {report.mobileNumber || 'N/A'}</div>
                  <div><strong>Lab:</strong> {report.labName || 'N/A'}</div>
                  {report.reference && <div style={{ gridColumn: '1 / -1' }}><strong>Ref:</strong> {report.reference}</div>}
                  {report.remarks && <div style={{ gridColumn: '1 / -1' }}><strong>Remarks:</strong> {report.remarks}</div>}
                  {report.needsReminder && (
                    <div style={{ gridColumn: '1 / -1', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      🔔 Reminder: {new Date(report.reminderDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
                
                <div style={{ fontSize: '13px', color: '#64748b', wordBreak: 'break-all' }}>📄 {report.fileName}</div>
                
                <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', paddingTop: '8px' }}>
                  <button onClick={() => shareReports([report])} style={{ flex: 1, background: '#f3e8ff', color: '#7c3aed', padding: '8px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, border: 'none', cursor: 'pointer' }}>
                    Share
                  </button>
                  <button onClick={() => handleDownloadReport(report)} style={{ flex: 1, textAlign: 'center', background: '#f1f5f9', color: '#2563eb', padding: '8px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, border: 'none', cursor: 'pointer' }}>
                    Download
                  </button>
                  <button onClick={() => handleDeleteReport(report.id, view === 'SEARCH')} style={{ flex: 1, background: '#fee2e2', color: '#ef4444', padding: '8px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, border: 'none', cursor: 'pointer' }}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
            
            {(view === 'SEARCH' ? searchResults : reports).length === 0 && (
              <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', color: '#64748b', background: '#f8fafc', borderRadius: '8px' }}>
                {view === 'SEARCH' ? 'No reports matched your search.' : 'No reports uploaded for this date yet.'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: '12px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ margin: '0 0 24px 0', fontSize: '24px', color: '#1e293b' }}>Upload Multiple Reports</h2>
            
            <form onSubmit={handleUploadSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>Patient Name *</label>
                <input required type="text" value={formData.patientName} onChange={e => setFormData({...formData, patientName: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>Patient ID</label>
                <input type="text" value={formData.patientId} onChange={e => setFormData({...formData, patientId: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>Mobile Number</label>
                <input type="tel" value={formData.mobileNumber} onChange={e => setFormData({...formData, mobileNumber: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>Test Name</label>
                <input type="text" value={formData.testName} onChange={e => setFormData({...formData, testName: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>Lab Name</label>
                <input type="text" value={formData.labName} onChange={e => setFormData({...formData, labName: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>Reference</label>
                <input type="text" value={formData.reference} onChange={e => setFormData({...formData, reference: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>Notes / Remarks</label>
                <textarea rows={2} value={formData.remarks} onChange={e => setFormData({...formData, remarks: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', resize: 'none' }} />
              </div>

              <div style={{ gridColumn: '1 / -1', padding: '16px', border: '2px solid #10b981', borderRadius: '8px', background: '#ecfdf5', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input 
                  type="checkbox" 
                  id="needsReminder"
                  checked={formData.needsReminder}
                  onChange={e => setFormData({...formData, needsReminder: e.target.checked})}
                  style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                />
                <label htmlFor="needsReminder" style={{ cursor: 'pointer', fontWeight: 600, color: '#047857' }}>
                  Next Year Reminder Required? (Automatic Follow-up)
                </label>
              </div>

              <div style={{ gridColumn: '1 / -1', padding: '16px', border: '2px dashed #cbd5e1', borderRadius: '8px', textAlign: 'center', background: '#f8fafc' }}>
                <label style={{ cursor: 'pointer', display: 'block' }}>
                  <div style={{ fontWeight: 600, color: '#3b82f6', marginBottom: '4px' }}>Click to Select Multiple Reports (PDF/Image) *</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>
                    {selectedFiles && selectedFiles.length > 0 
                      ? `${selectedFiles.length} files selected` 
                      : 'No files selected'}
                  </div>
                  <input required multiple type="file" onChange={e => setSelectedFiles(e.target.files)} style={{ display: 'none' }} />
                </label>
              </div>

              <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', color: '#475569', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={isUploading} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#2563eb', color: 'white', fontWeight: 600, cursor: isUploading ? 'not-allowed' : 'pointer', opacity: isUploading ? 0.7 : 1 }}>
                  {isUploading ? 'Uploading...' : 'Save All Reports'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Share Modal */}
      {(isPreparingShare || shareReadyFiles) && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: '12px', textAlign: 'center', maxWidth: '400px', width: '90%' }}>
            {isPreparingShare ? (
              <>
                <h3 style={{ marginTop: 0, color: '#1e293b' }}>Preparing File...</h3>
                <p style={{ color: '#64748b' }}>Downloading the large report file from the server. Please wait a few seconds...</p>
                <div style={{ display: 'flex', justifyContent: 'center', margin: '24px 0' }}>
                  <div style={{ border: '4px solid #f3f3f3', borderTop: '4px solid #8b5cf6', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite' }} />
                </div>
              </>
            ) : (
              <>
                <h3 style={{ marginTop: 0, color: '#1e293b' }}>Ready to Share!</h3>
                <p style={{ color: '#64748b' }}>Your files have been successfully downloaded and prepared.</p>
                <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                  <button onClick={() => setShareReadyFiles(null)} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', color: '#475569', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
                  <button onClick={executeShare} style={{ flex: 2, padding: '12px', borderRadius: '8px', border: 'none', background: '#8b5cf6', color: 'white', cursor: 'pointer', fontWeight: 600 }}>Share Now</button>
                </div>
              </>
            )}
          </div>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      )}

    </div>
  );
}
