import { Injectable } from '@nestjs/common';
import { config as dotenvConfig } from 'dotenv';
import * as nodemailer from 'nodemailer';

dotenvConfig({ path: '.development.env' });

@Injectable()
export class MailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendMail(to: string, subject: string, text: string, html?: string) {
    try {
      const info = await this.transporter.sendMail({
        from: `"Kazuo" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        text,
        html,
      });
      console.log(`Correo enviado a ${to}`);
      return info;
    } catch (error) {
      console.error('Error enviando correo:', error);
      throw new Error('Failed to send email.');
    }
  }
}
