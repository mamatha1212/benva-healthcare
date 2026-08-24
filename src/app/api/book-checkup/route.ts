import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      fullName, mobile, whatsapp, email, state, district,
      area, pincode, age, gender
    } = body;

    // 1. Save Lead to Database
    const lead = await prisma.lead.create({
      data: {
        fullName,
        mobile,
        whatsapp,
        email: email || null,
        state,
        district,
        area,
        pincode,
        age,
        gender,
        package: 'BENVA Premium Full Body Health Checkup',
        price: '₹1,999'
      }
    });

    // 2. Setup Nodemailer (Using Ethereal for testing/mocking)
    // Ethereal is a fake SMTP service. We generate a test account.
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

    // 3. Send Email to Admin
    const adminMailOptions = {
      from: '"BENVA System" <no-reply@benva.com>',
      to: "admin@benva.com", // Simulated Admin Email
      subject: "New Health Checkup Enquiry Received",
      text: `
New Health Checkup Enquiry

Name: ${fullName}
Mobile: ${mobile}
WhatsApp: ${whatsapp}
Email: ${email || 'N/A'}
State: ${state}
District: ${district}
Area: ${area}
Pincode: ${pincode}
Age: ${age}
Gender: ${gender}
Package: BENVA Premium Full Body Health Checkup
Price: ₹1,999
      `,
    };

    const adminInfo = await transporter.sendMail(adminMailOptions);
    console.log("Admin Email sent: %s", nodemailer.getTestMessageUrl(adminInfo));

    // 4. Send Email to Customer (if email provided)
    if (email) {
      const customerMailOptions = {
        from: '"BENVA Healthcare" <no-reply@benva.com>',
        to: email,
        subject: "Booking Confirmation - BENVA Healthcare",
        text: `
Dear ${fullName},

Thank you for submitting your details for the BENVA Premium Full Body Health Checkup.
Our Healthcare Team will contact you shortly to confirm your booking and schedule your home sample collection.

Best Regards,
BENVA Healthcare Team
        `,
      };
      const customerInfo = await transporter.sendMail(customerMailOptions);
      console.log("Customer Email sent: %s", nodemailer.getTestMessageUrl(customerInfo));
    }

    // Returning success
    return NextResponse.json({ success: true, leadId: lead.id }, { status: 200 });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
