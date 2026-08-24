import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const data = await req.json();

    if (!data.mobile) {
      return NextResponse.json(
        { error: 'Mobile number is required.' },
        { status: 400 }
      );
    }

    const lead = await prisma.lead.create({
      data: {
        enquiryType: 'CALLBACK_REQUEST',
        fullName: 'Unknown (Callback)',
        mobile: data.mobile,
        whatsapp: data.mobile,
        state: 'N/A',
        district: 'N/A',
        area: 'N/A',
        pincode: '000000',
        status: 'NEW',
      },
    });

    // Send Admin Notification using Nodemailer Ethereal
    const testAccount = await nodemailer.createTestAccount();
    const transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    const adminInfo = await transporter.sendMail({
      from: '"BENVA Healthcare System" <noreply@benvahealthcare.com>',
      to: 'admin@benvahealthcare.com',
      subject: `New Callback Request: ${data.mobile}`,
      html: `
        <h2>New Callback Request</h2>
        <p><strong>Mobile:</strong> ${data.mobile}</p>
        <br/>
        <p>Please contact the user to assist them.</p>
      `,
    });

    console.log("Admin Email sent: %s", nodemailer.getTestMessageUrl(adminInfo));

    return NextResponse.json({ success: true, leadId: lead.id }, { status: 200 });

  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit callback request.' },
      { status: 500 }
    );
  }
}
