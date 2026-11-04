import nodemailer, { SendMailOptions, Transporter } from 'nodemailer';
import { logMessage } from '@server/utils/loggers';

export interface MailOptions {
  to: string;
  from?: string;
  subject: string;
  text: string;
  html?: string;
}

export interface MailSendResult {
  messageId?: string;
  previewUrl?: string;
}

export interface SalesEnquiryMail {
  productId: number;
  productTitle: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  message: string;
  salesEmail?: string;
}

export interface MailerService {
  send(options: MailOptions): Promise<MailSendResult>;
  sendSalesEnquiryEmail(enquiry: SalesEnquiryMail): Promise<MailSendResult>;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export class NodeMailerService implements MailerService {
  private transporter: Transporter | null = null;

  private async getTransporter(): Promise<Transporter> {
    if (this.transporter) {
      return this.transporter;
    }

    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = Number(process.env.SMTP_PORT || 587);
    const smtpSecure = String(process.env.SMTP_SECURE || 'false').toLowerCase() === 'true';
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (smtpHost && smtpUser && smtpPass) {
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure,
        auth: { user: smtpUser, pass: smtpPass }
      });
      return this.transporter;
    }

    const testAccount = await nodemailer.createTestAccount();
    this.transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });

    logMessage(`Generated temporary Ethereal mail account. Preview inbox: ${testAccount.user}`);
    return this.transporter;
  }

  async send(options: MailOptions): Promise<MailSendResult> {
    const transporter = await this.getTransporter();
    const mailOptions: SendMailOptions = {
      from: options.from || process.env.SMTP_FROM || 'Product Catalog <no-reply@productcatalog.local>',
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html || `<pre>${options.text}</pre>`
    };

    const info = await transporter.sendMail(mailOptions);
    const previewUrl = nodemailer.getTestMessageUrl(info);

    logMessage(`Email sent to ${options.to}: ${info.messageId}${previewUrl ? ` | Preview: ${previewUrl}` : ''}`);

    return {
      messageId: info.messageId,
      previewUrl: previewUrl ? previewUrl : undefined
    };
  }

  async sendSalesEnquiryEmail(enquiry: SalesEnquiryMail): Promise<MailSendResult> {
    const salesEmail = enquiry.salesEmail || process.env.SALES_EMAIL || 'sales@productcatalog.local';
    const productTitle = escapeHtml(enquiry.productTitle);
    const customerName = escapeHtml(enquiry.customerName);
    const customerEmail = escapeHtml(enquiry.customerEmail);
    const customerPhone = escapeHtml(enquiry.customerPhone || 'Not provided');
    const message = escapeHtml(enquiry.message).replace(/\n/g, '<br />');
    const subject = `New product enquiry: ${enquiry.productTitle}`;
    const text = [
      'New product enquiry received.',
      '',
      `Product: ${enquiry.productTitle}`,
      `Product ID: ${enquiry.productId}`,
      `Customer: ${enquiry.customerName}`,
      `Email: ${enquiry.customerEmail}`,
      `Phone: ${enquiry.customerPhone || 'Not provided'}`,
      '',
      'Message:',
      enquiry.message
    ].join('\n');

    const html = `
      <h2>New product enquiry</h2>
      <p><strong>Product:</strong> ${productTitle}</p>
      <p><strong>Product ID:</strong> ${enquiry.productId}</p>
      <p><strong>Customer:</strong> ${customerName}</p>
      <p><strong>Email:</strong> ${customerEmail}</p>
      <p><strong>Phone:</strong> ${customerPhone}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `;

    return this.send({
      to: salesEmail,
      subject,
      text,
      html
    });
  }
}

export const mailerService: MailerService = new NodeMailerService();
