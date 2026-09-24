import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

console.log("✅ Resend initialized.");

const resendSendEmail = async (
  to,
  subject,
  html,
  attachments = []
) => {
  try {
    if (!to || !subject || !html) {
      throw new Error("Missing email parameters.");
    }

    const resendAttachments = attachments.map((att, index) => {

      // Already in correct format
      if (att?.content && att?.filename) {
        return att;
      }

      // Raw Buffer
      if (Buffer.isBuffer(att)) {
        return {
          filename: `attachment-${index + 1}.png`,
          content: att
        };
      }

      throw new Error("Invalid attachment format");
    });

    const { data, error } = await resend.emails.send({
      from: `Team Renaissance <${process.env.VERIFIED_FROM_EMAIL}>`,
      to,
      subject,
      html,
      attachments: resendAttachments
    });

    // IMPORTANT:
    // Do not swallow this error.
    if (error) {
      console.error("❌ Resend API Error:", error);

      throw new Error(
        error.message || "Email sending failed"
      );
    }

    console.log(
      `✅ Email sent to ${to}. ID: ${data.id}`
    );

    return data;

  } catch (err) {

    console.error(
      "❌ Mailer Error:",
      err?.message || err
    );

    // VERY IMPORTANT
    // Pass the error back to ticket.service.js
    throw err;
  }
};

export default resendSendEmail;