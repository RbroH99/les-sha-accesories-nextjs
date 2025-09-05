import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587", 10),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  logger: false,
  debug: false,
});

export const sendEmail = async ({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html?: string;
}) => {
  try {
    console.log(`[Email Service] Preparando para enviar correo a: ${to}`);

    if (!html) {
      throw new Error("Falta el contenido del correo");
    }

    const options = {
      from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(options);

    return { success: true, info };
  } catch (error) {
    console.error("[Email Service] Error al intentar enviar el correo:", error);
    return { success: false, error };
  }
};
