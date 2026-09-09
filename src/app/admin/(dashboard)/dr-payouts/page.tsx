'use client';

import React, { useState, useRef, useEffect } from 'react';
import styles from './DrPayouts.module.css';
import PayoutReport, { ConsultationRecord } from '@/components/PayoutReport/PayoutReport';

export default function DrPayoutsPage() {
  const [isFormMode, setIsFormMode] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [savedPayouts, setSavedPayouts] = useState<any[]>([]);
  const [downloadingPayout, setDownloadingPayout] = useState<any | null>(null);
  const hiddenReportRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const stored = localStorage.getItem('drPayouts');
    if (stored) {
      try {
        setSavedPayouts(JSON.parse(stored));
      } catch (e) {}
    }
  }, []);

  const savePayout = () => {
    const newPayout = {
      id: Date.now().toString(),
      ...formData,
      records
    };
    const updated = [newPayout, ...savedPayouts];
    setSavedPayouts(updated);
    localStorage.setItem('drPayouts', JSON.stringify(updated));
    setIsPreviewMode(false);
    setIsFormMode(false);
  };

  const viewSavedPayout = (payout: any) => {
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

  const downloadPDF = async (payoutData: any, element: HTMLElement | null) => {
    if (typeof window !== 'undefined' && element) {
      const html2pdf = (await import('html2pdf.js')).default;
      const opt = {
        margin: 0.5,
        filename: `Payout_Report_${payoutData.consultingDoctor.replace(/\s+/g, '_')}_${payoutData.reportingPeriod}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in' as const, format: 'letter', orientation: 'portrait' as const }
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

  const deletePayout = (id: string) => {
    const updated = savedPayouts.filter(p => p.id !== id);
    setSavedPayouts(updated);
    localStorage.setItem('drPayouts', JSON.stringify(updated));
  };

  const [formData, setFormData] = useState({
    consultingDoctor: '',
    consultationMode: 'Audio Consultation',
    reportingPeriod: 'JULY & AUGUST',
    year: new Date().getFullYear().toString(),
    totalPatientsConsulted: 0,
    totalConsultationsCompleted: 0,
    totalPayoutAmount: 0,
    payoutDate: new Date().toISOString().split('T')[0],
    paymentMode: 'UPI',
    transactionReferenceNo: '',
    paymentScreenshotUrl: ''
  });

  const [records, setRecords] = useState<ConsultationRecord[]>([
    {
      sNo: 1,
      patientId: '-',
      patientName: '',
      labReportDate: new Date().toISOString().split('T')[0],
      genDrName: '',
      dietDrName: '',
      status: 'COMPLETED'
    }
  ]);

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
        patientId: '-',
        patientName: '',
        labReportDate: new Date().toISOString().split('T')[0],
        genDrName: formData.consultingDoctor,
        dietDrName: '',
        status: 'COMPLETED'
      }
    ]);
  };

  const removeRecord = (index: number) => {
    setRecords(prev => prev.filter((_, i) => i !== index).map((r, i) => ({ ...r, sNo: i + 1 })));
  };

  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, paymentScreenshotUrl: reader.result as string }));
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
            <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => setIsFormMode(true)}>
              + Add New Payout
            </button>
          </div>
          <div className={styles.formCard}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Doctor Name</th>
                  <th>Period</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {savedPayouts.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: '#777' }}>
                      No payouts recorded yet. Click "+ Add New Payout" to generate a new report.
                    </td>
                  </tr>
                ) : (
                  savedPayouts.map(payout => (
                    <tr key={payout.id}>
                      <td>{payout.consultingDoctor}</td>
                      <td>{payout.reportingPeriod}</td>
                      <td>{payout.payoutDate}</td>
                      <td>₹ {payout.totalPayoutAmount}</td>
                      <td style={{ color: '#28a745', fontWeight: 'bold' }}>GENERATED</td>
                      <td>
                        <button className={`${styles.btn} ${styles.btnPrimary}`} style={{ padding: '4px 8px', fontSize: '12px', marginRight: '5px' }} onClick={() => viewSavedPayout(payout)}>View</button>
                        <button className={`${styles.btn} ${styles.btnSuccess}`} style={{ padding: '4px 8px', fontSize: '12px', marginRight: '5px' }} onClick={() => handleDownloadFromList(payout)}>Download</button>
                        <button className={`${styles.btn} ${styles.btnSecondary}`} style={{ padding: '4px 8px', fontSize: '12px', color: 'red' }} onClick={() => deletePayout(payout.id)}>Delete</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <>
          <div className={styles.header}>
            <h1 className={styles.title}>{isPreviewMode ? 'Report Preview' : 'Create Doctor Payout'}</h1>
            <div style={{ display: 'flex', gap: '10px' }}>
              {isPreviewMode ? (
                <>
                  <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={() => setIsPreviewMode(false)}>
                    Back to Edit
                  </button>
                  <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={savePayout}>
                    Save to List
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
              <input type="text" name="consultingDoctor" value={formData.consultingDoctor} onChange={handleInputChange} placeholder="e.g. Dr. SANTHOSH" />
            </div>
            <div className={styles.formGroup}>
              <label>Consultation Mode</label>
              <input type="text" name="consultationMode" value={formData.consultationMode} onChange={handleInputChange} />
            </div>
            <div className={styles.formGroup}>
              <label>Reporting Period (e.g. JULY & AUGUST)</label>
              <input type="text" name="reportingPeriod" value={formData.reportingPeriod} onChange={handleInputChange} />
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
              <input type="number" name="totalPatientsConsulted" value={formData.totalPatientsConsulted} onChange={handleInputChange} />
            </div>
            <div className={styles.formGroup}>
              <label>Total Consultations Completed</label>
              <input type="number" name="totalConsultationsCompleted" value={formData.totalConsultationsCompleted} onChange={handleInputChange} />
            </div>
            <div className={styles.formGroup}>
              <label>Total Payout Amount (₹)</label>
              <input type="number" name="totalPayoutAmount" value={formData.totalPayoutAmount} onChange={handleInputChange} />
            </div>
          </div>

          <div className={styles.sectionTitle}>Payment Details</div>
          <div className={styles.grid}>
            <div className={styles.formGroup}>
              <label>Payout Date</label>
              <input type="date" name="payoutDate" value={formData.payoutDate} onChange={handleInputChange} />
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
                      <input type="date" value={record.labReportDate} onChange={(e) => handleRecordChange(index, 'labReportDate', e.target.value)} />
                    </td>
                    <td>
                      <input type="text" value={record.genDrName} onChange={(e) => handleRecordChange(index, 'genDrName', e.target.value)} />
                    </td>
                    <td>
                      <input type="text" value={record.dietDrName} onChange={(e) => handleRecordChange(index, 'dietDrName', e.target.value)} />
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
            <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => setIsPreviewMode(true)}>
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
    </div>
  );
}
