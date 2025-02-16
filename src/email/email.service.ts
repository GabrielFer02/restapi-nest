import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: +process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendEmail(to: string, subject: string, content: string) {
    await this.transporter.sendMail({
      from: `'No Reply' <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      // text: content,
      html: `<p><b>Content: </b><em> ${content}</em></p>`,
    });
  }
}
