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
        fullName: data.fullName || 'Unknown (Callback)',
        mobile: data.mobile,
        whatsapp: '',
        state: 'N/A',
        district: 'N/A',
        area: 'N/A',
        pincode: '000000',
        status: 'NEW',
      },
    });

    // Send Admin Notification asynchronously (don't await so the client gets a fast response)
    nodemailer.createTestAccount().then(testAccount => {
      const transporter = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });

      transporter.sendMail({
        from: '"BENVA Healthcare System" <noreply@benvahealthcare.com>',
        to: 'admin@benvahealthcare.com',
        subject: `New Callback Request: ${data.mobile}`,
        html: `
          <h2>New Callback Request</h2>
          <p><strong>Name:</strong> ${data.fullName || 'Not provided'}</p>
          <p><strong>Mobile:</strong> ${data.mobile}</p>
          <br/>
          <p>Please contact the user to assist them.</p>
        `,
      }).then(adminInfo => {
        console.log("Admin Email sent: %s", nodemailer.getTestMessageUrl(adminInfo));
      }).catch(e => console.error("Email send error", e));
    }).catch(e => console.error("Test account error", e));

    return NextResponse.json({ success: true, leadId: lead.id }, { status: 200 });

  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit callback request.' },
      { status: 500 }
    );
  }
}
