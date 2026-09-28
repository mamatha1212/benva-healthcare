import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
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
