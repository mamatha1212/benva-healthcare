'use client';

import React, { useState } from 'react';
import InvoicePrintView, { InvoiceData } from './InvoicePrintView';

interface Props {
  invoice: any | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export default function InvoiceDetailModal({ invoice, isOpen, onClose, onUpdate }: Props) {
  const [activeTab, setActiveTab] = useState<'VIEW' | 'HISTORY' | 'PAYMENT' | 'CANCEL'>('VIEW');
  const [cancelReason, setCancelReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);

  if (!isOpen || !invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleSendWhatsApp = () => {
    const phone = invoice.patient?.phone || invoice.patientPhone;
    if (!phone) {
      alert('Patient phone number is not available.');
      return;
    }
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const msg = `Hello ${invoice.patient?.name || 'Customer'},\nHere is your invoice ${invoice.invoiceNo} from Benva Healthcare for ₹${Number(invoice.totalAmount).toFixed(2)}.\nStatus: ${invoice.paymentStatus}.\nThank you for choosing Benva Healthcare!`;
    const url = `https://wa.me/91${cleanPhone.slice(-10)}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  const handleSendEmail = () => {
    const email = invoice.patient?.email || invoice.patientEmail;
    const subject = encodeURIComponent(`Invoice ${invoice.invoiceNo} - Benva Healthcare`);
    const body = encodeURIComponent(`Dear ${invoice.patient?.name || 'Customer'},\n\nPlease find details for your invoice ${invoice.invoiceNo} of amount ₹${Number(invoice.totalAmount).toFixed(2)}.\n\nRegards,\nBenva Healthcare Team\nPhone: 9010681168`);
    window.open(`mailto:${email || ''}?subject=${subject}&body=${body}`, '_blank');
  };

  const handleCancelInvoice = async () => {
    if (!confirm('Are you sure you want to cancel this invoice? Cancelled invoices cannot be undone, and numbers cannot be reused.')) {
      return;
    }
    setIsProcessing(true);
    try {
      const res = await fetch('/api/admin/invoices', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: invoice.id,
          action: 'CANCEL',
          cancellationReason: cancelReason || 'Cancelled by admin',
        })
      });
      if (!res.ok) throw new Error('Failed to cancel invoice');
      alert('Invoice cancelled successfully.');
      onUpdate();
      onClose();
    } catch (e: any) {
      alert(e.message || 'Error cancelling invoice');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRecordPayment = async () => {
    const newPaid = (Number(invoice.paidAmount) || 0) + Number(paymentAmount);
    const newDue = Math.max(0, (Number(invoice.totalAmount) || 0) - newPaid);

    setIsProcessing(true);
    try {
      const res = await fetch('/api/admin/invoices', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: invoice.id,
          action: 'RECORD_PAYMENT',
          paidAmount: newPaid,
          dueAmount: newDue,
        })
      });
      if (!res.ok) throw new Error('Failed to record payment');
      alert('Payment recorded successfully.');
      onUpdate();
      onClose();
    } catch (e: any) {
      alert(e.message || 'Error recording payment');
    } finally {
      setIsProcessing(false);
    }
  };

  const history = invoice.history || [];

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(4px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '960px',
        maxHeight: '94vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden'
      }}>
        {/* Top Control Bar */}
        <div style={{
          padding: '14px 20px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#f8fafc'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{
              backgroundColor: invoice.billType === 'GST' ? '#e0f2fe' : '#f1f5f9',
              color: invoice.billType === 'GST' ? '#0369a1' : '#475569',
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '800'
            }}>
              {invoice.billType === 'GST' ? 'GST Invoice' : 'Non-GST Bill'}
            </span>
            <span style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>
              {invoice.invoiceNo}
            </span>
            <span style={{
              fontSize: '11px',
              fontWeight: '700',
              padding: '3px 8px',
              borderRadius: '12px',
              backgroundColor: invoice.invoiceStatus === 'CANCELLED' ? '#fee2e2' : '#dcfce7',
              color: invoice.invoiceStatus === 'CANCELLED' ? '#dc2626' : '#15803d'
            }}>
              {invoice.invoiceStatus || 'GENERATED'}
            </span>
            <span style={{
              fontSize: '11px',
              fontWeight: '700',
              padding: '3px 8px',
              borderRadius: '12px',
              backgroundColor: invoice.paymentStatus === 'PAID' ? '#dcfce7' : (invoice.paymentStatus === 'PARTIALLY_PAID' ? '#fef9c3' : '#fee2e2'),
              color: invoice.paymentStatus === 'PAID' ? '#15803d' : (invoice.paymentStatus === 'PARTIALLY_PAID' ? '#854d0e' : '#dc2626')
            }}>
              {invoice.paymentStatus}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handlePrint}
              style={{
                padding: '6px 14px',
                backgroundColor: '#0284c7',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>🖨️</span> Print / PDF
            </button>
            <button
              onClick={handleSendWhatsApp}
              style={{
                padding: '6px 12px',
                backgroundColor: '#25D366',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span>💬</span> WhatsApp
            </button>
            <button
              onClick={handleSendEmail}
              style={{
                padding: '6px 12px',
                backgroundColor: '#475569',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              ✉️ Email
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '20px',
                color: '#64748b',
                cursor: 'pointer',
                padding: '4px 8px'
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tab Headers */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #e2e8f0',
          backgroundColor: '#ffffff',
          padding: '0 20px'
        }}>
          {[
            { key: 'VIEW', label: '📄 Invoice View' },
            { key: 'HISTORY', label: '🕒 Audit Trail & History' },
            { key: 'PAYMENT', label: '💳 Record Payment' },
            { key: 'CANCEL', label: '🚫 Cancel Invoice' },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key as any)}
              style={{
                padding: '12px 18px',
                border: 'none',
                background: 'none',
                fontSize: '13px',
                fontWeight: activeTab === t.key ? '800' : '600',
                color: activeTab === t.key ? '#0284c7' : '#64748b',
                borderBottom: activeTab === t.key ? '3px solid #0284c7' : '3px solid transparent',
                cursor: 'pointer'
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {activeTab === 'VIEW' && (
            <div>
              <InvoicePrintView invoice={invoice} />
            </div>
          )}

          {activeTab === 'HISTORY' && (
            <div style={{ maxWidth: '680px', margin: '0 auto' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', marginBottom: '16px' }}>
                Invoice Audit Trail & Action History
              </h3>
              <div style={{ borderLeft: '2px solid #cbd5e1', paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '-22px', top: '2px', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#0284c7' }} />
                  <div style={{ fontWeight: '700', fontSize: '13px', color: '#0f172a' }}>Invoice Created</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>
                    Date: {new Date(invoice.createdAt || invoice.billDate).toLocaleString()}
                  </div>
                  <div style={{ fontSize: '12px', color: '#334155', marginTop: '2px' }}>
                    Created by Administrator • Initial Total: ₹{Number(invoice.totalAmount).toFixed(2)}
                  </div>
                </div>

                {history.map((h: any, idx: number) => (
                  <div key={idx} style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '-22px', top: '2px', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#64748b' }} />
                    <div style={{ fontWeight: '700', fontSize: '13px', color: '#0f172a' }}>{h.action || 'Activity'}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      Date: {new Date(h.date || Date.now()).toLocaleString()}
                    </div>
                    {h.reason && <div style={{ fontSize: '12px', color: '#dc2626', marginTop: '2px' }}>Reason: {h.reason}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'PAYMENT' && (
            <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', marginBottom: '12px' }}>
                Record Payment for {invoice.invoiceNo}
              </h3>
              <div style={{ marginBottom: '14px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: '#64748b' }}>Total Invoice Amount:</span>
                  <span style={{ fontWeight: '700' }}>₹{Number(invoice.totalAmount).toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: '#16a34a' }}>Already Paid:</span>
                  <span style={{ fontWeight: '700', color: '#16a34a' }}>₹{Number(invoice.paidAmount).toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#dc2626' }}>Current Balance Due:</span>
                  <span style={{ fontWeight: '800', color: '#dc2626' }}>₹{Number(invoice.dueAmount).toFixed(2)}</span>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '6px' }}>
                  New Payment Received (₹)
                </label>
                <input
                  type="number"
                  min="1"
                  max={invoice.dueAmount}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  style={{ width: '100%', padding: '10px 12px', fontSize: '14px', fontWeight: '700', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                />
              </div>

              <button
                type="button"
                onClick={handleRecordPayment}
                disabled={isProcessing || paymentAmount <= 0}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#16a34a',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '800',
                  cursor: isProcessing || paymentAmount <= 0 ? 'not-allowed' : 'pointer'
                }}
              >
                {isProcessing ? 'Recording...' : `Record Payment of ₹${paymentAmount.toFixed(2)}`}
              </button>
            </div>
          )}

          {activeTab === 'CANCEL' && (
            <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px', backgroundColor: '#fef2f2', borderRadius: '10px', border: '1px solid #fecaca' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#dc2626', marginBottom: '8px' }}>
                Cancel Invoice {invoice.invoiceNo}
              </h3>
              <p style={{ fontSize: '12px', color: '#7f1d1d', marginBottom: '16px', lineHeight: '1.5' }}>
                Specification Policy: Once generated, invoice numbers cannot be deleted or reused. Cancelling will mark this invoice as CANCELLED in the system audit history.
              </p>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', display: 'block', marginBottom: '6px' }}>
                  Cancellation Reason *
                </label>
                <textarea
                  rows={3}
                  placeholder="Enter reason for cancellation..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  style={{ width: '100%', padding: '10px', fontSize: '13px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                />
              </div>

              <button
                type="button"
                onClick={handleCancelInvoice}
                disabled={isProcessing || !cancelReason.trim()}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '800',
                  cursor: isProcessing || !cancelReason.trim() ? 'not-allowed' : 'pointer'
                }}
              >
                {isProcessing ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
