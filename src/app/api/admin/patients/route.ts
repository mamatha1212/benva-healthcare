import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { put } from '@vercel/blob';

export async function GET() {
  try {
    const patients = await prisma.patientRecord.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        files: true,
        invoices: true,
      }
    });
    return NextResponse.json(patients);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch patients' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    
    const name = formData.get('name') as string;
    const phone = formData.get('phone') as string;
    const age = formData.get('age') as string;
    const gender = formData.get('gender') as string;
    const address = formData.get('address') as string;
    const consultant = formData.get('consultant') as string;
    
    // Create patient
    const patient = await prisma.patientRecord.create({
      data: { name, phone, age, gender, address, consultant }
    });

    // Handle files
    const dbRecords: any[] = [];

    for (const [key, value] of formData.entries()) {
      if (key === 'files' && value instanceof File && value.size > 0) {
        const file = value as File;
        
        // Upload the file to Vercel Blob
        const blob = await put(`patients/${patient.id}/${file.name}`, file, {
          access: 'public',
        });
        
        dbRecords.push({
          patientId: patient.id,
          fileName: file.name,
          fileUrl: blob.url,
          fileType: 'DOCUMENT',
        });
      }
    }

    // Bulk insert all file records in one DB roundtrip
    if (dbRecords.length > 0) {
      await prisma.patientFile.createMany({
        data: dbRecords
      });
    }

    // Fetch the updated patient with files
    const updatedPatient = await prisma.patientRecord.findUnique({
      where: { id: patient.id },
      include: { files: true, invoices: true }
    });

    return NextResponse.json(updatedPatient);
  } catch (error) {
    console.error('Error creating patient:', error);
    return NextResponse.json({ error: 'Failed to create patient' }, { status: 500 });
  }
}
