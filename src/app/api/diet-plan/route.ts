import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendAdminEmail, sendUserEmail } from '@/lib/mailer';

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

    const adminHtml = `
      <h2>New Diet Plan Enquiry</h2>
      <p><strong>Name:</strong> ${fullName}</p>
      <p><strong>Mobile:</strong> ${mobile}</p>
      <p><strong>WhatsApp:</strong> ${whatsapp}</p>
      <p><strong>Email:</strong> ${email || 'N/A'}</p>
      <p><strong>State:</strong> ${state}</p>
      <p><strong>District:</strong> ${district}</p>
      <p><strong>Area:</strong> ${area}</p>
      <p><strong>Pincode:</strong> ${pincode}</p>
      <p><strong>Service Type:</strong> ${serviceType}</p>
    `;

    await sendAdminEmail("New Diet Plan Enquiry Received", adminHtml);

    if (email) {
      const userHtml = `
        <p>Dear ${fullName},</p>
        <p>Thank you for reaching us, our team will get in touch with you shortly.</p>
        <br/>
        <p>Best Regards,<br/>BENVA Healthcare Team</p>
      `;
      await sendUserEmail(email, "Enquiry Received - BENVA Healthcare", userHtml);
    }

    return NextResponse.json({ success: true, leadId: lead.id }, { status: 200 });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
