import { randomUUID } from 'crypto';
import { Enquiry } from '@modules/product_enquiries/domain/enquiry.entity';
import { EnquiryRepository } from '@modules/product_enquiries/domain/enquiry.repository.port';
import { MailerService, mailerService } from '@server/shared/services/mailer.service';
import { config } from '@server/config';

export interface CreateEnquiryInput {
  productId: number;
  productTitle: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  message: string;
  subject?: string;
}

export class EnquiryService {
  constructor(
    private readonly enquiryRepository: EnquiryRepository,
    private readonly mailer: MailerService = mailerService
  ) {}

  async createEnquiry(input: CreateEnquiryInput): Promise<Enquiry> {
    const cleanedMessage = input.message.trim();
    const enquiry: Enquiry = {
      id: randomUUID(),
      productId: Number(input.productId),
      productTitle: input.productTitle.trim(),
      customerId: `customer-${randomUUID()}`,
      customerName: input.customerName.trim(),
      customerEmail: input.customerEmail.trim(),
      customerPhone: input.customerPhone?.trim(),
      subject: input.subject?.trim() || `Enquiry for ${input.productTitle.trim()}`,
      message: cleanedMessage,
      status: 'open',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const savedEnquiry = await this.enquiryRepository.create(enquiry);

    await this.mailer.sendSalesEnquiryEmail({
      productId: savedEnquiry.productId,
      productTitle: savedEnquiry.productTitle,
      customerName: savedEnquiry.customerName,
      customerEmail: savedEnquiry.customerEmail,
      customerPhone: savedEnquiry.customerPhone,
      message: savedEnquiry.message,
      salesEmail: config.salesEmail || 'sales@productcatalog.local'
    });

    console.log(`[log]: Sales enquiry email sent for enquiry ID: ${savedEnquiry}`);

    return savedEnquiry;
  }

  async getAllEnquiries(): Promise<Enquiry[]> {
    return this.enquiryRepository.findAll();
  }
}
