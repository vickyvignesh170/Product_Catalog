import { Product } from "@modules/products/domain/product.entity";
import { ProductRepositoryPort } from "@modules/products/domain/product.repository.port";

export class ProductService {
  private productRepository: ProductRepositoryPort;

  constructor(productRepository: ProductRepositoryPort) {
    this.productRepository = productRepository;
  }

  async getAllProducts(): Promise<Product[]> {
    return this.productRepository.getAllProducts();
  }

  async getProductById(id: number): Promise<Product | null> {
    return this.productRepository.getProductById(id);
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return this.productRepository.getProductsByCategory(category);
  }

  async getTopRatedProducts(limit: number): Promise<Product[]> {
    return this.productRepository.getTopRatedProducts(limit);
  }
}