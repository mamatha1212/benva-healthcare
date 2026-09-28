import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('doctor_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'benva-super-secret-key-2026');
    await jwtVerify(token, secret);

    const { id } = await params;
    const body = await req.json();
    const { fileName, fileType, fileContent, status } = body;

    // Convert text content to a base64 Data URL so it acts like a file
    const fileUrl = `data:text/plain;base64,${Buffer.from(fileContent).toString('base64')}`;

    const newFile = await prisma.patientFile.create({
      data: {
        patientId: id,
        fileName,
        fileType,
        fileUrl,
        status: status || 'DRAFT'
      }
    });

    return NextResponse.json(newFile);
  } catch (error) {
    console.error('Error creating patient file:', error);
    return NextResponse.json({ error: 'Failed to create patient file' }, { status: 500 });
  }
}
