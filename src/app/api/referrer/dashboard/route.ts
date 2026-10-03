import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'benva-super-secret-key-2026');

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('referrer_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let payload;
    try {
      const verified = await jwtVerify(token, SECRET);
      payload = verified.payload;
    } catch (err) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    if (!payload.id) {
      return NextResponse.json({ error: 'Invalid token payload' }, { status: 401 });
    }

    const referrer = await prisma.referrer.findUnique({
      where: { id: payload.id as string },
      include: {
        category: true,
        transactions: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!referrer) {
      return NextResponse.json({ error: 'Referrer not found' }, { status: 404 });
    }

    return NextResponse.json(referrer);
  } catch (error) {
    console.error('Referrer Dashboard API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
