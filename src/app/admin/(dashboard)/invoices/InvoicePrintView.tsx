'use client';

import React from 'react';

export interface InvoiceItemData {
  id?: string;
  itemName: string;
  hsn?: string;
  batch?: string;
  exp?: string;
  qty: number;
  unit?: string;
  price: number;
  discount: number;
  taxRate?: number;
  amount: number;
  cgst: number;
  sgst: number;
  total: number;
}

export interface InvoiceData {
  id?: string;
  invoiceNo: string;
  billDate: string | Date;
  placeOfSupply?: string;
  billType: 'GST' | 'NON_GST';
  module: 'LAB_TESTS' | 'MEDICINES' | 'DOCTOR' | 'DIETITIAN';
  invoiceStatus?: 'DRAFT' | 'GENERATED' | 'CANCELLED';
  paymentStatus?: 'PAID' | 'PARTIALLY_PAID' | 'PENDING';
  patient?: {
    name: string;
    phone: string;
    uhid?: string | null;
    address?: string | null;
    email?: string | null;
  };
  patientName?: string;
  patientPhone?: string;
  patientUhid?: string;
  patientAddress?: string;
  totalAmount: number;
  discount: number;
  cgst: number;
  sgst: number;
  paidAmount: number;
  dueAmount: number;
  serviceCharge?: number;
  parsedItems?: InvoiceItemData[];
  items?: InvoiceItemData[];
  notes?: string;
  doctorName?: string;
  consultationType?: string;
  dietitianName?: string;
  planDuration?: string;
  patientAge?: string | number;
  patientGender?: string;
  paymentMode?: string;
}

// Convert numbers to Indian Rupees in words
export function numberToWords(num: number): string {
  if (isNaN(num) || num === 0) return 'Zero Rupees only';
  
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty ', 'Thirty ', 'Forty ', 'Fifty ', 'Sixty ', 'Seventy ', 'Eighty ', 'Ninety '];

  function inWords(n: number): string {
    let str = '';
    if (n > 99) {
      str += a[Math.floor(n / 100)] + 'Hundred ';
      n %= 100;
    }
    if (n > 19) {
      str += b[Math.floor(n / 10)] + a[n % 10];
    } else {
      str += a[n];
    }
    return str;
  }

  const crore = Math.floor(num / 10000000);
  num %= 10000000;
  const lakh = Math.floor(num / 100000);
  num %= 100000;
  const thousand = Math.floor(num / 1000);
  num %= 1000;
  const remainder = Math.floor(num);
  const paise = Math.round((num - remainder) * 100);

  let result = '';
  if (crore) result += inWords(crore) + 'Crore ';
  if (lakh) result += inWords(lakh) + 'Lakh ';
  if (thousand) result += inWords(thousand) + 'Thousand ';
  if (remainder) result += inWords(remainder);

  result = result.trim() + ' Rupees';

  if (paise > 0) {
    result += ' and ' + inWords(paise).trim() + ' Paisa';
  }

  return result + ' only';
}

function formatDateTime(d: string | Date | undefined): string {
  if (!d) return '';
  const date = new Date(d);
  if (isNaN(date.getTime())) return '';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const day = String(date.getDate()).padStart(2, '0');
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const hoursStr = String(hours).padStart(2, '0');
  return `${day} ${month} ${year}, ${hoursStr}:${minutes} ${ampm}`;
}

export default function InvoicePrintView({ 
  invoice, 
  templateOverride 
}: { 
  invoice: InvoiceData;
  templateOverride?: 'HEALTH_CHECKUP' | 'PHARMACY';
}) {
  const isHealthCheckup = templateOverride 
    ? templateOverride === 'HEALTH_CHECKUP' 
    : (invoice.module === 'LAB_TESTS');

  const items = invoice.parsedItems || invoice.items || [];
  const isGst = invoice.billType !== 'NON_GST';
  
  const customerName = invoice.patient?.name || invoice.patientName || 'Customer';
  const customerPhone = invoice.patient?.phone || invoice.patientPhone || '';
  const customerUhid = invoice.patient?.uhid || invoice.patientUhid || 'N/A';
  const customerAddress = invoice.patient?.address || invoice.patientAddress || 'Kakinada, Andhra Pradesh';

  const dateObj = new Date(invoice.billDate || Date.now());
  const formattedDate = `${String(dateObj.getDate()).padStart(2, '0')}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${dateObj.getFullYear()}`;
  const formattedDateTime = formatDateTime(invoice.billDate || dateObj);

  // Totals calculations
  const totalQty = items.reduce((acc, it) => acc + (Number(it.qty) || 0), 0);
  const totalDiscount = Number(invoice.discount) || items.reduce((acc, it) => acc + (Number(it.discount) || 0), 0);
  const totalGst = items.reduce((acc, it) => acc + (Number(it.cgst || 0) + Number(it.sgst || 0)), 0);
  const grandTotal = Number(invoice.totalAmount) || 0;
  const paid = Number(invoice.paidAmount) || 0;
  const balance = Number(invoice.dueAmount) || 0;
  const serviceCharge = Number(invoice.serviceCharge) || 0;

  // Compute MRP total
  const computedMrp = items.reduce((acc, it) => {
    const qty = Number(it.qty) || 1;
    const price = Number(it.price) || 0;
    const disc = Number(it.discount) || 0;
    const tot = Number(it.total) || 0;
    return acc + (price * qty > 0 ? price * qty : tot + disc);
  }, 0);
  const totalMrp = computedMrp > grandTotal ? computedMrp : grandTotal + totalDiscount;

  // Taxable amount across items
  const taxableTotal = items.reduce((acc, it) => acc + (Number(it.amount) || (Number(it.price) * Number(it.qty) - Number(it.discount))), 0);
  const totalCgst = items.reduce((acc, it) => acc + (Number(it.cgst) || 0), 0);
  const totalSgst = items.reduce((acc, it) => acc + (Number(it.sgst) || 0), 0);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page {
            size: A4 portrait;
            margin: 6mm;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            height: auto !important;
            background: #ffffff !important;
          }
          .no-print, header, nav, aside, button {
            display: none !important;
          }
          div[style*="fixed"] {
            position: static !important;
            background: transparent !important;
            backdrop-filter: none !important;
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
            overflow: visible !important;
          }
          div[style*="maxHeight: 94vh"], div[style*="max-height: 94vh"], div[style*="overflowY: auto"], div[style*="overflow-y: auto"] {
            max-height: none !important;
            height: auto !important;
            overflow: visible !important;
            box-shadow: none !important;
          }
          .benva-invoice-sheet {
            position: static !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 auto !important;
            box-shadow: none !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        }
      `}} />

      {isHealthCheckup ? (
        /* =========================================================================
           HEALTH CHECKUPS & LAB TESTS OFFICIAL CORPORATE INVOICE TEMPLATE
           Matches Benva_Healthcare_Invoice-1.pdf
           ========================================================================= */
        <div 
          className="benva-invoice-sheet" 
          id="benva-invoice-printable" 
          style={{
            width: '100%',
            maxWidth: '820px',
            margin: '0 auto',
            backgroundColor: '#ffffff',
            color: '#0f172a',
            fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif',
            fontSize: '11px',
            lineHeight: '1.4',
            border: '1px solid #cbd5e1',
            padding: '24px 28px',
            boxSizing: 'border-box',
            position: 'relative'
          }}
        >
          {/* Top Company Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            paddingBottom: '14px',
            borderBottom: '1px solid #e2e8f0',
            gap: '16px'
          }}>
            {/* Logo and Slogan */}
            <div>
              <img 
                src="/images/Benva%20NEW.png" 
                alt="Benva Healthcare" 
                style={{ height: '48px', width: 'auto', objectFit: 'contain' }}
              />
              <div style={{
                fontSize: '8.5px',
                fontWeight: 700,
                color: '#0284c7',
                letterSpacing: '2.5px',
                marginTop: '6px'
              }}>
                HEALTHCARE AT YOUR DOORSTEP
              </div>
            </div>

            {/* Registered Company Info */}
            <div style={{
              textAlign: 'right',
              fontSize: '10.5px',
              color: '#334155',
              lineHeight: '1.45'
            }}>
              <div style={{ fontWeight: 800, fontSize: '13px', color: '#0f172a', letterSpacing: '0.3px', marginBottom: '2px' }}>
                BENVA HEALTHCARE PRIVATE LIMITED
              </div>
              <div>3-126, Indrapalem, Kakinada,</div>
              <div>Kakinada District, Andhra Pradesh – 533006</div>
              <div>
                Phone: <span style={{ fontWeight: 600, color: '#0f172a' }}>+91 91111 45556</span> | Email: <span style={{ fontWeight: 600, color: '#0f172a' }}>benvahealthcaresupport@gmail.com</span>
              </div>
              <div>
                Web: <span style={{ color: '#0284c7', fontWeight: 600 }}>www.benvahealthcare.in</span>
              </div>
              <div>
                GSTIN: <span style={{ fontWeight: 600, color: '#0f172a' }}>12XXXXX3456X1ZX</span> | CIN: <span style={{ fontWeight: 600, color: '#0f172a' }}>U85100AP2024PTC123456</span>
              </div>
            </div>
          </div>

          {/* Invoice Centered Title */}
          <div style={{ textAlign: 'center', margin: '14px 0 16px 0' }}>
            <div style={{
              fontSize: '20px',
              fontWeight: 800,
              color: '#0f2942',
              letterSpacing: '6px'
            }}>
              I N V O I C E
            </div>
            <div style={{
              fontSize: '9.5px',
              fontWeight: 600,
              color: '#64748b',
              letterSpacing: '1.5px',
              marginTop: '4px'
            }}>
              HEALTHCARE FACILITATION & WELLNESS PACKAGE INVOICE
            </div>
          </div>

          {/* Section 1: PATIENT & BOOKING INFORMATION */}
          <div style={{ marginBottom: '14px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#f0f9ff',
              border: '1px solid #bae6fd',
              borderLeft: '4px solid #0284c7',
              padding: '5px 12px',
              borderRadius: '3px 3px 0 0',
              fontSize: '11px',
              fontWeight: 700,
              color: '#0369a1',
              letterSpacing: '0.5px'
            }}>
              <span>👤</span> PATIENT & BOOKING INFORMATION
            </div>
            <div style={{
              border: '1px solid #e2e8f0',
              borderTop: 'none',
              borderRadius: '0 0 4px 4px',
              padding: '10px 14px',
              display: 'grid',
              gridTemplateColumns: '1.15fr 1fr',
              gap: '16px',
              fontSize: '11px',
              backgroundColor: '#ffffff'
            }}>
              {/* Left Column */}
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr>
                    <td style={{ color: '#64748b', padding: '2px 0', width: '100px' }}>MRN No.</td>
                    <td style={{ fontWeight: 600, color: '#0f172a' }}>
                      {customerUhid !== 'N/A' ? customerUhid : (invoice.patient?.uhid || 'MRN/2026/RPIW')}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ color: '#64748b', padding: '2px 0' }}>Invoice No.</td>
                    <td style={{ fontWeight: 700, color: '#0284c7' }}>{invoice.invoiceNo}</td>
                  </tr>
                  <tr>
                    <td style={{ color: '#64748b', padding: '2px 0' }}>Invoice Date</td>
                    <td style={{ fontWeight: 600, color: '#0f172a' }}>{formattedDateTime}</td>
                  </tr>
                  <tr>
                    <td style={{ color: '#64748b', padding: '2px 0' }}>Patient Name</td>
                    <td style={{ fontWeight: 700, color: '#0f172a' }}>{customerName}</td>
                  </tr>
                  <tr>
                    <td style={{ color: '#64748b', padding: '2px 0' }}>Mobile Number</td>
                    <td style={{ fontWeight: 600, color: '#0f172a' }}>{customerPhone || '+91 76718 66605'}</td>
                  </tr>
                  <tr>
                    <td style={{ color: '#64748b', padding: '2px 0', verticalAlign: 'top' }}>Address</td>
                    <td style={{ color: '#334155', lineHeight: '1.35' }}>{customerAddress}</td>
                  </tr>
                </tbody>
              </table>

              {/* Right Column */}
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr>
                    <td style={{ color: '#64748b', padding: '2px 0', width: '110px' }}>Age / Gender</td>
                    <td style={{ fontWeight: 600, color: '#0f172a' }}>
                      {invoice.patientAge ? `${invoice.patientAge} Years` : '31 Years'} / {invoice.patientGender || 'Female'}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ color: '#64748b', padding: '2px 0' }}>Payment Mode</td>
                    <td style={{ fontWeight: 600, color: '#0f172a' }}>
                      {invoice.paymentMode || 'UPI'}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ color: '#64748b', padding: '2px 0' }}>Consultant</td>
                    <td style={{ fontWeight: 600, color: '#0f172a' }}>
                      {invoice.doctorName || 'Dr. Manasa'}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ color: '#64748b', padding: '2px 0' }}>Booking Source</td>
                    <td style={{ fontWeight: 600, color: '#0f172a' }}>Benva Mobile App</td>
                  </tr>
                  <tr>
                    <td style={{ color: '#64748b', padding: '2px 0' }}>Package ID</td>
                    <td style={{ fontWeight: 600, color: '#0f172a' }}>
                      {items[0]?.hsn || 'BPK-FBHC-2026'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: HEALTHCARE FACILITATION PACKAGE DETAILS */}
          <div style={{ marginBottom: '14px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#f0f9ff',
              border: '1px solid #bae6fd',
              borderLeft: '4px solid #0284c7',
              padding: '5px 12px',
              borderRadius: '3px 3px 0 0',
              fontSize: '11px',
              fontWeight: 700,
              color: '#0369a1',
              letterSpacing: '0.5px'
            }}>
              <span>✚</span> HEALTHCARE FACILITATION PACKAGE DETAILS
            </div>
            
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              border: '1px solid #e2e8f0',
              borderTop: 'none',
              fontSize: '11px'
            }}>
              <thead>
                <tr style={{ backgroundColor: '#0284c7', color: '#ffffff', fontSize: '10px', fontWeight: 700 }}>
                  <th style={{ padding: '7px 8px', textAlign: 'center', width: '45px' }}>S.NO</th>
                  <th style={{ padding: '7px 10px', textAlign: 'left' }}>PACKAGE DESCRIPTION</th>
                  <th style={{ padding: '7px 8px', textAlign: 'center', width: '45px' }}>QTY</th>
                  <th style={{ padding: '7px 10px', textAlign: 'right', width: '85px' }}>MRP</th>
                  <th style={{ padding: '7px 10px', textAlign: 'right', width: '130px' }}>DISCOUNT</th>
                  <th style={{ padding: '7px 10px', textAlign: 'right', width: '95px' }}>FINAL AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '10px 8px', textAlign: 'center', color: '#64748b' }}>1</td>
                    <td style={{ padding: '10px 10px' }}>
                      <div style={{ fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', fontSize: '11.5px' }}>
                        BENVA PREMIUM FULL BODY HEALTH CHECKUP PACKAGE
                      </div>
                      <div style={{ marginTop: '5px', fontSize: '9.5px', color: '#475569', lineHeight: '1.5' }}>
                        <div><span style={{ color: '#0284c7' }}>●</span> Diagnostic Testing Through Partner Laboratory</div>
                        <div><span style={{ color: '#0284c7' }}>●</span> Doctor Consultation</div>
                        <div><span style={{ color: '#0284c7' }}>●</span> Dietitian Consultation</div>
                        <div><span style={{ color: '#0284c7' }}>●</span> Home Sample Collection Facilitation</div>
                        <div><span style={{ color: '#0284c7' }}>●</span> Digital Report Access</div>
                        <div><span style={{ color: '#0284c7' }}>●</span> Customer Support Services</div>
                      </div>
                    </td>
                    <td style={{ padding: '10px 8px', textAlign: 'center', fontWeight: 600 }}>1</td>
                    <td style={{ padding: '10px 10px', textAlign: 'right', color: '#64748b' }}>₹{grandTotal.toFixed(2)}</td>
                    <td style={{ padding: '10px 10px', textAlign: 'right' }}>₹0.00</td>
                    <td style={{ padding: '10px 10px', textAlign: 'right', fontWeight: 800 }}>₹{grandTotal.toFixed(2)}</td>
                  </tr>
                ) : (
                  items.map((it, idx) => {
                    const qty = Number(it.qty) || 1;
                    const unitPrice = Number(it.price) || 0;
                    const discount = Number(it.discount) || 0;
                    const total = Number(it.total) || (unitPrice * qty - discount);
                    const mrp = unitPrice * qty > 0 ? unitPrice * qty : total + discount;

                    return (
                      <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0', verticalAlign: 'top' }}>
                        <td style={{ padding: '10px 8px', textAlign: 'center', color: '#64748b', fontWeight: 600 }}>{idx + 1}</td>
                        <td style={{ padding: '10px 10px' }}>
                          <div style={{ fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', fontSize: '11.5px', letterSpacing: '0.3px' }}>
                            {it.itemName || 'BENVA PREMIUM FULL BODY HEALTH CHECKUP PACKAGE'}
                          </div>
                          <div style={{ marginTop: '5px', fontSize: '9.5px', color: '#475569', lineHeight: '1.5' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <span style={{ color: '#0284c7', fontSize: '8px' }}>●</span> Diagnostic Testing Through Partner Laboratory
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <span style={{ color: '#0284c7', fontSize: '8px' }}>●</span> Doctor Consultation
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <span style={{ color: '#0284c7', fontSize: '8px' }}>●</span> Dietitian Consultation
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <span style={{ color: '#0284c7', fontSize: '8px' }}>●</span> Home Sample Collection Facilitation
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <span style={{ color: '#0284c7', fontSize: '8px' }}>●</span> Digital Report Access
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <span style={{ color: '#0284c7', fontSize: '8px' }}>●</span> Customer Support Services
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '10px 8px', textAlign: 'center', fontWeight: 600, color: '#0f172a' }}>{qty}</td>
                        <td style={{ padding: '10px 10px', textAlign: 'right', color: '#64748b' }}>
                          <span style={{ textDecoration: discount > 0 ? 'line-through' : 'none' }}>
                            ₹{mrp.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </td>
                        <td style={{ padding: '10px 10px', textAlign: 'right' }}>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>
                            ₹{discount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                          {discount > 0 && (
                            <div style={{ fontSize: '9px', color: '#059669', fontWeight: 600, marginTop: '2px' }}>
                              Healthcare Package Discount
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '10px 10px', textAlign: 'right', fontWeight: 800, color: '#0f172a', fontSize: '12px' }}>
                          ₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            {/* Totals Breakdown Right aligned */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
              <table style={{ width: '280px', borderCollapse: 'collapse', fontSize: '11px', border: '1px solid #e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '4px 10px', color: '#64748b' }}>Total Amount (MRP)</td>
                    <td style={{ padding: '4px 10px', textAlign: 'right', fontWeight: 600, color: '#0f172a' }}>
                      ₹{totalMrp.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '4px 10px', color: '#64748b' }}>Discount</td>
                    <td style={{ padding: '4px 10px', textAlign: 'right', fontWeight: 600, color: totalDiscount > 0 ? '#059669' : '#0f172a' }}>
                      {totalDiscount > 0 ? `- ₹${totalDiscount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '₹0.00'}
                    </td>
                  </tr>
                  {serviceCharge > 0 && (
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '4px 10px', color: '#64748b' }}>Service Charge</td>
                      <td style={{ padding: '4px 10px', textAlign: 'right', fontWeight: 600, color: '#0f172a' }}>
                        ₹{serviceCharge.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  )}
                  {invoice.cgst > 0 && (
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '4px 10px', color: '#64748b' }}>CGST</td>
                      <td style={{ padding: '4px 10px', textAlign: 'right', fontWeight: 600, color: '#0f172a' }}>
                        ₹{Number(invoice.cgst).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  )}
                  {invoice.sgst > 0 && (
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '4px 10px', color: '#64748b' }}>SGST</td>
                      <td style={{ padding: '4px 10px', textAlign: 'right', fontWeight: 600, color: '#0f172a' }}>
                        ₹{Number(invoice.sgst).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  )}
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '4px 10px', fontWeight: 700, color: '#0f172a' }}>Net Payable</td>
                    <td style={{ padding: '4px 10px', textAlign: 'right', fontWeight: 800, color: '#0f172a' }}>
                      ₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                  <tr style={{ backgroundColor: '#0284c7', color: '#ffffff' }}>
                    <td style={{ padding: '6px 10px', fontWeight: 800, letterSpacing: '0.5px' }}>PAID AMOUNT</td>
                    <td style={{ padding: '6px 10px', textAlign: 'right', fontWeight: 800, fontSize: '13px' }}>
                      ₹{paid.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '4px 10px', color: '#64748b' }}>Due Amount</td>
                    <td style={{ padding: '4px 10px', textAlign: 'right', fontWeight: 700, color: balance > 0 ? '#dc2626' : '#16a34a' }}>
                      ₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: TESTING PERFORMED BY PARTNER LABORATORY */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#f0f9ff',
              border: '1px solid #bae6fd',
              borderLeft: '4px solid #0284c7',
              padding: '5px 12px',
              borderRadius: '3px 3px 0 0',
              fontSize: '11px',
              fontWeight: 700,
              color: '#0369a1',
              letterSpacing: '0.5px'
            }}>
              <span>⚕</span> TESTING PERFORMED BY PARTNER LABORATORY
            </div>
            <div style={{
              border: '1px solid #e2e8f0',
              borderTop: 'none',
              borderRadius: '0 0 4px 4px',
              padding: '8px 14px',
              display: 'grid',
              gridTemplateColumns: '1.4fr 1.2fr 1fr',
              gap: '12px',
              fontSize: '11px',
              backgroundColor: '#ffffff'
            }}>
              <div>
                <div style={{ fontSize: '9px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>LABORATORY NAME</div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>Apex Diagnostics & Labs</div>
              </div>
              <div>
                <div style={{ fontSize: '9px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>LOCATION</div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#0f172a', marginTop: '2px' }}>Hyderabad, Telangana</div>
              </div>
              <div>
                <div style={{ fontSize: '9px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>NABL NUMBER</div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#0f172a', marginTop: '2px' }}>NABL/MC-XXXX</div>
              </div>
            </div>
          </div>

          {/* Section 4: IMPORTANT DISCLAIMER */}
          <div style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '4px',
            padding: '8px 12px',
            marginBottom: '14px'
          }}>
            <div style={{ fontSize: '9.5px', fontWeight: 700, color: '#334155', letterSpacing: '0.5px', marginBottom: '4px' }}>
              IMPORTANT DISCLAIMER
            </div>
            <p style={{ margin: '0 0 3px 0', fontSize: '8.5px', color: '#64748b', lineHeight: '1.45' }}>
              Benva Healthcare acts solely as a technology-enabled healthcare facilitation platform. Laboratory investigations are performed by independent partner laboratories. Benva Healthcare does not perform, analyze, validate, certify, or interpret laboratory investigations.
            </p>
            <p style={{ margin: '0 0 3px 0', fontSize: '8.5px', color: '#64748b', lineHeight: '1.45' }}>
              Laboratory reports are generated and authorized by the respective partner laboratory. Clinical decisions should be taken only under the guidance of a qualified Registered Medical Practitioner.
            </p>
            <p style={{ margin: 0, fontSize: '8.5px', color: '#64748b', lineHeight: '1.45' }}>
              This invoice represents a healthcare facilitation and wellness package purchased through Benva Healthcare. Diagnostic testing services included in the package are performed by independent partner laboratories.
            </p>
          </div>

          {/* Footer Section */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 1fr 1.2fr',
            gap: '12px',
            alignItems: 'flex-start',
            fontSize: '9.5px',
            color: '#64748b',
            lineHeight: '1.4'
          }}>
            <div>
              <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '2px' }}>Customer Support</div>
              <div>+91 91111 45556</div>
              <div>benvahealthcaresupport@gmail.com</div>
              <div>www.benvahealthcare.in</div>
            </div>
            <div style={{ textAlign: 'center', fontStyle: 'italic', paddingTop: '4px' }}>
              This is a computer-generated invoice<br />and does not require a signature.
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 600, color: '#0f172a' }}>Generated By: Admin User</div>
              <div>Date & Time: {formattedDateTime}</div>
            </div>
          </div>

          {/* Cyan/Teal Bottom Gradient Bar */}
          <div style={{
            height: '4px',
            background: 'linear-gradient(90deg, #0284c7 0%, #06b6d4 100%)',
            marginTop: '10px',
            borderRadius: '2px'
          }} />
        </div>
      ) : (
        /* =========================================================================
           PHARMACY & MEDICINES OFFICIAL BILL TEMPLATE
           ========================================================================= */
        <div 
          className="benva-invoice-sheet" 
          id="benva-invoice-printable" 
          style={{
            width: '100%',
            maxWidth: '820px',
            margin: '0 auto',
            backgroundColor: '#ffffff',
            color: '#111827',
            fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif',
            fontSize: '13px',
            lineHeight: '1.4',
            border: '1.5px solid #222222',
            boxSizing: 'border-box',
            position: 'relative'
          }}
        >
          {/* Invoice Title */}
          <div style={{
            textAlign: 'center',
            padding: '10px 0 6px 0',
            fontWeight: '700',
            fontSize: '18px',
            color: '#111827',
            letterSpacing: '0.3px',
            borderBottom: '1.5px solid #222222'
          }}>
            {isGst ? 'Tax Invoice' : 'Invoice'}
          </div>

          {/* Brand Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            padding: '12px 18px',
            borderBottom: '1.5px solid #222222',
            gap: '16px'
          }}>
            <div style={{ flexShrink: 0 }}>
              <img 
                src="/images/Benva%20NEW.png" 
                alt="Benva Healthcare" 
                style={{ height: '48px', width: 'auto', objectFit: 'contain' }}
              />
            </div>
            <div>
              <div style={{ fontWeight: '800', fontSize: '18px', color: '#0284c7' }}>Benva Healthcare</div>
              <div style={{ color: '#4b5563', fontSize: '12px', marginTop: '2px' }}>Kakinada, Andhra Pradesh</div>
              <div style={{ color: '#4b5563', fontSize: '12px' }}>Phone: <span style={{ fontWeight: '600', color: '#111827' }}>9010681168</span></div>
              {isGst && <div style={{ color: '#4b5563', fontSize: '12px' }}>GSTIN: <span style={{ fontWeight: '600', color: '#111827' }}>37ABCDE1234F1Z5</span></div>}
            </div>
          </div>

          {/* Two Column Section: Bill To & Invoice Details */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 1fr',
            borderBottom: '1.5px solid #222222'
          }}>
            {/* Bill To */}
            <div style={{
              padding: '10px 16px',
              borderRight: '1.5px solid #222222'
            }}>
              <div style={{ fontWeight: '700', fontSize: '13px', color: '#111827', marginBottom: '4px' }}>Bill To:</div>
              <div style={{ fontWeight: '700', fontSize: '14px', color: '#0284c7' }}>{customerName}</div>
              <div style={{ fontSize: '12px', color: '#374151', marginTop: '2px' }}>
                <strong>UHID:</strong> <span style={{ color: '#0284c7', fontWeight: '700' }}>{customerUhid}</span>
              </div>
              {customerPhone && (
                <div style={{ fontSize: '12px', color: '#374151' }}>
                  <strong>Phone:</strong> {customerPhone}
                </div>
              )}
              {customerAddress && (
                <div style={{ fontSize: '12px', color: '#374151' }}>
                  <strong>Address:</strong> {customerAddress}
                </div>
              )}
            </div>

            {/* Invoice Details */}
            <div style={{ padding: '10px 16px' }}>
              <div style={{ fontWeight: '700', fontSize: '13px', color: '#111827', marginBottom: '4px' }}>Invoice Details:</div>
              <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr>
                    <td style={{ color: '#4b5563', padding: '2px 0', width: '120px' }}>No:</td>
                    <td style={{ fontWeight: '700', color: '#111827' }}>{invoice.invoiceNo}</td>
                  </tr>
                  <tr>
                    <td style={{ color: '#4b5563', padding: '2px 0' }}>Date:</td>
                    <td style={{ fontWeight: '600', color: '#111827' }}>{formattedDate}</td>
                  </tr>
                  <tr>
                    <td style={{ color: '#4b5563', padding: '2px 0' }}>Place of Supply:</td>
                    <td style={{ fontWeight: '600', color: '#111827' }}>{invoice.placeOfSupply || '37-Andhra Pradesh'}</td>
                  </tr>
                  {invoice.module && (
                    <tr>
                      <td style={{ color: '#4b5563', padding: '2px 0' }}>Module:</td>
                      <td style={{ fontWeight: '700', color: '#0284c7' }}>
                        {invoice.module === 'LAB_TESTS' ? 'Lab Tests & Checkups' : 
                         invoice.module === 'MEDICINES' ? 'Medicines' : 
                         invoice.module === 'DOCTOR' ? 'Doctor Consultation' : 'Dietitian Plan'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Main Items Table */}
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '12px'
          }}>
            <thead>
              <tr style={{
                backgroundColor: '#f9fafb',
                borderBottom: '1.5px solid #222222',
                textAlign: 'left'
              }}>
                <th style={{ padding: '8px 10px', borderRight: '1px solid #d1d5db', width: '32px', textAlign: 'center' }}>#</th>
                <th style={{ padding: '8px 10px', borderRight: '1px solid #d1d5db' }}>Item Name</th>
                <th style={{ padding: '8px 10px', borderRight: '1px solid #d1d5db', width: '75px', textAlign: 'center' }}>HSN/ SAC</th>
                <th style={{ padding: '8px 10px', borderRight: '1px solid #d1d5db', width: '60px', textAlign: 'center' }}>Quantity</th>
                <th style={{ padding: '8px 10px', borderRight: '1px solid #d1d5db', width: '50px', textAlign: 'center' }}>Unit</th>
                <th style={{ padding: '8px 10px', borderRight: '1px solid #d1d5db', width: '90px', textAlign: 'right' }}>Price/ Unit (₹)</th>
                <th style={{ padding: '8px 10px', borderRight: '1px solid #d1d5db', width: '100px', textAlign: 'right' }}>Discount (₹)</th>
                {isGst && (
                  <th style={{ padding: '8px 10px', borderRight: '1px solid #d1d5db', width: '95px', textAlign: 'right' }}>GST(₹)</th>
                )}
                <th style={{ padding: '8px 10px', width: '100px', textAlign: 'right' }}>Amount(₹)</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => {
                const itemGstAmt = (Number(item.cgst) || 0) + (Number(item.sgst) || 0);
                const discPercent = item.price && item.qty ? ((item.discount / (item.price * item.qty)) * 100).toFixed(1) : '0';
                const gstRate = item.taxRate !== undefined ? item.taxRate : (itemGstAmt > 0 ? 5 : 0);

                return (
                  <tr key={idx} style={{
                    borderBottom: '1px solid #e5e7eb',
                    height: '36px'
                  }}>
                    <td style={{ padding: '8px 10px', borderRight: '1px solid #d1d5db', textAlign: 'center', color: '#4b5563' }}>{idx + 1}</td>
                    <td style={{ padding: '8px 10px', borderRight: '1px solid #d1d5db', fontWeight: '600' }}>
                      {item.itemName}
                      {item.batch && <span style={{ display: 'block', fontSize: '10px', color: '#6b7280', fontWeight: 'normal' }}>Batch: {item.batch} {item.exp ? `| Exp: ${item.exp}` : ''}</span>}
                    </td>
                    <td style={{ padding: '8px 10px', borderRight: '1px solid #d1d5db', textAlign: 'center', color: '#4b5563' }}>{item.hsn || '-'}</td>
                    <td style={{ padding: '8px 10px', borderRight: '1px solid #d1d5db', textAlign: 'center', fontWeight: '600' }}>{item.qty}</td>
                    <td style={{ padding: '8px 10px', borderRight: '1px solid #d1d5db', textAlign: 'center', color: '#4b5563' }}>{item.unit || 'Tbs'}</td>
                    <td style={{ padding: '8px 10px', borderRight: '1px solid #d1d5db', textAlign: 'right' }}>₹ {Number(item.price).toFixed(2)}</td>
                    <td style={{ padding: '8px 10px', borderRight: '1px solid #d1d5db', textAlign: 'right', color: item.discount > 0 ? '#16a34a' : '#4b5563' }}>
                      ₹ {Number(item.discount).toFixed(2)} {Number(item.discount) > 0 ? `(${discPercent}%)` : ''}
                    </td>
                    {isGst && (
                      <td style={{ padding: '8px 10px', borderRight: '1px solid #d1d5db', textAlign: 'right' }}>
                        ₹ {itemGstAmt.toFixed(2)} {gstRate > 0 ? `(${gstRate.toFixed(1)}%)` : ''}
                      </td>
                    )}
                    <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '700' }}>
                      ₹ {Number(item.total).toFixed(2)}
                    </td>
                  </tr>
                );
              })}

              {/* Spacer rows */}
              {items.length < 4 && Array.from({ length: 4 - items.length }).map((_, i) => (
                <tr key={`filler-${i}`} style={{ height: '32px', borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ borderRight: '1px solid #d1d5db' }}>&nbsp;</td>
                  <td style={{ borderRight: '1px solid #d1d5db' }}>&nbsp;</td>
                  <td style={{ borderRight: '1px solid #d1d5db' }}>&nbsp;</td>
                  <td style={{ borderRight: '1px solid #d1d5db' }}>&nbsp;</td>
                  <td style={{ borderRight: '1px solid #d1d5db' }}>&nbsp;</td>
                  <td style={{ borderRight: '1px solid #d1d5db' }}>&nbsp;</td>
                  <td style={{ borderRight: '1px solid #d1d5db' }}>&nbsp;</td>
                  {isGst && <td style={{ borderRight: '1px solid #d1d5db' }}>&nbsp;</td>}
                  <td>&nbsp;</td>
                </tr>
              ))}

              {/* Table Total Row */}
              <tr style={{
                borderTop: '1.5px solid #222222',
                borderBottom: '1.5px solid #222222',
                fontWeight: '700',
                backgroundColor: '#f9fafb'
              }}>
                <td colSpan={3} style={{ padding: '8px 10px', borderRight: '1px solid #d1d5db', textAlign: 'center' }}>Total</td>
                <td style={{ padding: '8px 10px', borderRight: '1px solid #d1d5db', textAlign: 'center' }}>{totalQty}</td>
                <td style={{ borderRight: '1px solid #d1d5db' }}></td>
                <td style={{ borderRight: '1px solid #d1d5db' }}></td>
                <td style={{ padding: '8px 10px', borderRight: '1px solid #d1d5db', textAlign: 'right' }}>₹ {totalDiscount.toFixed(2)}</td>
                {isGst && (
                  <td style={{ padding: '8px 10px', borderRight: '1px solid #d1d5db', textAlign: 'right' }}>₹ {totalGst.toFixed(2)}</td>
                )}
                <td style={{ padding: '8px 10px', textAlign: 'right' }}>₹ {grandTotal.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          {/* Lower Section: Tax Summary (Left) & Totals / In Words (Right) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isGst ? '1.4fr 1.1fr' : '1fr 1.1fr',
            borderBottom: '1.5px solid #222222'
          }}>
            {/* Left Side: Tax Summary or Terms */}
            <div style={{
              padding: '10px 14px',
              borderRight: '1.5px solid #222222'
            }}>
              {isGst ? (
                <div>
                  <div style={{ fontWeight: '700', fontSize: '12px', marginBottom: '6px' }}>Tax Summary:</div>
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '11px',
                    border: '1px solid #222222'
                  }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '1.5px solid #222222', fontWeight: '700' }}>
                        <th style={{ padding: '6px 4px', borderRight: '1px solid #222222', textAlign: 'center', width: '55px' }}>HSN/SAC</th>
                        <th style={{ padding: '6px 6px', borderRight: '1px solid #222222', textAlign: 'right' }}>Taxable Amt</th>
                        <th style={{ padding: '6px 2px', borderRight: '1px solid #222222', textAlign: 'center', width: '42px' }}>CGST %</th>
                        <th style={{ padding: '6px 4px', borderRight: '1px solid #222222', textAlign: 'right', width: '50px' }}>CGST (₹)</th>
                        <th style={{ padding: '6px 2px', borderRight: '1px solid #222222', textAlign: 'center', width: '42px' }}>SGST %</th>
                        <th style={{ padding: '6px 4px', borderRight: '1px solid #222222', textAlign: 'right', width: '50px' }}>SGST (₹)</th>
                        <th style={{ padding: '6px 6px', textAlign: 'right', width: '60px' }}>Total Tax</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '6px 4px', borderRight: '1px solid #222222', textAlign: 'center' }}>3004</td>
                        <td style={{ padding: '6px 6px', borderRight: '1px solid #222222', textAlign: 'right' }}>₹{taxableTotal.toFixed(2)}</td>
                        <td style={{ padding: '6px 2px', borderRight: '1px solid #222222', textAlign: 'center' }}>{(totalCgst > 0 ? (totalCgst / taxableTotal) * 100 : 2.5).toFixed(1)}%</td>
                        <td style={{ padding: '6px 4px', borderRight: '1px solid #222222', textAlign: 'right' }}>₹{totalCgst.toFixed(2)}</td>
                        <td style={{ padding: '6px 2px', borderRight: '1px solid #222222', textAlign: 'center' }}>{(totalSgst > 0 ? (totalSgst / taxableTotal) * 100 : 2.5).toFixed(1)}%</td>
                        <td style={{ padding: '6px 4px', borderRight: '1px solid #222222', textAlign: 'right' }}>₹{totalSgst.toFixed(2)}</td>
                        <td style={{ padding: '6px 6px', textAlign: 'right', fontWeight: '700' }}>₹{totalGst.toFixed(2)}</td>
                      </tr>
                      <tr style={{ fontWeight: '700', backgroundColor: '#f9fafb', borderTop: '1.5px solid #222222' }}>
                        <td style={{ padding: '6px 4px', borderRight: '1px solid #222222', textAlign: 'center' }}>TOTAL</td>
                        <td style={{ padding: '6px 6px', borderRight: '1px solid #222222', textAlign: 'right' }}>₹{taxableTotal.toFixed(2)}</td>
                        <td style={{ borderRight: '1px solid #222222' }}></td>
                        <td style={{ padding: '6px 4px', borderRight: '1px solid #222222', textAlign: 'right' }}>₹{totalCgst.toFixed(2)}</td>
                        <td style={{ borderRight: '1px solid #222222' }}></td>
                        <td style={{ padding: '6px 4px', borderRight: '1px solid #222222', textAlign: 'right' }}>₹{totalSgst.toFixed(2)}</td>
                        <td style={{ padding: '6px 6px', textAlign: 'right', fontWeight: '800' }}>₹{totalGst.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <div>
                  <div style={{ fontWeight: '700', fontSize: '12px', marginBottom: '4px', color: '#111827' }}>Terms & Conditions:</div>
                  <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '11px', color: '#4b5563', lineHeight: '1.6' }}>
                    <li>All healthcare consults and medicine supplies are authentic and verified.</li>
                    <li>Prescription medicines cannot be returned once delivered.</li>
                    <li>For any invoice disputes, please contact Benva Healthcare support.</li>
                  </ul>
                </div>
              )}
            </div>

            {/* Right Side: Totals, In Words, Received & Balance */}
            <div style={{ padding: '10px 16px' }}>
              <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr>
                    <td style={{ padding: '3px 0', color: '#4b5563' }}>Sub Total</td>
                    <td style={{ padding: '3px 0', textAlign: 'right', fontWeight: '600' }}>: ₹ {grandTotal.toFixed(2)}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #d1d5db' }}>
                    <td style={{ padding: '4px 0', fontWeight: '700', color: '#111827' }}>Total</td>
                    <td style={{ padding: '4px 0', textAlign: 'right', fontWeight: '800', fontSize: '14px', color: '#0284c7' }}>: ₹ {grandTotal.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td colSpan={2} style={{ paddingTop: '8px', paddingBottom: '4px', fontSize: '11px' }}>
                      <div style={{ color: '#4b5563' }}>Invoice Amount In Words :</div>
                      <div style={{ fontWeight: '700', color: '#111827', marginTop: '2px' }}>{numberToWords(grandTotal)}</div>
                    </td>
                  </tr>
                  <tr style={{ borderTop: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '3px 0', color: '#4b5563' }}>Received</td>
                    <td style={{ padding: '3px 0', textAlign: 'right', fontWeight: '600' }}>: ₹ {paid.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '3px 0', color: '#4b5563' }}>Balance</td>
                    <td style={{ padding: '3px 0', textAlign: 'right', fontWeight: '700', color: balance > 0 ? '#dc2626' : '#16a34a' }}>: ₹ {balance.toFixed(2)}</td>
                  </tr>
                  {totalDiscount > 0 && (
                    <tr style={{ borderTop: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '3px 0', fontWeight: '700', color: '#16a34a' }}>You Saved</td>
                      <td style={{ padding: '3px 0', textAlign: 'right', fontWeight: '700', color: '#16a34a' }}>: ₹ {totalDiscount.toFixed(2)}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Signature & Signatory Box */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            padding: '16px 24px 20px 24px'
          }}>
            <div style={{
              border: '1.5px solid #222222',
              padding: '12px 24px',
              minWidth: '220px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#111827', marginBottom: '28px', textAlign: 'left' }}>
                For Benva Healthcare:
              </div>
              <div style={{
                fontFamily: 'cursive, "Brush Script MT", sans-serif',
                fontSize: '18px',
                color: '#1e3a8a',
                marginBottom: '4px'
              }}>
                Sudheer S.
              </div>
              <div style={{
                borderTop: '1px solid #9ca3af',
                paddingTop: '4px',
                fontSize: '11px',
                color: '#4b5563',
                fontWeight: '600'
              }}>
                Authorized Signatory
              </div>
            </div>
          </div>

          {/* Subtle branding footer */}
          <div style={{
            textAlign: 'right',
            padding: '6px 18px',
            backgroundColor: '#f9fafb',
            borderTop: '1px solid #e5e7eb',
            fontSize: '10px',
            color: '#9ca3af'
          }}>
            Generated on Benva Healthcare Billing System • {isGst ? 'GST Compliant' : 'Standard Non-GST'}
          </div>
        </div>
      )}
    </>
  );
}
