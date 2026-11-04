import { Enquiry } from "@modules/product_enquiries/domain/enquiry.entity";

export interface EnquiryRepository {
    create(enquiry: Enquiry): Promise<Enquiry>;
    findById(id: string): Promise<Enquiry | null>;
    findAll(): Promise<Enquiry[]>;
    delete(id: string): Promise<boolean>;
}