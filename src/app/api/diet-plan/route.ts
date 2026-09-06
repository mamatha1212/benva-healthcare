import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      fullName, mobile, whatsapp, email, state, district,
      area, pincode, serviceType, age, gender, weight, height
    } = body;

    const finalServiceType = `Diet Plan - PCOD/PCOS (6 Months) | Weight: ${weight || 'N/A'}, Height: ${height || 'N/A'}`;

    const lead = await prisma.lead.create({
      data: {
        enquiryType: "DIET_PLAN",
        fullName,
        mobile,
        whatsapp,
        email: email || null,
        state,
        district,
        area,
        pincode,
        age: age || null,
        gender: gender || null,
        serviceType: finalServiceType,
        status: "New Lead"
      }
    });

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
      subject: "New Diet Plan Enquiry Received",
      text: `
New Diet Plan Enquiry

Name: ${fullName}
Mobile: ${mobile}
WhatsApp: ${whatsapp}
Email: ${email || 'N/A'}
State: ${state}
District: ${district}
Area: ${area}
Pincode: ${pincode}
Service Type: ${serviceType}
      `,
    };

    const adminInfo = await transporter.sendMail(adminMailOptions);
    console.log("Admin Email sent: %s", nodemailer.getTestMessageUrl(adminInfo));

    return NextResponse.json({ success: true, leadId: lead.id }, { status: 200 });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
