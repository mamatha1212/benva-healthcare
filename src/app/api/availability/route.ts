import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const data = await req.json();

    if (!data.fullName || !data.mobile || !data.pincode) {
      return NextResponse.json(
        { error: 'Name, Mobile, and Pincode are required.' },
        { status: 400 }
      );
    }

    // Save to Database
    const lead = await prisma.lead.create({
      data: {
        enquiryType: 'AVAILABILITY',
        fullName: data.fullName,
        mobile: data.mobile,
        whatsapp: data.whatsapp || data.mobile, // Use mobile as whatsapp if not provided
        state: data.requestedState || (data.state !== 'Other' ? data.state : 'Not Listed') || 'N/A',
        district: data.requestedDistrict || (data.district !== 'Other' ? data.district : 'Not Listed') || 'Not Listed',
        area: data.requestedArea || (data.area !== 'Other' ? data.area : 'Not Listed') || 'Not Listed',
        pincode: data.pincode || '000000',
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
        <p><strong>WhatsApp:</strong> ${data.whatsapp || data.mobile}</p>
        <p><strong>State:</strong> ${data.requestedState ? `Requested: ${data.requestedState}` : (data.state || 'N/A')}</p>
        <p><strong>District:</strong> ${data.requestedDistrict ? `Requested: ${data.requestedDistrict}` : (data.district || 'Not Listed')}</p>
        <p><strong>Area / Locality:</strong> ${data.requestedArea ? `Requested: ${data.requestedArea}` : (data.area || 'Not Listed')}</p>
        <p><strong>Pincode:</strong> ${data.pincode}</p>
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
