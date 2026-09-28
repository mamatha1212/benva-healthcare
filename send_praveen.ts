import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_EMAIL || 'benvahealthcaresupport@gmail.com',
    pass: process.env.SMTP_PASSWORD || 'oidmiedluhwjyboe',
  },
});

async function main() {
  const email = 'praveenmeka95@gmail.com';
  
  // Find application
  const app = await prisma.doctorApplication.findFirst({
    where: { email }
  });

  if (!app) {
    console.log('Application not found');
    return;
  }

  // Create doctor if not exists
  const existingDoctor = await prisma.doctor.findFirst({
    where: { 
      OR: [
        { email: app.email },
        { phone: app.mobile }
      ]
    }
  });

  if (!existingDoctor) {
    await prisma.doctor.create({
      data: {
        name: app.fullName,
        type: 'CONSULTANT',
        phone: app.mobile,
        email: app.email,
      }
    });
    console.log('Created doctor record');
  } else {
    console.log('Doctor record already exists');
  }

  // Send email
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <div style="text-align: center; padding: 20px 0; background: #f8fafc; border-bottom: 2px solid #3b82f6;">
        <h2 style="color: #0f172a; margin: 0;">Application Accepted!</h2>
      </div>
      <div style="padding: 30px 20px;">
        <p style="font-size: 16px;">Dear Dr. <strong>${app.fullName}</strong>,</p>
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

  try {
    const info = await transporter.sendMail({
      from: `"BENVA Healthcare" <${process.env.SMTP_EMAIL || 'benvahealthcaresupport@gmail.com'}>`,
      to: email,
      subject: 'Welcome to BENVA Healthcare! Your Application is Accepted',
      html: emailHtml,
    });
    console.log('Email sent successfully:', info.messageId);
  } catch (error) {
    console.error('Failed to send email:', error);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
