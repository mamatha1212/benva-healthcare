import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const referrers = await prisma.referrer.findMany({ where: { referralCode: null } });
    
    let updated = 0;
    for (let i = 0; i < referrers.length; i++) {
      const newCode = `BENVA-HC-${i + 1 + 100}`; // offset to avoid clashes
      await prisma.referrer.update({
        where: { id: referrers[i].id },
        data: { referralCode: newCode }
      });
      updated++;
    }

    return NextResponse.json({ success: true, updated, message: `Backfilled ${updated} referrers` });
  } catch (error) {
    console.error('Error backfilling referrers:', error);
    return NextResponse.json({ error: 'Failed to backfill' }, { status: 500 });
  }
}
