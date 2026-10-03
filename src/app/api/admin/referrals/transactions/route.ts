import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { referrerId, serviceName, amount, referralDate, patientName, patientPhone } = body;
    
    if (!referrerId || !serviceName || amount === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newTransaction = await prisma.referralTransaction.create({
      data: { 
        referrerId, 
        serviceName, 
        amount: Number(amount), 
        referralDate: referralDate ? new Date(referralDate) : new Date(),
        patientName: patientName || null,
        patientPhone: patientPhone || null
      }
    });
    return NextResponse.json(newTransaction, { status: 201 });
  } catch (error) {
    console.error('Error adding referral transaction:', error);
    return NextResponse.json({ error: 'Failed to add transaction' }, { status: 500 });
  }
}
