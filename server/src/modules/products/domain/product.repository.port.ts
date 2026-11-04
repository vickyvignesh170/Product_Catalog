import { Product } from "@modules/products/domain/product.entity";

export interface ProductRepositoryPort {
  getAllProducts(): Promise<Product[]>;
  getProductById(id: number): Promise<Product | null>;
  getProductsByCategory(category: string): Promise<Product[]>;
  getTopRatedProducts(limit: number): Promise<Product[]>;
}