import React, { Suspense } from 'react';
import { prisma } from '@/lib/prisma';
import InvoicesClient from './InvoicesClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminInvoicesPage() {
  let initialInvoices: any[] = [];

  try {
    const raw = await prisma.invoice.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
        patient: true,
      }
    });

    initialInvoices = raw.map(inv => {
      let meta: any = {};
      try {
        if (inv.payMode && inv.payMode.startsWith('{')) {
          meta = JSON.parse(inv.payMode);
        } else {
          meta = { mode: inv.payMode || 'Cash', module: 'MEDICINES', billType: 'GST', invoiceStatus: 'GENERATED', paymentStatus: inv.dueAmount > 0 ? (inv.paidAmount > 0 ? 'PARTIALLY_PAID' : 'PENDING') : 'PAID', benvaRevenue: 0 };
        }
      } catch {
        meta = { mode: inv.payMode || 'Cash', module: 'MEDICINES', billType: 'GST', invoiceStatus: 'GENERATED', paymentStatus: 'PAID' };
      }

      const parsedItems = inv.items.map(item => {
        let itemMeta: any = {};
        try {
          if (item.mfr && item.mfr.startsWith('{')) {
            itemMeta = JSON.parse(item.mfr);
          } else {
            itemMeta = { mfr: item.mfr || '', unit: 'Tbs', taxRate: item.cgst + item.sgst > 0 ? 5 : 0 };
          }
        } catch {
          itemMeta = { mfr: item.mfr || '', unit: 'Tbs', taxRate: 0 };
        }
        return {
          ...item,
          unit: itemMeta.unit || 'Tbs',
          taxRate: itemMeta.taxRate !== undefined ? itemMeta.taxRate : (item.cgst + item.sgst > 0 ? 5 : 0),
          benvaCost: itemMeta.benvaCost || 0,
          originalMfr: itemMeta.mfr || '',
        };
      });

      return {
        ...inv,
        createdAt: inv.createdAt ? new Date(inv.createdAt).toISOString() : new Date().toISOString(),
        billDate: inv.billDate ? new Date(inv.billDate).toISOString() : new Date().toISOString(),
        meta,
        module: meta.module || 'MEDICINES',
        billType: meta.billType || (inv.cgst + inv.sgst > 0 ? 'GST' : 'NON_GST'),
        invoiceStatus: meta.invoiceStatus || 'GENERATED',
        paymentStatus: meta.paymentStatus || (inv.dueAmount > 0 ? (inv.paidAmount > 0 ? 'PARTIALLY_PAID' : 'PENDING') : 'PAID'),
        benvaRevenue: meta.benvaRevenue || 0,
        placeOfSupply: meta.placeOfSupply || '37-Andhra Pradesh',
        notes: meta.notes || '',
        doctorName: meta.doctorName || '',
        consultationType: meta.consultationType || '',
        dietitianName: meta.dietitianName || '',
        planDuration: meta.planDuration || '',
        startDate: meta.startDate || '',
        endDate: meta.endDate || '',
        history: meta.history || [],
        parsedItems,
      };
    });
  } catch (err) {
    console.error('Error fetching initial invoices on server:', err);
  }

  return (
    <Suspense fallback={<div style={{ padding: '32px' }}>Loading Invoices Dashboard...</div>}>
      <InvoicesClient initialInvoices={initialInvoices} />
    </Suspense>
  );
}
