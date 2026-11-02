import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const payout = await prisma.drPayout.findUnique({
      where: { id }
    });
    if (!payout) {
      return NextResponse.json({ error: 'Payout not found' }, { status: 404 });
    }
    return NextResponse.json(payout);
  } catch (error) {
    console.error('Failed to get payout:', error);
    return NextResponse.json({ error: 'Failed to get payout' }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const { id } = params;
    
    // We only try to delete if it looks like a valid CUID, else we ignore (for old localStorage IDs)
    if (id && typeof id === 'string' && id.length > 10) {
      await prisma.drPayout.delete({
        where: { id }
      });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete payout:', error);
    return NextResponse.json({ error: 'Failed to delete payout' }, { status: 500 });
  }
}
