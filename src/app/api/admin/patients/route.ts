import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

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
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'patients', patient.id);
    // Create directory if it doesn't exist
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (e) {
      // Ignore if directory exists
    }

    const fileOperations = [];
    const dbRecords: any[] = [];

    for (const [key, value] of formData.entries()) {
      if (key === 'files' && value instanceof File && value.size > 0) {
        fileOperations.push(async () => {
          const file = value as File;
          const bytes = await file.arrayBuffer();
          const buffer = Buffer.from(bytes);
          
          const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
          const filePath = join(uploadDir, fileName);
          await writeFile(filePath, buffer);
          
          dbRecords.push({
            patientId: patient.id,
            fileName: file.name,
            fileUrl: `/uploads/patients/${patient.id}/${fileName}`,
            fileType: 'DOCUMENT',
          });
        });
      }
    }

    // Run all file writes concurrently
    await Promise.all(fileOperations.map(op => op()));

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
