import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { put } from '@vercel/blob';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const documents = data.documents || [];
    
    const application = await prisma.doctorApplication.create({
      data: {
        fullName: (data.fullName as string) || "",
        title: (data.title as string) || "",
        gender: (data.gender as string) || "",
        dob: (data.dob as string) || "",
        mobile: (data.mobile as string) || "",
        email: (data.email as string) || "",
        address: (data.address as string) || "",
        city: (data.city as string) || "",
        state: (data.state as string) || "",
        medicalQualification: (data.medicalQualification as string) || "",
        medicalCollege: (data.medicalCollege as string) || "",
        yearOfGraduation: (data.yearOfGraduation as string) || "",
        yearOfPostGraduation: (data.yearOfPostGraduation as string) || null,
        medicalCouncilReg: (data.medicalCouncilReg as string) || "",
        registeringAuthority: (data.registeringAuthority as string) || "",
        registrationStatus: (data.registrationStatus as string) || "",
        primarySpecialization: (data.primarySpecialization as string) || "",
        secondarySpecialization: (data.secondarySpecialization as string) || null,
        clinicalFocus: (data.clinicalFocus as string) || null,
        experience: (data.experience as string) || "",
        languages: (data.languages as string) || "",
        telemedicine: data.telemedicine === 'on' || data.telemedicine === true,
        accountName: (data.accountName as string) || "",
        bankName: (data.bankName as string) || "",
        accountNumber: (data.accountNumber as string) || "",
        ifscCode: (data.ifscCode as string) || "",
        panNumber: (data.panNumber as string) || "",
        branchName: (data.branchName as string) || "",
        signatureName: (data.signatureName as string) || "",
        signatureDate: (data.signatureDate as string) || "",
        documents: documents,
        status: "PENDING",
      },
    });

    return NextResponse.json({ success: true, application });
  } catch (error) {
    console.error('Doctor application submission error:', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: 'Failed to submit application: ' + msg },
      { status: 500 }
    );
  }
}
