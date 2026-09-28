import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

import { jwtVerify } from 'jose';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'benva-super-secret-key-2026');
      await jwtVerify(token, secret);
    } catch (e) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { id, status } = await request.json();

    if (!id || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const updatedApplication = await prisma.doctorApplication.update({
      where: { id },
      data: { status },
    });

    if (status === 'ACCEPTED') {
      // Check if a doctor with this email or phone already exists to avoid duplicates
      const existingDoctor = await prisma.doctor.findFirst({
        where: { 
          OR: [
            { email: updatedApplication.email },
            { phone: updatedApplication.mobile }
          ]
        }
      });

      if (!existingDoctor) {
        await prisma.doctor.create({
          data: {
            name: updatedApplication.fullName,
            type: 'CONSULTANT', // default to consultant
            phone: updatedApplication.mobile,
            email: updatedApplication.email,
          }
        });
      }

      // Send Welcome Email to the Doctor
      const { sendUserEmail } = await import('@/lib/mailer');
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <div style="text-align: center; padding: 20px 0; background: #f8fafc; border-bottom: 2px solid #3b82f6;">
            <h2 style="color: #0f172a; margin: 0;">Application Accepted!</h2>
          </div>
          <div style="padding: 30px 20px;">
            <p style="font-size: 16px;">Dear Dr. <strong>${updatedApplication.fullName}</strong>,</p>
            <p style="font-size: 16px; line-height: 1.5;">Congratulations! Your application to join BENVA Healthcare has been formally accepted by our administration team.</p>
            <p style="font-size: 16px; line-height: 1.5;">You can now log into your dedicated Doctor Dashboard to manage your profile, schedule, and patient records.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${baseUrl}/doctor/login" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">Login to Dashboard</a>
            </div>

            <p style="font-size: 14px; color: #64748b;">If this is your first time logging in, please click on the "Forgot Password" link on the login page to set up your password securely.</p>
            
            <p style="font-size: 16px; margin-top: 30px;">Welcome aboard!<br/><strong>The BENVA Healthcare Team</strong></p>
          </div>
        </div>
      `;

      await sendUserEmail(updatedApplication.email, 'Welcome to BENVA Healthcare! Your Application is Accepted', emailHtml);
    }

    return NextResponse.json({ success: true, updatedApplication });
  } catch (error: any) {
    console.error('Update doctor application status error:', error);
    return NextResponse.json(
      { error: 'Failed to update status', details: error.message || String(error) },
      { status: 500 }
    );
  }
}
