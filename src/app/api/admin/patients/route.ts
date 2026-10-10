import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { put } from '@vercel/blob';
import { generateNextUhid } from '@/lib/uhid';

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
    
    const name = (formData.get('name') as string)?.trim();
    const phone = (formData.get('phone') as string)?.trim();
    const age = formData.get('age') as string;
    const gender = formData.get('gender') as string;
    const address = formData.get('address') as string;
    const consultant = formData.get('consultant') as string;
    
    let patient = await prisma.patientRecord.findFirst({
      where: { 
        phone,
        name: { equals: name, mode: 'insensitive' }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (patient) {
      if (patient.uhid) {
        return NextResponse.json({ error: `User already exists with UHID number: ${patient.uhid}` }, { status: 400 });
      } else {
        const nextUhid = await generateNextUhid();
        patient = await prisma.patientRecord.update({
          where: { id: patient.id },
          data: { uhid: nextUhid, age: age || patient.age, gender: gender || patient.gender, address: address || patient.address, consultant: consultant || patient.consultant }
        });
      }
    } else {
      const nextUhid = await generateNextUhid();
      patient = await prisma.patientRecord.create({
        data: { name, phone, age, gender, address, consultant, uhid: nextUhid }
      });
    }

    // Handle files
    const dbRecords: any[] = [];

    for (const [key, value] of formData.entries()) {
      if (key === 'files' && value instanceof File && value.size > 0) {
        const file = value as File;
        
        // Upload the file to Vercel Blob if token is available
        let fileUrl = '';
        if (process.env.BLOB_READ_WRITE_TOKEN) {
          try {
            const blob = await put(`patients/${patient.id}/${file.name}`, file, {
              access: 'public',
              addRandomSuffix: true,
            });
            fileUrl = blob.url;
          } catch (e) {
            console.warn("Failed to upload to Vercel Blob:", e);
            fileUrl = `/mock-uploads/${file.name}`;
          }
        } else {
          console.warn("BLOB_READ_WRITE_TOKEN is not set. Using mock URL.");
          fileUrl = `/mock-uploads/${file.name}`;
        }
        
        dbRecords.push({
          patientId: patient.id,
          fileName: file.name,
          fileUrl: fileUrl,
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
    const errorMessage = error instanceof Error ? error.message : 'Failed to create patient';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const data = await req.json();
    const { id, name, phone, address, medicalHistory } = data;
    
    if (!id) {
      return NextResponse.json({ error: 'Patient ID is required' }, { status: 400 });
    }

    const updatedPatient = await prisma.patientRecord.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(phone !== undefined && { phone }),
        ...(address !== undefined && { address }),
        ...(medicalHistory !== undefined && { medicalHistory })
      }
    });

    return NextResponse.json(updatedPatient);
  } catch (error) {
    console.error('Error updating patient:', error);
    return NextResponse.json({ error: 'Failed to update patient' }, { status: 500 });
  }
}
