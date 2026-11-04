import { describe, expect, it, vi } from 'vitest';
import { EnquiryService } from './enquiry.service';

describe('EnquiryService', () => {
  it('creates an enquiry, saves it, and sends a sales email', async () => {
    const savedEnquiry = {
      id: 'enquiry-1',
      productId: 101,
      productTitle: 'Desk lamp',
      customerId: 'customer-1',
      customerName: 'Jane Doe',
      customerEmail: 'jane@example.com',
      customerPhone: '+1 555 0000',
      subject: 'Enquiry for Desk lamp',
      message: 'What is the warranty?',
      status: 'open',
      createdAt: new Date('2025-01-01T00:00:00.000Z'),
      updatedAt: new Date('2025-01-01T00:00:00.000Z'),
    };

    const enquiryRepository = {
      create: vi.fn().mockResolvedValue(savedEnquiry),
      findById: vi.fn(),
      findAll: vi.fn(),
      delete: vi.fn(),
    };

    const mailer = {
      sendSalesEnquiryEmail: vi.fn().mockResolvedValue({ messageId: 'mail-1' }),
      send: vi.fn(),
    };

    const service = new EnquiryService(enquiryRepository as any, mailer as any);

    const result = await service.createEnquiry({
      productId: 101,
      productTitle: 'Desk lamp',
      customerName: '  Jane Doe  ',
      customerEmail: '  jane@example.com  ',
      customerPhone: ' +1 555 0000 ',
      message: '  What is the warranty?  ',
    });

    expect(result.productTitle).toBe('Desk lamp');
    expect(result.customerName).toBe('Jane Doe');
    expect(result.message).toBe('What is the warranty?');
    expect(result.id).toBeTruthy();
    expect(enquiryRepository.create).toHaveBeenCalledTimes(1);
    expect(mailer.sendSalesEnquiryEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        productId: 101,
        productTitle: 'Desk lamp',
        customerName: 'Jane Doe',
        customerEmail: 'jane@example.com',
        customerPhone: '+1 555 0000',
        message: 'What is the warranty?',
      }),
    );
  });

  it('returns all enquiries from the repository', async () => {
    const enquiries = [
      {
        id: 'e-1',
        productId: 1,
        productTitle: 'Mouse',
        customerId: 'customer-1',
        customerName: 'Jane Doe',
        customerEmail: 'jane@example.com',
        subject: 'Mouse enquiry',
        message: 'I need pricing',
        status: 'open',
      },
    ];

    const enquiryRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn().mockResolvedValue(enquiries),
      delete: vi.fn(),
    };

    const service = new EnquiryService(enquiryRepository as any);

    await expect(service.getAllEnquiries()).resolves.toEqual(enquiries);
    expect(enquiryRepository.findAll).toHaveBeenCalledTimes(1);
  });
});
