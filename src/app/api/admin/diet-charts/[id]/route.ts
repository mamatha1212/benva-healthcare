import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'benva-super-secret-key-2026');
    await jwtVerify(token, secret);

    const { id } = await params;
    const body = await req.json();

    const updateData: any = {};
    if (body.status !== undefined) updateData.status = body.status;
    if (body.fileUrl !== undefined) updateData.fileUrl = body.fileUrl;

    const updated = await prisma.patientFile.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating diet chart:', error);
    return NextResponse.json({ error: 'Failed to update diet chart' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'benva-super-secret-key-2026');
    await jwtVerify(token, secret);

    const { id } = await params;

    await prisma.patientFile.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting diet chart:', error);
    return NextResponse.json({ error: 'Failed to delete diet chart' }, { status: 500 });
  }
}

