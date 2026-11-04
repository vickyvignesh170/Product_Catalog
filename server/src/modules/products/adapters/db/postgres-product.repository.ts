import { Product } from "@modules/products/domain/product.entity";
import { ProductRepositoryPort } from "@modules/products/domain/product.repository.port";
import { logMessage as log } from "@server/utils/loggers";

const API_BASE_URL = "https://fakestoreapi.com";

export class PostgresProductRepository implements ProductRepositoryPort {

  async getAllProducts(): Promise<Product[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/products`);
        const products = (await response.json()) as Product[];
        log("Products fetched successfully:", products);
        return products;
    } catch (error) {
        log("Error fetching products:", error);
        throw new Error("Failed to fetch products");
    }
  }

  async getProductById(id: number): Promise<Product | null> {
    try {
        const response = await fetch(`${API_BASE_URL}/products/${id}`);
        const product = (await response.json()) as Product;
        log("Product fetched successfully:", product);
        return product;
    } catch (error) {
        log("Error fetching product:", error);
        throw new Error("Failed to fetch product");
    }
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/products`);
        const products = (await response.json()) as Product[];
        const filteredProducts = products.filter(product => product.category === category);
        log(`Products fetched successfully for category ${category}:`, filteredProducts);
        return filteredProducts;
    } catch (error) {
        log(`Error fetching products for category ${category}:`, error);
        throw new Error("Failed to fetch products by category");
    }
  }

  async getTopRatedProducts(limit: number): Promise<Product[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/products`);
        const products = (await response.json()) as Product[];
        const topRatedProducts = products.sort((a, b) => b.rating.rate - a.rating.rate).slice(0, limit);
        log(`Top ${limit} rated products fetched successfully:`, topRatedProducts);
        return topRatedProducts;
    } catch (error) {
        log("Error fetching top rated products:", error);
        throw new Error("Failed to fetch top rated products");
        }
    }
}