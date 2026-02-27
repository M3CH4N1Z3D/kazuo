import { Injectable } from '@nestjs/common';
import { config as dotenvConfig } from 'dotenv';
import * as nodemailer from 'nodemailer';
import { welcomeTemplate } from './templates/welcome';
import { resetPasswordTemplate } from './templates/reset-password';
import { productNotificationTemplate } from './templates/product-notification';
import { companyNotificationTemplate } from './templates/company-notification';
import { invitationTemplate } from './templates/invitation';
import { reportTemplate } from './templates/report';

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

  async sendMail(
    to: string,
    subject: string,
    text: string,
    html?: string,
    attachments?: any[],
  ) {
    try {
      const info = await this.transporter.sendMail({
        from: `"Spot-On" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        text,
        html,
        attachments,
      });
      console.log(`Correo enviado a ${to}`);
      return info;
    } catch (error) {
      console.error('Error enviando correo:', error);
      throw new Error('Failed to send email.');
    }
  }

  async sendWelcome(email: string, name: string) {
    const html = welcomeTemplate(name);
    return this.sendMail(
      email,
      'Bienvenido a Spot-On',
      'Bienvenido a Spot-On',
      html,
    );
  }

  async sendPasswordReset(email: string, name: string, token: string) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const url = `${frontendUrl}/UpdatePass?token=${token}`;
    const html = resetPasswordTemplate(name, url);
    return this.sendMail(
      email,
      'Restablecer Contraseña',
      'Restablecer Contraseña',
      html,
    );
  }

  async sendProductNotification(
    email: string,
    productName: string,
    action: string,
    details: string,
  ) {
    const html = productNotificationTemplate(productName, action, details);
    return this.sendMail(
      email,
      'Actualización de Producto',
      `El producto ${productName} ha sido ${action}`,
      html,
    );
  }

  async sendCompanyInvitation(email: string, link: string) {
    const html = invitationTemplate(link);
    return this.sendMail(
      email,
      'Invitación a Spot-On',
      'Has sido invitado a Spot-On',
      html,
    );
  }

  async sendCompanyUserAdded(
    email: string,
    userName: string,
    companyName: string,
  ) {
    const title = 'Te has unido a una compañía';
    const message = `Has sido añadido a la compañía <strong>${companyName}</strong>.`;
    const html = companyNotificationTemplate(title, message);
    return this.sendMail(email, 'Te has unido a una compañía', message, html);
  }

  async sendCompanyOwnerNotification(email: string, message: string) {
    const title = 'Notificación de Compañía';
    const html = companyNotificationTemplate(title, message);
    return this.sendMail(email, 'Notificación de Compañía', message, html);
  }

  async sendReport(
    email: string,
    message: string,
    attachmentBuffer: Buffer,
    filename: string,
  ) {
    const html = reportTemplate(message);
    const attachments = [
      {
        filename,
        content: attachmentBuffer,
      },
    ];
    return this.sendMail(email, 'Reporte Generado', message, html, attachments);
  }
}
