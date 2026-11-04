export interface Enquiry {
    id: string;
    productId: number;
    productTitle: string;
    customerId: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    subject: string;
    message: string;
    status: 'open' | 'in-progress' | 'resolved';
    createdAt?: Date;
    updatedAt?: Date;
}