import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const patientId = url.searchParams.get('patientId');

    const invoices = await prisma.invoice.findMany({
      where: patientId ? { patientId } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
        patient: true,
      }
    });
    return NextResponse.json(invoices);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { patientId, mrnNo, payMode, totalAmount, discount, cgst, sgst, paidAmount, dueAmount, items } = body;
    
    // Generate Invoice No (simple approach for now)
    const count = await prisma.invoice.count();
    const invoiceNo = `INV/${new Date().getFullYear()}/${(count + 1).toString().padStart(4, '0')}`;
    
    const invoice = await prisma.invoice.create({
      data: {
        patientId,
        invoiceNo,
        mrnNo: mrnNo || `MRN/${new Date().getFullYear()}/${patientId.slice(-4).toUpperCase()}`,
        payMode,
        totalAmount: Number(totalAmount) || 0,
        discount: Number(discount) || 0,
        cgst: Number(cgst) || 0,
        sgst: Number(sgst) || 0,
        paidAmount: Number(paidAmount) || 0,
        dueAmount: Number(dueAmount) || 0,
        items: {
          create: items.map((item: any) => ({
            itemName: item.itemName,
            mfr: item.mfr,
            qty: Number(item.qty) || 1,
            batch: item.batch,
            exp: item.exp,
            hsn: item.hsn,
            price: Number(item.price) || 0,
            discount: Number(item.discount) || 0,
            amount: Number(item.amount) || 0,
            cgst: Number(item.cgst) || 0,
            sgst: Number(item.sgst) || 0,
            total: Number(item.total) || 0,
          }))
        }
      },
      include: {
        items: true,
      }
    });

    return NextResponse.json(invoice);
  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 });
  }
}
