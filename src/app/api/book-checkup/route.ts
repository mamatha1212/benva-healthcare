import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendAdminEmail, sendUserEmail } from '@/lib/mailer';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      fullName, mobile, whatsapp, email, state, district,
      area, pincode, age, gender, packageTitle, packagePrice
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
        package: packageTitle || 'BENVA Premium Full Body Health Checkup',
        price: packagePrice ? (packagePrice.includes('₹') ? packagePrice : `₹${packagePrice}`) : '₹1,999'
      }
    });

    // 2. Setup Nodemailer and send email asynchronously (don't await)
    const adminHtml = `
      <h2>New Health Checkup Enquiry</h2>
      <p><strong>Name:</strong> ${fullName}</p>
      <p><strong>Mobile:</strong> ${mobile}</p>
      <p><strong>WhatsApp:</strong> ${whatsapp}</p>
      <p><strong>Email:</strong> ${email || 'N/A'}</p>
      <p><strong>State:</strong> ${state}</p>
      <p><strong>District:</strong> ${district}</p>
      <p><strong>Area:</strong> ${area}</p>
      <p><strong>Pincode:</strong> ${pincode}</p>
      <p><strong>Age:</strong> ${age}</p>
      <p><strong>Gender:</strong> ${gender}</p>
      <p><strong>Package:</strong> ${packageTitle || 'BENVA Premium Full Body Health Checkup'}</p>
      <p><strong>Price:</strong> ${packagePrice ? (packagePrice.includes('₹') ? packagePrice : `₹${packagePrice}`) : '₹1,999'}</p>
    `;

    await sendAdminEmail("New Health Checkup Enquiry Received", adminHtml).catch(e => console.error(e));

    if (email) {
      const customerHtml = `
        <p>Dear ${fullName},</p>
        <p>Thank you for reaching us, our team will get in touch with you shortly.</p>
        <br/>
        <p>Best Regards,<br/>BENVA Healthcare Team</p>
      `;
      await sendUserEmail(email, "Booking Confirmation - BENVA Healthcare", customerHtml).catch(e => console.error(e));
    }

    // Returning success
    return NextResponse.json({ success: true, leadId: lead.id }, { status: 200 });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
