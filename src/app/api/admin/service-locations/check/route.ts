import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pincode = searchParams.get('pincode');

    if (!pincode) {
      return NextResponse.json({ error: 'Pincode is required' }, { status: 400 });
    }

    const locations = await prisma.serviceLocation.findMany({
      where: { pincode },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ locations });
  } catch (error) {
    console.error('Error fetching service locations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
