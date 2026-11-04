import { describe, expect, it, vi } from 'vitest';
import { EnquiryController } from './enquiry.controller';

describe('EnquiryController', () => {
  it('creates an enquiry for a valid request', async () => {
    const enquiryService = {
      createEnquiry: vi.fn().mockResolvedValue({
        id: 'enquiry-1',
        productId: 101,
        productTitle: 'Laptop',
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        customerPhone: '+1 555 0000',
        message: 'Can you share the price?',
        status: 'open',
      }),
      getAllEnquiries: vi.fn(),
    };

    const controller = new EnquiryController(enquiryService as any);
    const req = {
      body: {
        productId: 101,
        productTitle: 'Laptop',
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        customerPhone: '+1 555 0000',
        message: 'Can you share the price?',
      },
    } as any;
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as any;
    const next = vi.fn();

    await controller.createEnquiry(req, res, next);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(enquiryService.createEnquiry).toHaveBeenCalledWith({
      productId: 101,
      productTitle: 'Laptop',
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
      customerPhone: '+1 555 0000',
      message: 'Can you share the price?',
      subject: undefined,
    });
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Thank you! Your enquiry has been sent successfully.',
      enquiry: expect.objectContaining({ productId: 101 }),
    });
  });

  it('rejects requests that are missing required fields', async () => {
    const enquiryService = {
      createEnquiry: vi.fn(),
      getAllEnquiries: vi.fn(),
    };

    const controller = new EnquiryController(enquiryService as any);
    const req = { body: { productId: 0, productTitle: '', customerName: '', customerEmail: '', message: '' } } as any;
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as any;
    const next = vi.fn();

    await controller.createEnquiry(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'productId, productTitle, customerName, customerEmail, and message are required.',
    });
  });

  it('returns all enquiries saved in the system', async () => {
    const enquiries = [{ id: 'e-1', productId: 2, productTitle: 'Chair', customerName: 'Annie', customerEmail: 'annie@example.com', message: 'hello', status: 'open' }];
    const enquiryService = {
      createEnquiry: vi.fn(),
      getAllEnquiries: vi.fn().mockResolvedValue(enquiries),
    };

    const controller = new EnquiryController(enquiryService as any);
    const res = { json: vi.fn(), status: vi.fn().mockReturnThis() } as any;

    await controller.getAllEnquiries({} as any, res, vi.fn());

    expect(res.json).toHaveBeenCalledWith({ success: true, enquiries });
  });
});
