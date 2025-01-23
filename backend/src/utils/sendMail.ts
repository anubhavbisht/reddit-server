import nodemailer from "nodemailer";

export async function sendTestEmail() {
//   const testAccount = await nodemailer.createTestAccount();
//   console.log(testAccount)

  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: process.env.SEND_EMAIL_USER, 
      pass: process.env.SEND_EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: '"Test Sender" <test@example.com>', 
    to: "recipient@example.com",
    subject: "Test Email from Nodemailer", 
    text: "This is a test email sent using Ethereal.", 
    html: "<p>This is a <strong>test email</strong> sent using Ethereal.</p>", 
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.messageId}`);
    console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
  } catch (error) {
    console.error(`Error sending email: ${error.message}`);
  }
}

