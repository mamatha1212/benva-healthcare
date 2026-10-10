import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    await prisma.patientFile.delete({
      where: {
        id: id
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting prescription:', error);
    return NextResponse.json(
      { error: 'Failed to delete prescription' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { fileUrl } = body;

    if (!fileUrl) {
      return NextResponse.json({ error: 'fileUrl is required' }, { status: 400 });
    }

    const updated = await prisma.patientFile.update({
      where: { id: id },
      data: { fileUrl }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating prescription:', error);
    return NextResponse.json(
      { error: 'Failed to update prescription' },
      { status: 500 }
    );
  }
}

