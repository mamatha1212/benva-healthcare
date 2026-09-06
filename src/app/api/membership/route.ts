import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendAdminEmail, sendUserEmail } from '@/lib/mailer';

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

    const adminHtml = `
      <h2>New Membership Enquiry</h2>
      <p><strong>Name:</strong> ${fullName}</p>
      <p><strong>Mobile:</strong> ${mobile}</p>
      <p><strong>WhatsApp:</strong> ${whatsapp}</p>
      <p><strong>Email:</strong> ${email || 'N/A'}</p>
      <p><strong>State:</strong> ${state}</p>
      <p><strong>District:</strong> ${district}</p>
      <p><strong>Area:</strong> ${area}</p>
      <p><strong>Pincode:</strong> ${pincode}</p>
      <p><strong>Membership Type:</strong> ${membershipType}</p>
    `;

    await sendAdminEmail("New Membership Enquiry Received", adminHtml);

    if (email) {
      const userHtml = `
        <p>Dear ${fullName},</p>
        <p>Thank you for reaching us, our team will get in touch with you shortly.</p>
        <br/>
        <p>Best Regards,<br/>BENVA Healthcare Team</p>
      `;
      await sendUserEmail(email, "Membership Enquiry Received - BENVA Healthcare", userHtml);
    }

    return NextResponse.json({ success: true, leadId: lead.id }, { status: 200 });

  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ error: error.message || 'Failed to process request' }, { status: 500 });
  }
}
