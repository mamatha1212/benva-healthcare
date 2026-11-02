'use client';

import React, { useState, useRef, useEffect } from 'react';
import styles from './DrPayouts.module.css';
import PayoutReport, { ConsultationRecord } from '@/components/PayoutReport/PayoutReport';
import DateInput from '@/components/DateInput/DateInput';
import { formatDate } from '@/lib/dateUtils';

export default function DrPayoutsPage() {
  const [isFormMode, setIsFormMode] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [savedPayouts, setSavedPayouts] = useState<any[]>([]);
  const [downloadingPayout, setDownloadingPayout] = useState<any | null>(null);
  const [editingPayoutId, setEditingPayoutId] = useState<string | null>(null);
  const hiddenReportRef = useRef<HTMLDivElement>(null);
  const [doctors, setDoctors] = useState<any[]>([]);
  
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await fetch('/api/admin/doctors');
        if (res.ok) {
          const data = await res.json();
          setDoctors(data);
        }
      } catch (error) {
        console.error('Error fetching doctors:', error);
      }
    };
    fetchDoctors();
  }, []);

  const [isLoadingPayouts, setIsLoadingPayouts] = useState(true);

  useEffect(() => {
    const fetchPayouts = async () => {
      setIsLoadingPayouts(true);
      try {
        const res = await fetch('/api/payouts');
        if (res.ok) {
          const data = await res.json();
          setSavedPayouts(data);
        }
      } catch (e) {
        console.error('Failed to fetch payouts', e);
      } finally {
        setIsLoadingPayouts(false);
      }
    };
    fetchPayouts();
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (isPreviewMode) {
        url.searchParams.set('mode', 'preview');
      } else if (isFormMode) {
        url.searchParams.set('mode', 'form');
      } else {
        url.searchParams.delete('mode');
      }
      window.history.pushState({}, '', url);
    }
  }, [isFormMode, isPreviewMode]);

  const savePayout = async (navigateToList = true) => {
    try {
      let payoutData: any = { ...formData, records };
      if (editingPayoutId) {
        payoutData.id = editingPayoutId;
      }
      
      const res = await fetch('/api/payouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payoutData)
      });
      
      if (res.ok) {
        const savedData = await res.json();
        let updated;
        if (editingPayoutId) {
          updated = savedPayouts.map(p => p.id === editingPayoutId ? savedData : p);
        } else {
          updated = [savedData, ...savedPayouts];
          setEditingPayoutId(savedData.id);
        }
        setSavedPayouts(updated);
        if (navigateToList) {
          setEditingPayoutId(null);
          setIsPreviewMode(false);
          setIsFormMode(false);
          alert('Payout saved to list successfully!');
        }
        return savedData;
      } else {
        alert('Failed to save payout');
      }
    } catch (e) {
      console.error(e);
      alert('An error occurred while saving.');
    }
  };

  const viewSavedPayout = (payout: any) => {
    setEditingPayoutId(payout.id);
    setFormData({
      consultingDoctor: payout.consultingDoctor,
      consultationMode: payout.consultationMode,
      reportingPeriod: payout.reportingPeriod,
      year: payout.year,
      totalPatientsConsulted: payout.totalPatientsConsulted,
      totalConsultationsCompleted: payout.totalConsultationsCompleted,
      totalPayoutAmount: payout.totalPayoutAmount,
      payoutDate: payout.payoutDate,
      paymentMode: payout.paymentMode,
      transactionReferenceNo: payout.transactionReferenceNo,
      paymentScreenshotUrl: payout.paymentScreenshotUrl || ''
    });
    setRecords(payout.records || []);
    setIsFormMode(true);
    setIsPreviewMode(true);
  };

  const [payoutToDelete, setPayoutToDelete] = useState<any | null>(null);
  const [reconfirmChecked, setReconfirmChecked] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const downloadPDF = async (payoutData: any, element: HTMLElement | null) => {
    if (typeof window !== 'undefined' && element) {
      const html2pdf = (await import('html2pdf.js')).default;
      const opt = {
        margin: [0.35, 0.4, 0.35, 0.4],
        filename: `Payout_Report_${(payoutData.consultingDoctor || 'Doctor').replace(/\s+/g, '_')}_${(payoutData.reportingPeriod || 'Period').replace(/\s+/g, '_')}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true, scrollY: 0 },
        jsPDF: { unit: 'in' as const, format: 'a4', orientation: 'portrait' as const },
        pagebreak: { 
          mode: ['avoid-all', 'css'],
          avoid: ['tr', '.screenshotContainer', '.infoBox', '.signature']
        }
      };

      await html2pdf().set(opt).from(element).save();
    }
  };

  useEffect(() => {
    if (downloadingPayout && hiddenReportRef.current) {
      downloadPDF(downloadingPayout, hiddenReportRef.current).then(() => {
        setDownloadingPayout(null);
      });
    }
  }, [downloadingPayout]);

  const handleDownloadFromList = (payout: any) => {
    setDownloadingPayout(payout);
  };

  const confirmDeletePayout = async () => {
    if (!payoutToDelete || !reconfirmChecked) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/payouts/${payoutToDelete.id}`, { method: 'DELETE' });
      if (res.ok) {
        setSavedPayouts(prev => prev.filter(p => p.id !== payoutToDelete.id));
        setPayoutToDelete(null);
        setReconfirmChecked(false);
      } else {
        alert('Failed to delete payout. Please try again.');
      }
    } catch (e) {
      console.error('Delete payout error:', e);
      alert('An error occurred while deleting the payout.');
    } finally {
      setIsDeleting(false);
    }
  };

  const [formData, setFormData] = useState<any>({
    consultingDoctor: '',
    consultationMode: 'Audio Consultation',
    reportingPeriod: '',
    year: new Date().getFullYear().toString(),
    totalPatientsConsulted: '',
    totalConsultationsCompleted: '',
    totalPayoutAmount: '',
    payoutDate: new Date().toISOString().split('T')[0],
    paymentMode: 'UPI',
    transactionReferenceNo: '',
    paymentScreenshotUrl: ''
  });

  const [records, setRecords] = useState<ConsultationRecord[]>([
    {
      sNo: 1,
      patientId: '',
      patientName: '',
      labReportDate: new Date().toISOString().split('T')[0],
      genDrName: '',
      dietDrName: '',
      status: 'COMPLETED'
    }
  ]);

  const handleAddNewPayout = () => {
    setEditingPayoutId(null);
    setFormData({
      consultingDoctor: '',
      consultationMode: 'Audio Consultation',
      reportingPeriod: '',
      year: new Date().getFullYear().toString(),
      totalPatientsConsulted: '',
      totalConsultationsCompleted: '',
      totalPayoutAmount: '',
      payoutDate: new Date().toISOString().split('T')[0],
      paymentMode: 'UPI',
      transactionReferenceNo: '',
      paymentScreenshotUrl: ''
    });
    setRecords([
      {
        sNo: 1,
        patientId: '',
        patientName: '',
        labReportDate: new Date().toISOString().split('T')[0],
        genDrName: '',
        dietDrName: '',
        status: 'COMPLETED'
      }
    ]);
    setIsFormMode(true);
    setIsPreviewMode(false);
  };

  const reportRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRecordChange = (index: number, field: keyof ConsultationRecord, value: string | number) => {
    const newRecords = [...records];
    newRecords[index] = { ...newRecords[index], [field]: value };
    setRecords(newRecords);
  };

  const addRecord = () => {
    setRecords(prev => [
      ...prev,
      {
        sNo: prev.length + 1,
        patientId: '',
        patientName: '',
        labReportDate: new Date().toISOString().split('T')[0],
        genDrName: formData.consultingDoctor,
        dietDrName: '',
        status: 'COMPLETED'
      }
    ]);
  };

  const removeRecord = (index: number) => {
    if (!window.confirm('Do you want to delete are you sure?')) return;
    setRecords(prev => prev.filter((_, i) => i !== index).map((r, i) => ({ ...r, sNo: i + 1 })));
  };

  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const rawResult = reader.result as string;
        // Compress image using canvas to prevent slow network payloads
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 1200;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressed = canvas.toDataURL('image/jpeg', 0.82);
            setFormData(prev => ({ ...prev, paymentScreenshotUrl: compressed }));
          } else {
            setFormData(prev => ({ ...prev, paymentScreenshotUrl: rawResult }));
          }
        };
        img.onerror = () => {
          setFormData(prev => ({ ...prev, paymentScreenshotUrl: rawResult }));
        };
        img.src = rawResult;
      };
      reader.readAsDataURL(file);
    }
  };


  return (
    <div className={styles.container}>
      {!isFormMode ? (
        <>
          <div className={styles.header}>
            <h1 className={styles.title}>Doctor Payouts</h1>
            <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleAddNewPayout}>
              + Add New Payout
            </button>
          </div>
          <div className={styles.formCard}>
            <div style={{ overflowX: 'auto' }}>
              <table className={styles.table}>
              <thead>
                <tr>
                  <th style={{ width: '50px' }}>S.NO</th>
                  <th>Doctor Name</th>
                  <th>Period</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoadingPayouts ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
                        <div className={styles.spinner} />
                        <span style={{ fontWeight: 500 }}>Loading payouts...</span>
                      </div>
                    </td>
                  </tr>
                ) : savedPayouts.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: '#777' }}>
                      No payouts recorded yet. Click "+ Add New Payout" to generate a new report.
                    </td>
                  </tr>
                ) : (
                  savedPayouts.map((payout, index) => (
                    <tr key={payout.id}>
                      <td>{index + 1}</td>
                      <td>{payout.consultingDoctor}</td>
                      <td>{payout.reportingPeriod}</td>
                      <td>{formatDate(payout.payoutDate)}</td>
                      <td>₹ {payout.totalPayoutAmount}</td>
                      <td style={{ color: '#28a745', fontWeight: 'bold' }}>GENERATED</td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button 
                            className={`${styles.btn} ${styles.btnPrimary}`} 
                            style={{ padding: '6px 12px', fontSize: '12px' }} 
                            onClick={() => viewSavedPayout(payout)}
                          >
                            View
                          </button>
                          <button 
                            className={`${styles.btn} ${styles.btnSuccess}`} 
                            style={{ padding: '6px 12px', fontSize: '12px' }} 
                            onClick={() => handleDownloadFromList(payout)}
                          >
                            Download
                          </button>
                          <button 
                            className={`${styles.btn} ${styles.btnDanger}`} 
                            style={{ padding: '6px 12px', fontSize: '12px' }} 
                            onClick={() => {
                              setPayoutToDelete(payout);
                              setReconfirmChecked(false);
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className={styles.header}>
            <h1 className={styles.title}>{isPreviewMode ? 'Report Preview' : 'Create Doctor Payout'}</h1>
            <div className={styles.headerActions}>
              {isPreviewMode ? (
                <>
                  <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={() => setIsPreviewMode(false)}>
                    Back to Edit
                  </button>
                  <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => savePayout(true)}>
                    Save to List
                  </button>
                  <button 
                    className={`${styles.btn} ${styles.btnSuccess}`} 
                    onClick={async () => {
                      if (!editingPayoutId) {
                        await savePayout(false);
                      }
                      downloadPDF(formData, reportRef.current);
                    }}
                  >
                    Download PDF
                  </button>
                  <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={() => { setIsPreviewMode(false); setIsFormMode(false); }}>
                    Close
                  </button>
                </>
              ) : (
                <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={() => setIsFormMode(false)}>
                  Back to List
                </button>
              )}
            </div>
          </div>

      {!isPreviewMode ? (
        <div className={styles.formCard}>
          <div className={styles.sectionTitle}>General Information</div>
          <div className={styles.grid}>
            <div className={styles.formGroup}>
              <label>Consulting Doctor</label>
              <select name="consultingDoctor" value={formData.consultingDoctor} onChange={handleInputChange}>
                <option value="">Select a Doctor</option>
                {doctors.map(doc => (
                  <option key={doc.id} value={doc.name}>{doc.name}</option>
                ))}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Consultation Mode</label>
              <select name="consultationMode" value={formData.consultationMode} onChange={handleInputChange}>
                <option value="Audio Consultation">Audio Consultation</option>
                <option value="Video Consultation">Video Consultation</option>
                <option value="In-Person Consultation">In-Person Consultation</option>
                <option value="Home Visit Consultation">Home Visit Consultation</option>
                <option value="Chat Consultation">Chat Consultation</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Reporting Period (e.g. JULY & AUGUST)</label>
              <input 
                type="text" 
                name="reportingPeriod" 
                placeholder="e.g. JULY & AUGUST"
                value={formData.reportingPeriod} 
                onChange={handleInputChange} 
              />
            </div>
            <div className={styles.formGroup}>
              <label>Year</label>
              <input type="text" name="year" value={formData.year} onChange={handleInputChange} />
            </div>
          </div>

          <div className={styles.sectionTitle}>Summary</div>
          <div className={styles.grid}>
            <div className={styles.formGroup}>
              <label>Total Patients Consulted</label>
              <input 
                type="number" 
                name="totalPatientsConsulted" 
                placeholder="0"
                value={formData.totalPatientsConsulted} 
                onChange={handleInputChange} 
              />
            </div>
            <div className={styles.formGroup}>
              <label>Total Consultations Completed</label>
              <input 
                type="number" 
                name="totalConsultationsCompleted" 
                placeholder="0"
                value={formData.totalConsultationsCompleted} 
                onChange={handleInputChange} 
              />
            </div>
            <div className={styles.formGroup}>
              <label>Total Payout Amount (₹)</label>
              <input 
                type="number" 
                name="totalPayoutAmount" 
                placeholder="0"
                value={formData.totalPayoutAmount} 
                onChange={handleInputChange} 
              />
            </div>
          </div>

          <div className={styles.sectionTitle}>Payment Details</div>
          <div className={styles.grid}>
            <div className={styles.formGroup}>
              <label>Payout Date</label>
              <DateInput name="payoutDate" value={formData.payoutDate} onChange={handleInputChange} />
            </div>
            <div className={styles.formGroup}>
              <label>Payment Mode</label>
              <select name="paymentMode" value={formData.paymentMode} onChange={handleInputChange}>
                <option value="UPI">UPI</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cash">Cash</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Transaction Reference No</label>
              <input type="text" name="transactionReferenceNo" value={formData.transactionReferenceNo} onChange={handleInputChange} placeholder="e.g. UTR:127977062596" />
            </div>
            <div className={styles.formGroup}>
              <label>Payment Screenshot</label>
              <input type="file" accept="image/*" onChange={handleScreenshotUpload} />
              {formData.paymentScreenshotUrl && (
                <div style={{ marginTop: '10px' }}>
                  <img src={formData.paymentScreenshotUrl} alt="Preview" style={{ maxWidth: '200px', maxHeight: '100px', objectFit: 'contain', border: '1px solid #ddd', borderRadius: '4px' }} />
                </div>
              )}
            </div>
          </div>

          <div className={styles.sectionTitle}>
            Consultation Records
            <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={addRecord}>
              + Add Record
            </button>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th style={{ width: '50px' }}>S.NO</th>
                  <th>Patient ID</th>
                  <th>Patient Name</th>
                  <th>Report Date</th>
                  <th>Gen Dr. Name</th>
                  <th>Diet Dr. Name</th>
                  <th>Status</th>
                  <th style={{ width: '80px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record, index) => (
                  <tr key={index}>
                    <td>{record.sNo}</td>
                    <td>
                      <input type="text" value={record.patientId} onChange={(e) => handleRecordChange(index, 'patientId', e.target.value)} />
                    </td>
                    <td>
                      <input type="text" value={record.patientName} onChange={(e) => handleRecordChange(index, 'patientName', e.target.value)} />
                    </td>
                    <td>
                      <DateInput value={record.labReportDate} onChange={(e) => handleRecordChange(index, 'labReportDate', e.target.value)} />
                    </td>
                    <td>
                      <select value={record.genDrName} onChange={(e) => handleRecordChange(index, 'genDrName', e.target.value)}>
                        <option value="">Select Doctor</option>
                        {doctors.map(doc => (
                          <option key={doc.id} value={doc.name}>{doc.name}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <select value={record.dietDrName} onChange={(e) => handleRecordChange(index, 'dietDrName', e.target.value)}>
                        <option value="">Select Dietician</option>
                        {doctors.map(doc => (
                          <option key={doc.id} value={doc.name}>{doc.name}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <select value={record.status} onChange={(e) => handleRecordChange(index, 'status', e.target.value)}>
                        <option value="COMPLETED">COMPLETED</option>
                        <option value="PENDING">PENDING</option>
                      </select>
                    </td>
                    <td>
                      <button type="button" className={styles.btnRemove} onClick={() => removeRecord(index)}>Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.actions}>
            <button type="button" className={`${styles.btn} ${styles.btnSecondary}`} onClick={() => savePayout(true)}>
              Save Payout
            </button>
            <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => setIsPreviewMode(true)}>
              Preview & Generate Report
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.previewContainer}>
          <div className={styles.reportWrapper}>
            <PayoutReport 
              ref={reportRef}
              consultingDoctor={formData.consultingDoctor}
              consultationMode={formData.consultationMode}
              reportingPeriod={formData.reportingPeriod}
              year={formData.year}
              totalPatientsConsulted={Number(formData.totalPatientsConsulted)}
              totalConsultationsCompleted={Number(formData.totalConsultationsCompleted)}
              totalPayoutAmount={Number(formData.totalPayoutAmount)}
              payoutDate={formData.payoutDate}
              paymentMode={formData.paymentMode}
              transactionReferenceNo={formData.transactionReferenceNo}
              records={records}
              paymentScreenshotUrl={formData.paymentScreenshotUrl}
            />
          </div>
        </div>
      )}
        </>
      )}

      {/* Hidden container for rendering reports to be downloaded from the list view */}
      {downloadingPayout && (
        <div style={{ position: 'absolute', top: '-9999px', left: '-9999px', width: '800px' }}>
          <PayoutReport 
            ref={hiddenReportRef}
            consultingDoctor={downloadingPayout.consultingDoctor}
            consultationMode={downloadingPayout.consultationMode}
            reportingPeriod={downloadingPayout.reportingPeriod}
            year={downloadingPayout.year}
            totalPatientsConsulted={Number(downloadingPayout.totalPatientsConsulted)}
            totalConsultationsCompleted={Number(downloadingPayout.totalConsultationsCompleted)}
            totalPayoutAmount={Number(downloadingPayout.totalPayoutAmount)}
            payoutDate={downloadingPayout.payoutDate}
            paymentMode={downloadingPayout.paymentMode}
            transactionReferenceNo={downloadingPayout.transactionReferenceNo}
            records={downloadingPayout.records}
            paymentScreenshotUrl={downloadingPayout.paymentScreenshotUrl}
          />
        </div>
      )}
      {/* Reconfirmation Modal for Deleting Payout */}
      {payoutToDelete && (
        <div className={styles.modalOverlay} onClick={() => !isDeleting && setPayoutToDelete(null)}>
          <div className={styles.deleteModal} onClick={e => e.stopPropagation()}>
            <div className={styles.deleteModalHeader}>
              <div className={styles.deleteIconContainer}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  <line x1="10" y1="11" x2="10" y2="17"></line>
                  <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
              </div>
              <div>
                <h3 className={styles.deleteModalTitle}>Confirm Delete Payout</h3>
                <p className={styles.deleteModalSubtitle}>Please reconfirm before deleting this record.</p>
              </div>
            </div>

            <div className={styles.reconfirmWarning}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              <span>Warning: This action is permanent and cannot be undone. All consultation records in this report will be deleted.</span>
            </div>

            <div className={styles.deleteDetailsBox}>
              <div className={styles.deleteDetailRow}>
                <span className={styles.deleteDetailLabel}>Doctor Name:</span>
                <span className={styles.deleteDetailValue}>{payoutToDelete.consultingDoctor}</span>
              </div>
              <div className={styles.deleteDetailRow}>
                <span className={styles.deleteDetailLabel}>Reporting Period:</span>
                <span className={styles.deleteDetailValue}>{payoutToDelete.reportingPeriod} ({payoutToDelete.year})</span>
              </div>
              <div className={styles.deleteDetailRow}>
                <span className={styles.deleteDetailLabel}>Payout Amount:</span>
                <span className={styles.deleteDetailValue} style={{ color: '#059669', fontWeight: 700 }}>₹ {payoutToDelete.totalPayoutAmount}</span>
              </div>
              <div className={styles.deleteDetailRow}>
                <span className={styles.deleteDetailLabel}>Payout Date:</span>
                <span className={styles.deleteDetailValue}>{formatDate(payoutToDelete.payoutDate)}</span>
              </div>
            </div>

            <label className={styles.reconfirmCheckboxLabel}>
              <input 
                type="checkbox" 
                className={styles.reconfirmCheckbox}
                checked={reconfirmChecked} 
                onChange={e => setReconfirmChecked(e.target.checked)} 
              />
              <span>Yes, I reconfirm that I want to permanently delete this doctor payout report.</span>
            </label>

            <div className={styles.deleteModalActions}>
              <button 
                type="button"
                className={`${styles.btn} ${styles.btnSecondary}`} 
                disabled={isDeleting}
                onClick={() => setPayoutToDelete(null)}
              >
                Cancel
              </button>
              <button 
                type="button"
                className={`${styles.btn} ${styles.btnDanger}`} 
                disabled={!reconfirmChecked || isDeleting}
                onClick={confirmDeletePayout}
              >
                {isDeleting ? 'Deleting...' : 'Confirm & Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
