import { beforeEach, describe, expect, it, vi } from 'vitest';
import nodemailer from 'nodemailer';
import { NodeMailerService } from './mailer.service';

vi.mock('nodemailer', () => ({
  default: {
    createTransport: vi.fn(),
    createTestAccount: vi.fn(),
    getTestMessageUrl: vi.fn(() => 'https://preview.example.com/mail/123'),
  },
}));

describe('NodeMailerService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.SMTP_HOST;
    delete process.env.SMTP_PORT;
    delete process.env.SMTP_SECURE;
    delete process.env.SMTP_USER;
    delete process.env.SMTP_PASS;
    delete process.env.SMTP_FROM;
  });

  it('sends a sales enquiry with the expected subject content and recipient', async () => {
    const sendMail = vi.fn().mockResolvedValue({ messageId: 'mail-123' });
    const createTransport = vi.mocked(nodemailer.createTransport);
    const createTestAccount = vi.mocked(nodemailer.createTestAccount);

    createTestAccount.mockResolvedValue({ user: 'user@example.com', pass: 'secret' } as any);
    createTransport.mockReturnValue({ sendMail } as any);

    const service = new NodeMailerService();

    await service.sendSalesEnquiryEmail({
      productId: 9,
      productTitle: 'Coffee grinder',
      customerName: 'Alice Smith',
      customerEmail: 'alice@example.com',
      customerPhone: '+1 234 5678',
      message: 'How soon can this ship?',
      salesEmail: 'sales@catalog.example',
    });

    expect(createTestAccount).toHaveBeenCalledTimes(1);
    expect(createTransport).toHaveBeenCalledTimes(1);
    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'sales@catalog.example',
        subject: 'New product enquiry: Coffee grinder',
        text: expect.stringContaining('Customer: Alice Smith'),
        html: expect.stringContaining('Coffee grinder'),
      }),
    );
  });
});
