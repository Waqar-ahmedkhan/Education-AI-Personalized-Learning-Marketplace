// src/utils/emailService.ts
import nodemailer, { Transporter } from "nodemailer";
import dotenv from "dotenv"
import ejs from "ejs";
import path from "path";

dotenv.config();
interface EmailOptions {
  email: string;
  subject: string;
  template: string;
  data: { [key: string]: any };
}


const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    const transporter: Transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      service: process.env.SMTP_SERVICE,
      auth: {
        user: process.env.SMTP_MAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const { email, subject, template, data } = options;

    const templatePath = path.join(
      __dirname, 
      process.env.NODE_ENV === 'production' ? '../../src/mails' : '../mails', 
      `${template}`
    );
    


    // Render template with provided data
    const html: string = await ejs.renderFile(templatePath, data);

    const mailOptions = {
      from: process.env.SMTP_MAIL,
      to: email,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    throw new Error(`Error sending email: ${error}`);
  }
};

export default sendEmail;
