import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateNextUhid } from '@/lib/uhid';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const patientId = url.searchParams.get('patientId');
    const moduleFilter = url.searchParams.get('module');
    const billTypeFilter = url.searchParams.get('billType');
    const paymentStatusFilter = url.searchParams.get('paymentStatus');
    const invoiceStatusFilter = url.searchParams.get('invoiceStatus');
    const search = url.searchParams.get('search');
    const fromDate = url.searchParams.get('fromDate');
    const toDate = url.searchParams.get('toDate');

    const invoices = await prisma.invoice.findMany({
      where: patientId ? { patientId } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
        patient: true,
      }
    });

    // Parse payMode JSON and item mfr JSON
    let parsed = invoices.map(inv => {
      let meta: any = {};
      try {
        if (inv.payMode && inv.payMode.startsWith('{')) {
          meta = JSON.parse(inv.payMode);
        } else {
          meta = { mode: inv.payMode || 'Cash', module: 'MEDICINES', billType: 'GST', invoiceStatus: 'GENERATED', paymentStatus: inv.dueAmount > 0 ? (inv.paidAmount > 0 ? 'PARTIALLY_PAID' : 'PENDING') : 'PAID', benvaRevenue: 0 };
        }
      } catch (e) {
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

    // Apply in-memory filters for flexibility across modules & dates
    if (moduleFilter && moduleFilter !== 'ALL') {
      parsed = parsed.filter(i => i.module === moduleFilter);
    }
    if (billTypeFilter && billTypeFilter !== 'ALL') {
      parsed = parsed.filter(i => i.billType === billTypeFilter);
    }
    if (paymentStatusFilter && paymentStatusFilter !== 'ALL') {
      parsed = parsed.filter(i => i.paymentStatus === paymentStatusFilter);
    }
    if (invoiceStatusFilter && invoiceStatusFilter !== 'ALL') {
      parsed = parsed.filter(i => i.invoiceStatus === invoiceStatusFilter);
    }
    if (fromDate) {
      const from = new Date(fromDate).getTime();
      parsed = parsed.filter(i => new Date(i.billDate || i.createdAt).getTime() >= from);
    }
    if (toDate) {
      const to = new Date(toDate).getTime() + 86400000;
      parsed = parsed.filter(i => new Date(i.billDate || i.createdAt).getTime() <= to);
    }
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      parsed = parsed.filter(i => 
        (i.invoiceNo && i.invoiceNo.toLowerCase().includes(q)) ||
        (i.patient?.name && i.patient.name.toLowerCase().includes(q)) ||
        (i.patient?.phone && i.patient.phone.toLowerCase().includes(q)) ||
        (i.patient?.uhid && i.patient.uhid.toLowerCase().includes(q))
      );
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      patientId, 
      patientName, 
      patientPhone, 
      patientEmail,
      address, 
      age, 
      gender, 
      consultant, 
      mrnNo, 
      payMode, 
      totalAmount, 
      discount, 
      cgst, 
      sgst, 
      paidAmount, 
      dueAmount, 
      items,
      module = 'MEDICINES',
      billType = 'GST',
      invoiceStatus = 'GENERATED',
      paymentStatus = 'PAID',
      benvaRevenue = 0,
      placeOfSupply = '37-Andhra Pradesh',
      doctorName = '',
      consultationType = '',
      dietitianName = '',
      planDuration = '',
      startDate = '',
      endDate = '',
      notes = '',
    } = body;
    
    // Ensure patient exists or create a placeholder for it
    let actualPatientId = patientId;
    if (patientId) {
      const existingPatient = await prisma.patientRecord.findUnique({ where: { id: patientId } });
      if (!existingPatient) {
        const nextUhid = await generateNextUhid();
        try {
          await prisma.patientRecord.create({
            data: {
              id: patientId,
              name: patientName || 'Unknown',
              phone: patientPhone || 'Unknown',
              address, age, gender, consultant,
              uhid: nextUhid
            }
          });
        } catch (e) {
          const newP = await prisma.patientRecord.create({
            data: {
              name: patientName || 'Unknown',
              phone: patientPhone || 'Unknown',
              address, age, gender, consultant,
              uhid: nextUhid
            }
          });
          actualPatientId = newP.id;
        }
      } else {
        const updateData: any = {
            address: address || existingPatient.address,
            age: age || existingPatient.age,
            gender: gender || existingPatient.gender,
            consultant: consultant || existingPatient.consultant
        };
        if (!existingPatient.uhid) {
           updateData.uhid = await generateNextUhid();
        }
        await prisma.patientRecord.update({
          where: { id: patientId },
          data: updateData
        });
      }
    } else {
      let existingPatient = null;
      if (patientName && patientPhone) {
        existingPatient = await prisma.patientRecord.findFirst({
          where: { 
            phone: patientPhone.trim() 
          },
          orderBy: { createdAt: 'desc' }
        });
      }

      if (existingPatient) {
        actualPatientId = existingPatient.id;
        if (!existingPatient.uhid) {
           const nextUhid = await generateNextUhid();
           await prisma.patientRecord.update({
             where: { id: existingPatient.id },
             data: { uhid: nextUhid }
           });
        }
      } else {
        const nextUhid = await generateNextUhid();
        const newP = await prisma.patientRecord.create({
          data: {
            name: patientName ? patientName.trim() : 'Customer',
            phone: patientPhone ? patientPhone.trim() : '0000000000',
            address, age, gender, consultant,
            uhid: nextUhid
          }
        });
        actualPatientId = newP.id;
      }
    }

    // Module prefix for invoice numbering
    const prefixMap: Record<string, string> = {
      'MEDICINES': 'INV-MED',
      'LAB_TESTS': 'INV-LAB',
      'DOCTOR': 'INV-DOC',
      'DIETITIAN': 'INV-DIET',
    };
    const prefix = prefixMap[module] || 'INV';
    const count = await prisma.invoice.count();
    const invoiceNo = `${prefix}-${(count + 1).toString().padStart(6, '0')}`;

    // Meta storage inside payMode string
    const metaPayload = {
      mode: payMode || 'Cash',
      module,
      billType,
      invoiceStatus,
      paymentStatus: Number(dueAmount) <= 0 ? 'PAID' : (Number(paidAmount) > 0 ? 'PARTIALLY_PAID' : 'PENDING'),
      benvaRevenue: Number(benvaRevenue) || 0,
      placeOfSupply: placeOfSupply || '37-Andhra Pradesh',
      doctorName,
      consultationType,
      dietitianName,
      planDuration,
      startDate,
      endDate,
      notes,
      patientEmail: patientEmail || '',
      history: [
        {
          action: 'Invoice Created',
          date: new Date().toISOString(),
          status: invoiceStatus,
          paymentStatus: Number(dueAmount) <= 0 ? 'PAID' : (Number(paidAmount) > 0 ? 'PARTIALLY_PAID' : 'PENDING'),
        }
      ]
    };
    
    const invoice = await prisma.invoice.create({
      data: {
        patientId: actualPatientId,
        invoiceNo,
        mrnNo: mrnNo || `MRN/${new Date().getFullYear()}/${actualPatientId.slice(-4).toUpperCase()}`,
        payMode: JSON.stringify(metaPayload),
        totalAmount: Number(totalAmount) || 0,
        discount: Number(discount) || 0,
        cgst: billType === 'NON_GST' ? 0 : (Number(cgst) || 0),
        sgst: billType === 'NON_GST' ? 0 : (Number(sgst) || 0),
        paidAmount: Number(paidAmount) || 0,
        dueAmount: Number(dueAmount) || 0,
        items: {
          create: (items || []).map((item: any) => {
            const itemMeta = {
              unit: item.unit || 'Tbs',
              taxRate: billType === 'NON_GST' ? 0 : (Number(item.taxRate) || 0),
              benvaCost: Number(item.benvaCost) || 0,
              mfr: item.mfr || '',
            };
            return {
              itemName: item.itemName || 'Item',
              mfr: JSON.stringify(itemMeta),
              qty: Number(item.qty) || 1,
              batch: item.batch || '',
              exp: item.exp || '',
              hsn: item.hsn || '',
              price: Number(item.price) || 0,
              discount: Number(item.discount) || 0,
              amount: Number(item.amount) || 0,
              cgst: billType === 'NON_GST' ? 0 : (Number(item.cgst) || 0),
              sgst: billType === 'NON_GST' ? 0 : (Number(item.sgst) || 0),
              total: Number(item.total) || 0,
            };
          })
        }
      },
      include: {
        items: true,
        patient: true,
      }
    });

    return NextResponse.json(invoice);
  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, action, paymentStatus, paidAmount, dueAmount, cancellationReason } = body;

    if (!id) {
      return NextResponse.json({ error: 'Invoice ID is required' }, { status: 400 });
    }

    const existing = await prisma.invoice.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    let meta: any = {};
    try {
      if (existing.payMode && existing.payMode.startsWith('{')) {
        meta = JSON.parse(existing.payMode);
      } else {
        meta = { mode: existing.payMode || 'Cash', module: 'MEDICINES', billType: 'GST', invoiceStatus: 'GENERATED', paymentStatus: 'PAID' };
      }
    } catch {
      meta = { mode: existing.payMode || 'Cash', module: 'MEDICINES', billType: 'GST', invoiceStatus: 'GENERATED', paymentStatus: 'PAID' };
    }

    if (!meta.history) meta.history = [];

    const updateData: any = {};

    if (action === 'CANCEL') {
      meta.invoiceStatus = 'CANCELLED';
      meta.cancellationReason = cancellationReason || 'Cancelled by administrator';
      meta.cancelledAt = new Date().toISOString();
      meta.history.push({
        action: 'Invoice Cancelled',
        reason: cancellationReason || 'Cancelled by admin',
        date: new Date().toISOString()
      });
      updateData.payMode = JSON.stringify(meta);
    } else if (action === 'RECORD_PAYMENT') {
      const newPaid = Number(paidAmount);
      const newDue = Number(dueAmount);
      meta.paymentStatus = newDue <= 0 ? 'PAID' : (newPaid > 0 ? 'PARTIALLY_PAID' : 'PENDING');
      meta.history.push({
        action: `Payment Updated: Received ₹${newPaid}, Due ₹${newDue}`,
        date: new Date().toISOString()
      });
      updateData.paidAmount = newPaid;
      updateData.dueAmount = newDue;
      updateData.payMode = JSON.stringify(meta);
    }

    const updated = await prisma.invoice.update({
      where: { id },
      data: updateData,
      include: {
        items: true,
        patient: true,
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating invoice:', error);
    return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Invoice ID is required' }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.invoiceItem.deleteMany({ where: { invoiceId: id } }),
      prisma.invoice.delete({ where: { id } }),
    ]);

    return NextResponse.json({ success: true, message: 'Invoice deleted successfully' });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    return NextResponse.json({ error: 'Failed to delete invoice' }, { status: 500 });
  }
}

