import React, { forwardRef } from 'react';
import styles from './PayoutReport.module.css';

export interface ConsultationRecord {
  sNo: number;
  patientId: string;
  patientName: string;
  labReportDate: string;
  genDrName: string;
  dietDrName: string;
  status: string;
}

export interface PayoutReportProps {
  consultingDoctor: string;
  consultationMode: string;
  reportingPeriod: string;
  year: string;
  totalPatientsConsulted: number;
  totalConsultationsCompleted: number;
  totalPayoutAmount: number;
  payoutDate: string;
  paymentMode: string;
  transactionReferenceNo: string;
  records: ConsultationRecord[];
  paymentScreenshotUrl?: string;
}

const PayoutReport = forwardRef<HTMLDivElement, PayoutReportProps>((props, ref) => {
  return (
    <div className={styles.reportContainer} ref={ref}>
      <div className={styles.header}>
        <img 
          src="/images/Benva%20NEW.png" 
          alt="Benva Healthcare" 
          className={styles.logo} 
          crossOrigin="anonymous" 
        />
        <h1 className={styles.title}>DOCTOR CONSULTATION PAYOUT REPORT</h1>
        <div className={styles.year}>{props.year}</div>
      </div>

      <div className={styles.infoBox}>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Consulting Doctor:</span>
          <span className={styles.infoValue}>{props.consultingDoctor}</span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Consultation Mode:</span>
          <span className={styles.infoValue}>{props.consultationMode}</span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Reporting Period:</span>
          <span className={styles.infoValue}>{props.reportingPeriod}</span>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Summary</h2>
        <table className={styles.table}>
          <tbody>
            <tr>
              <td style={{ fontWeight: 'bold', width: '70%' }}>Total Patients Consulted</td>
              <td style={{ fontWeight: 'bold', color: '#0b4e8c' }}>{props.totalPatientsConsulted}</td>
            </tr>
            <tr>
              <td style={{ fontWeight: 'bold' }}>Total Consultations Completed</td>
              <td style={{ fontWeight: 'bold', color: '#0b4e8c' }}>{props.totalConsultationsCompleted}</td>
            </tr>
            <tr>
              <td style={{ fontWeight: 'bold' }}>Total Payout Amount</td>
              <td style={{ fontWeight: 'bold', color: '#0b4e8c' }}>₹ {props.totalPayoutAmount}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Payment Details</h2>
        <table className={styles.table}>
          <tbody>
            <tr>
              <td style={{ fontWeight: 'bold', width: '70%' }}>Payout Date</td>
              <td style={{ fontWeight: 'bold', color: '#0b4e8c' }}>{props.payoutDate}</td>
            </tr>
            <tr>
              <td style={{ fontWeight: 'bold' }}>Payment Mode</td>
              <td style={{ fontWeight: 'bold', color: '#28a745' }}>{props.paymentMode}</td>
            </tr>
            <tr>
              <td style={{ fontWeight: 'bold' }}>Transaction Reference No</td>
              <td style={{ fontWeight: 'bold' }}>{props.transactionReferenceNo}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Consultation Records</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>S.NO</th>
              <th>Patient ID</th>
              <th>Patient Name</th>
              <th>Lab Report Date</th>
              <th>General Doctor Consultant Name</th>
              <th>DIET Doctor Consultant Name</th>
              <th>Status (Completed/Pending)</th>
            </tr>
          </thead>
          <tbody>
            {props.records.map((record, idx) => (
              <tr key={idx}>
                <td>{record.sNo}</td>
                <td>{record.patientId || '-'}</td>
                <td>{record.patientName}</td>
                <td>{record.labReportDate}</td>
                <td>{record.genDrName}</td>
                <td>{record.dietDrName}</td>
                <td className={record.status.toLowerCase() === 'completed' ? styles.statusCompleted : styles.statusPending}>
                  {record.status.toUpperCase()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p style={{ fontSize: '12px', fontStyle: 'italic', marginTop: '10px' }}>
          This report contains the doctor consultation records completed during {props.reportingPeriod} and is prepared for the monthly payout processing.
        </p>
      </div>

      <div className={styles.signature}>
        <p style={{ fontWeight: 'bold', color: '#0b4e8c' }}>Authorized Signatory</p>
        <p>Sunkara sudheer</p>
        <p>BENVA HEALTHCARE PRIVATE LIMITED</p>
      </div>

      {props.paymentScreenshotUrl && (
        <div className={styles.screenshotContainer}>
          <h2 className={styles.sectionTitle} style={{ textAlign: 'left' }}>Payment Screenshot</h2>
          <img 
            src={props.paymentScreenshotUrl} 
            alt="Payment Screenshot" 
            className={styles.screenshot} 
            crossOrigin="anonymous" 
          />
        </div>
      )}
    </div>
  );
});

PayoutReport.displayName = 'PayoutReport';

export default PayoutReport;
