export type ProductRating = {
  rate: number;
  count: number;
};

export type Product = {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: ProductRating;
};

export type EnquiryPayload = {
  productId: number;
  productTitle: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  message: string;
};

export type EnquiryResponse = {
  success: boolean;
  message: string;
  enquiry?: Record<string, unknown>;
};
