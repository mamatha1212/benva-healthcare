import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      fullName, mobile, whatsapp, email, state, district,
      area, pincode, membershipType
    } = body;

    // 1. Save Lead to Database
    const lead = await prisma.lead.create({
      data: {
        enquiryType: "MEMBERSHIP",
        fullName,
        mobile,
        whatsapp,
        email: email || null,
        state,
        district,
        area,
        pincode,
        membershipType,
        age: "", // Dummy value to bypass old Prisma schema validation
        gender: "", // Dummy value
        package: "", // Dummy value
        price: "", // Dummy value
        status: "New Lead"
      }
    });

    // 2. (Optional/Disabled) Setup Nodemailer
    // Generating a test account on every request takes 2-3 seconds, causing slow submissions.
    // Uncomment and configure with real SMTP credentials in production.
    /*
    const testAccount = await nodemailer.createTestAccount();
    const transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, 
      auth: {
        user: testAccount.user, 
        pass: testAccount.pass, 
      },
    });

    const adminMailOptions = {
      from: '"BENVA System" <no-reply@benva.com>',
      to: "admin@benva.com", 
      subject: "New Membership Enquiry Received",
      text: `...`
    };

    const adminInfo = await transporter.sendMail(adminMailOptions);
    console.log("Admin Email sent: %s", nodemailer.getTestMessageUrl(adminInfo));
    */

    return NextResponse.json({ success: true, leadId: lead.id }, { status: 200 });

  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ error: error.message || 'Failed to process request' }, { status: 500 });
  }
}
