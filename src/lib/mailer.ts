import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_EMAIL || 'mamatha14031995@gmail.com',
    pass: process.env.SMTP_PASSWORD || 'tsbm voxo woaf tthz',
  },
});

export const sendAdminEmail = async (subject: string, html: string) => {
  try {
    const info = await transporter.sendMail({
      from: `"BENVA Healthcare" <${process.env.SMTP_EMAIL || 'mamatha14031995@gmail.com'}>`,
      to: 'mamatha14031995@gmail.com', // Send to admin
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
    const info = await transporter.sendMail({
      from: `"BENVA Healthcare" <${process.env.SMTP_EMAIL || 'mamatha14031995@gmail.com'}>`,
      to: toEmail,
      subject: subject,
      html: html,
    });
    console.log("User Confirmation Email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("Failed to send user email:", error);
  }
};
