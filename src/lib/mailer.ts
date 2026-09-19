import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_EMAIL || 'benvahealthcaresupport@gmail.com',
    pass: process.env.SMTP_PASSWORD || 'oidmiedluhwjyboe',
  },
});

export const sendAdminEmail = async (subject: string, html: string) => {
  try {
    const info = await transporter.sendMail({
      from: `"Benva health care" <${process.env.SMTP_EMAIL || 'Benvahealthcaresupport@gmail.com'}>`,
      to: process.env.ADMIN_EMAIL || 'Benvahealthcaresupport@gmail.com', // Send to admin
      subject: subject,
      html: html,
    });
    console.log("Admin Email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("Failed to send admin email:", error);
  }
};

export const sendUserEmail = async (toEmail: string, subject: string, html: string) => {
  if (!toEmail) return;
  try {
    // Generate a simple text fallback by stripping HTML tags
    const textFallback = html.replace(/<[^>]*>?/gm, '');
    
    const info = await transporter.sendMail({
      from: `"BENVA Healthcare" <${process.env.SMTP_EMAIL || 'benvahealthcaresupport@gmail.com'}>`,
      to: toEmail,
      replyTo: process.env.SMTP_EMAIL || 'benvahealthcaresupport@gmail.com',
      subject: subject,
      text: textFallback,
      html: html,
      headers: {
        'X-Priority': '1 (Highest)',
        'X-Mailer': 'Nodemailer'
      }
    });
    console.log("User Confirmation Email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("Failed to send user email:", error);
  }
};
