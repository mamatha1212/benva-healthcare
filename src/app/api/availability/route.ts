import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const data = await req.json();

    if (!data.fullName || !data.mobile || !data.district || !data.area) {
      return NextResponse.json(
        { error: 'All fields are required.' },
        { status: 400 }
      );
    }

    // Save to Database
    const lead = await prisma.lead.create({
      data: {
        enquiryType: 'AVAILABILITY',
        fullName: data.fullName,
        mobile: data.mobile,
        whatsapp: data.mobile, // Use mobile as whatsapp since it's required in schema
        state: 'N/A', // Default value since it's not collected in this form
        district: data.district,
        area: data.area,
        pincode: '000000', // Default value since it's not collected in this form
        status: 'New Lead',
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
      subject: `New Area Availability Enquiry: ${data.fullName}`,
      html: `
        <h2>New Area Availability Enquiry</h2>
        <p><strong>Name:</strong> ${data.fullName}</p>
        <p><strong>Mobile:</strong> ${data.mobile}</p>
        <p><strong>District:</strong> ${data.district}</p>
        <p><strong>Area / Locality:</strong> ${data.area}</p>
        <br/>
        <p>Please contact the user to confirm service availability.</p>
      `,
    });

    console.log("Admin Email sent: %s", nodemailer.getTestMessageUrl(adminInfo));

    return NextResponse.json({ success: true, leadId: lead.id }, { status: 200 });

  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: error.message || 'Failed to process enquiry.' },
      { status: 500 }
    );
  }
}
