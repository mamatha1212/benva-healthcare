import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendAdminEmail } from '@/lib/mailer';

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

    const adminHtml = `
      <h2>New Callback Request</h2>
      <p><strong>Name:</strong> ${data.fullName || 'Not provided'}</p>
      <p><strong>Mobile:</strong> ${data.mobile}</p>
      <br/>
      <p>Please contact the user to assist them.</p>
    `;

    // Fire and forget email
    sendAdminEmail(`New Callback Request: ${data.mobile}`, adminHtml)
      .catch(e => console.error("Email send error", e));

    return NextResponse.json({ success: true, leadId: lead.id }, { status: 200 });

  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit callback request.' },
      { status: 500 }
    );
  }
}
