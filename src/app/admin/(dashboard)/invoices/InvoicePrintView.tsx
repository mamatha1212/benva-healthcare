'use client';

import React from 'react';

export interface InvoiceItemData {
  id?: string;
  itemName: string;
  hsn?: string;
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
  parsedItems?: InvoiceItemData[];
  items?: InvoiceItemData[];
  notes?: string;
  doctorName?: string;
  consultationType?: string;
  dietitianName?: string;
  planDuration?: string;
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

export default function InvoicePrintView({ invoice }: { invoice: InvoiceData }) {
  const items = invoice.parsedItems || invoice.items || [];
  const isGst = invoice.billType !== 'NON_GST';
  
  const customerName = invoice.patient?.name || invoice.patientName || 'Customer';
  const customerPhone = invoice.patient?.phone || invoice.patientPhone || '';
  const customerUhid = invoice.patient?.uhid || invoice.patientUhid || 'N/A';
  const customerAddress = invoice.patient?.address || invoice.patientAddress || 'Kakinada';

  const dateObj = new Date(invoice.billDate || Date.now());
  const formattedDate = `${String(dateObj.getDate()).padStart(2, '0')}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${dateObj.getFullYear()}`;

  // Totals calculations
  const totalQty = items.reduce((acc, it) => acc + (Number(it.qty) || 0), 0);
  const totalDiscount = items.reduce((acc, it) => acc + (Number(it.discount) || 0), 0);
  const totalGst = items.reduce((acc, it) => acc + (Number(it.cgst || 0) + Number(it.sgst || 0)), 0);
  const grandTotal = Number(invoice.totalAmount) || 0;
  const paid = Number(invoice.paidAmount) || 0;
  const balance = Number(invoice.dueAmount) || 0;
  const savedAmount = totalDiscount;

  // Taxable amount across items
  const taxableTotal = items.reduce((acc, it) => acc + (Number(it.amount) || (Number(it.price) * Number(it.qty) - Number(it.discount))), 0);
  const totalCgst = items.reduce((acc, it) => acc + (Number(it.cgst) || 0), 0);
  const totalSgst = items.reduce((acc, it) => acc + (Number(it.sgst) || 0), 0);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * {
            visibility: hidden !important;
          }
          .benva-invoice-sheet, .benva-invoice-sheet * {
            visibility: visible !important;
          }
          .benva-invoice-sheet {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            border: 1.5px solid #000 !important;
            box-shadow: none !important;
            margin: 0 !important;
          }
        }
      `}} />
      <div className="benva-invoice-sheet" style={{
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
    }}>
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

          {/* Spacer rows to maintain professional invoice height */}
          {items.length < 5 && Array.from({ length: 5 - items.length }).map((_, i) => (
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
        {/* Left Side: Tax Summary (if GST) or Terms/Notes (if non-GST) */}
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
                fontSize: '10.5px',
                border: '1px solid #222222'
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '1px solid #222222' }}>
                    <th rowSpan={2} style={{ padding: '4px 6px', borderRight: '1px solid #222222', textAlign: 'center' }}>HSN/ SAC</th>
                    <th rowSpan={2} style={{ padding: '4px 6px', borderRight: '1px solid #222222', textAlign: 'right' }}>Taxable Amt (₹)</th>
                    <th colSpan={2} style={{ padding: '3px 6px', borderRight: '1px solid #222222', textAlign: 'center' }}>CGST</th>
                    <th colSpan={2} style={{ padding: '3px 6px', borderRight: '1px solid #222222', textAlign: 'center' }}>SGST</th>
                    <th rowSpan={2} style={{ padding: '4px 6px', textAlign: 'right' }}>Total Tax(₹)</th>
                  </tr>
                  <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #222222' }}>
                    <th style={{ padding: '2px 4px', borderRight: '1px solid #222222', textAlign: 'center' }}>Rate (%)</th>
                    <th style={{ padding: '2px 4px', borderRight: '1px solid #222222', textAlign: 'right' }}>Amt (₹)</th>
                    <th style={{ padding: '2px 4px', borderRight: '1px solid #222222', textAlign: 'center' }}>Rate (%)</th>
                    <th style={{ padding: '2px 4px', borderRight: '1px solid #222222', textAlign: 'right' }}>Amt (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '4px 6px', borderRight: '1px solid #222222', textAlign: 'center' }}>3004</td>
                    <td style={{ padding: '4px 6px', borderRight: '1px solid #222222', textAlign: 'right' }}>{taxableTotal.toFixed(2)}</td>
                    <td style={{ padding: '4px 6px', borderRight: '1px solid #222222', textAlign: 'center' }}>{(totalCgst > 0 ? (totalCgst / taxableTotal) * 100 : 2.5).toFixed(1)}</td>
                    <td style={{ padding: '4px 6px', borderRight: '1px solid #222222', textAlign: 'right' }}>{totalCgst.toFixed(2)}</td>
                    <td style={{ padding: '4px 6px', borderRight: '1px solid #222222', textAlign: 'center' }}>{(totalSgst > 0 ? (totalSgst / taxableTotal) * 100 : 2.5).toFixed(1)}</td>
                    <td style={{ padding: '4px 6px', borderRight: '1px solid #222222', textAlign: 'right' }}>{totalSgst.toFixed(2)}</td>
                    <td style={{ padding: '4px 6px', textAlign: 'right', fontWeight: '600' }}>{totalGst.toFixed(2)}</td>
                  </tr>
                  <tr style={{ fontWeight: '700', backgroundColor: '#f9fafb', borderTop: '1px solid #222222' }}>
                    <td style={{ padding: '4px 6px', borderRight: '1px solid #222222', textAlign: 'center' }}>TOTAL</td>
                    <td style={{ padding: '4px 6px', borderRight: '1px solid #222222', textAlign: 'right' }}>{taxableTotal.toFixed(2)}</td>
                    <td style={{ borderRight: '1px solid #222222' }}></td>
                    <td style={{ padding: '4px 6px', borderRight: '1px solid #222222', textAlign: 'right' }}>{totalCgst.toFixed(2)}</td>
                    <td style={{ borderRight: '1px solid #222222' }}></td>
                    <td style={{ padding: '4px 6px', borderRight: '1px solid #222222', textAlign: 'right' }}>{totalSgst.toFixed(2)}</td>
                    <td style={{ padding: '4px 6px', textAlign: 'right' }}>{totalGst.toFixed(2)}</td>
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
              {savedAmount > 0 && (
                <tr style={{ borderTop: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '3px 0', fontWeight: '700', color: '#16a34a' }}>You Saved</td>
                  <td style={{ padding: '3px 0', textAlign: 'right', fontWeight: '700', color: '#16a34a' }}>: ₹ {savedAmount.toFixed(2)}</td>
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
    </>
  );
}
