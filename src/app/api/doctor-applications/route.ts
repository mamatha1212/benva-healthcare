import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { put } from '@vercel/blob';

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';

    let data: Record<string, any> = {};
    let uploadedDocs: { name: string; url: string }[] = [];

    if (contentType.includes('multipart/form-data')) {
      // Handle multipart/form-data — files uploaded server-side (no CORS)
      const formData = await request.formData();

      // Extract all text fields
      for (const [key, value] of formData.entries()) {
        if (typeof value === 'string') {
          data[key] = value;
        }
      }

      // Upload each file to Vercel Blob from the server (no CORS restriction)
      const fileFieldMap: Record<string, string> = {
        doc_passport_photo: 'passportPhotoUrl',
        doc_gov_id: 'govIdUrl',
        doc_mbbs: 'mbbsUrl',
        doc_pg: 'pgUrl',
        doc_med_reg: 'medRegUrl',
        doc_pan: 'panUrl',
        doc_bank: 'bankDetailsUrl',
      };

      for (const [fieldKey, docName] of Object.entries(fileFieldMap)) {
        const file = formData.get(fieldKey);
        if (file && file instanceof Blob && file.size > 0) {
          try {
            const fileName = (file as File).name || fieldKey;
            const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
            const lastDot = fileName.lastIndexOf('.');
            const ext = lastDot !== -1 ? fileName.substring(lastDot) : '.pdf';
            const blobPath = `doctors/${fieldKey}-${uniqueSuffix}${ext}`;

            const blob = await put(blobPath, file, {
              access: 'public',
              addRandomSuffix: false,
            });
            uploadedDocs.push({ name: docName, url: blob.url });
          } catch (uploadErr) {
            console.warn(`Server-side upload skipped for ${fieldKey}:`, uploadErr);
            // Skip this file — don't block form submission
          }
        }
      }
    } else {
      // Handle plain JSON (fallback)
      data = await request.json();
      uploadedDocs = data.documents || [];
    }

    const application = await prisma.doctorApplication.create({
      data: {
        fullName: (data.fullName as string) || '',
        title: (data.title as string) || '',
        gender: (data.gender as string) || '',
        dob: (data.dob as string) || '',
        mobile: (data.mobile as string) || '',
        email: (data.email as string) || '',
        address: (data.address as string) || '',
        city: (data.city as string) || '',
        state: (data.state as string) || '',
        medicalQualification: (data.medicalQualification as string) || '',
        medicalCollege: (data.medicalCollege as string) || '',
        yearOfGraduation: (data.yearOfGraduation as string) || '',
        yearOfPostGraduation: (data.yearOfPostGraduation as string) || null,
        medicalCouncilReg: (data.medicalCouncilReg as string) || '',
        registeringAuthority: (data.registeringAuthority as string) || '',
        registrationStatus: (data.registrationStatus as string) || '',
        primarySpecialization: (data.primarySpecialization as string) || '',
        secondarySpecialization: (data.secondarySpecialization as string) || null,
        clinicalFocus: (data.clinicalFocus as string) || null,
        experience: (data.experience as string) || '',
        languages: (data.languages as string) || '',
        telemedicine: data.telemedicine === 'on' || data.telemedicine === true,
        accountName: (data.accountName as string) || '',
        bankName: (data.bankName as string) || '',
        accountNumber: (data.accountNumber as string) || '',
        ifscCode: (data.ifscCode as string) || '',
        panNumber: (data.panNumber as string) || '',
        branchName: (data.branchName as string) || '',
        signatureName: (data.signatureName as string) || '',
        signatureDate: (data.signatureDate as string) || '',
        documents: uploadedDocs,
        status: 'PENDING',
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
