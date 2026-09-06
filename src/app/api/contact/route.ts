import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendAdminEmail, sendUserEmail } from '@/lib/mailer';

export async function POST(req: Request) {
  try {
    const data = await req.json();

    if (!data.fullName || !data.mobile || !data.message) {
      return NextResponse.json(
        { error: 'All fields are required.' },
        { status: 400 }
      );
    }

    // Save to Database using 'serviceType' to store the message temporarily to avoid DB migration.
    const lead = await prisma.lead.create({
      data: {
        enquiryType: 'CONTACT_US',
        fullName: data.fullName,
        mobile: data.mobile,
        whatsapp: data.mobile, // required in schema
        state: 'N/A', // required in schema
        district: 'N/A', // required in schema
        area: 'N/A', // required in schema
        pincode: '000000', // required in schema
        serviceType: data.message, // Storing message here temporarily
        status: 'NEW',
      },
    });

    // Send Admin Notification
    await sendAdminEmail(
      `New Contact Request: ${data.fullName}`,
      `
        <h2>New Contact Message</h2>
        <p><strong>Name:</strong> ${data.fullName}</p>
        <p><strong>Mobile:</strong> ${data.mobile}</p>
        <p><strong>Message:</strong></p>
        <blockquote>${data.message}</blockquote>
        <br/>
        <p>Please contact the user to assist them.</p>
      `
    );

    // Send User Notification if email exists (we don't collect email in contact form currently)
    // if (data.email) {
    //   await sendUserEmail(data.email, 'We received your message - BENVA Healthcare', ...);
    // }

    return NextResponse.json({ success: true, leadId: lead.id }, { status: 200 });

  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: error.message || 'Failed to send message.' },
      { status: 500 }
    );
  }
}
