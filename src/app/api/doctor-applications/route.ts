import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const data = Object.fromEntries(formData.entries());

    // Make sure upload directory exists
    const uploadDir = path.join(process.cwd(), 'public/uploads/doctors');
    try {
      await fs.access(uploadDir);
    } catch {
      await fs.mkdir(uploadDir, { recursive: true });
    }

    // Process files
    const uploadPromises = fileKeys.map(async ({ key, name }) => {
      const file = formData.get(key) as File;
      if (file && file.size > 0 && file.name) {
        const ext = path.extname(file.name) || '.pdf';
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const filename = `${key}-${uniqueSuffix}${ext}`;
        const filePath = path.join(uploadDir, filename);

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        await fs.writeFile(filePath, buffer);

        return {
          name: name,
          url: `/uploads/doctors/${filename}`
        };
      }
      return null;
    });

    const uploadedDocs = await Promise.all(uploadPromises);
    const documents = uploadedDocs.filter(doc => doc !== null) as { name: string; url: string }[];
    
    const application = await prisma.doctorApplication.create({
      data: {
        fullName: data.fullName as string,
        title: data.title as string,
        gender: data.gender as string,
        dob: data.dob as string,
        mobile: data.mobile as string,
        email: data.email as string,
        address: data.address as string,
        city: data.city as string,
        state: data.state as string,
        medicalQualification: data.medicalQualification as string,
        medicalCollege: data.medicalCollege as string,
        yearOfGraduation: data.yearOfGraduation as string,
        yearOfPostGraduation: (data.yearOfPostGraduation as string) || null,
        medicalCouncilReg: data.medicalCouncilReg as string,
        registeringAuthority: data.registeringAuthority as string,
        registrationStatus: data.registrationStatus as string,
        primarySpecialization: data.primarySpecialization as string,
        secondarySpecialization: (data.secondarySpecialization as string) || null,
        clinicalFocus: (data.clinicalFocus as string) || null,
        experience: data.experience as string,
        languages: data.languages as string,
        telemedicine: data.telemedicine === 'on',
        accountName: data.accountName as string,
        bankName: data.bankName as string,
        accountNumber: data.accountNumber as string,
        ifscCode: data.ifscCode as string,
        panNumber: data.panNumber as string,
        branchName: data.branchName as string,
        signatureName: data.signatureName as string,
        signatureDate: data.signatureDate as string,
        documents: documents,
        status: "PENDING",
      },
    });

    return NextResponse.json({ success: true, application });
  } catch (error) {
    console.error('Doctor application submission error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit application' },
      { status: 500 }
    );
  }
}
