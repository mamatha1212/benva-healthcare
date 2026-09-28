import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
    }

    await prisma.doctorApplication.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting doctor application:', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const { id } = params;
    const data = await request.json();
    
    if (!id) {
      return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
    }

    // Don't allow updating id or createdAt through this endpoint
    const { id: _id, createdAt: _createdAt, ...updateData } = data;

    const updated = await prisma.doctorApplication.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating doctor application:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
