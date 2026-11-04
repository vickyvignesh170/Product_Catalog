import { NextFunction, Request, Response } from 'express';
import { EnquiryService } from '@modules/product_enquiries/services/enquiry.service';

export class EnquiryController {
  constructor(private readonly enquiryService: EnquiryService) {}

  async createEnquiry(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const productId = Number(req.body?.productId);
      const productTitle = String(req.body?.productTitle ?? '').trim();
      const customerName = String(req.body?.customerName ?? '').trim();
      const customerEmail = String(req.body?.customerEmail ?? '').trim();
      const message = String(req.body?.message ?? '').trim();

      if (!productId || !productTitle || !customerName || !customerEmail || !message) {
        res.status(400).json({
          success: false,
          message: 'productId, productTitle, customerName, customerEmail, and message are required.'
        });
        return;
      }

      const enquiry = await this.enquiryService.createEnquiry({
        productId,
        productTitle,
        customerName,
        customerEmail,
        customerPhone: req.body?.customerPhone ? String(req.body.customerPhone).trim() : undefined,
        message,
        subject: req.body?.subject ? String(req.body.subject).trim() : undefined
      });

      res.status(201).json({
        success: true,
        message: 'Thank you! Your enquiry has been sent successfully.',
        enquiry
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllEnquiries(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const enquiries = await this.enquiryService.getAllEnquiries();
      res.json({ success: true, enquiries });
    } catch (error) {
      next(error);
    }
  }
}
