import { Product } from "@modules/products/domain/product.entity";
import { ProductRepositoryPort } from "@modules/products/domain/product.repository.port";
import { logMessage as log } from "@server/utils/loggers";

const API_BASE_URL = "https://dummyjson.com";

type DummyJsonProduct = {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  thumbnail: string;
  rating: number;
};

function mapProduct(product: DummyJsonProduct): Product {
  return {
    id: product.id,
    title: product.title,
    price: product.price,
    description: product.description,
    category: product.category,
    image: `/api/v1/product-image?url=${encodeURIComponent(product.thumbnail)}`,
    rating: {
      rate: product.rating,
      count: 0,
    },
  };
}

async function fetchProducts(url: string): Promise<DummyJsonProduct[]> {
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    throw new Error(`Product API returned HTTP ${response.status}`);
  }

  const data = await response.json() as { products?: DummyJsonProduct[] };
  if (!Array.isArray(data.products)) {
    throw new Error("Product API returned an invalid response");
  }
  return data.products;
}

export class PostgresProductRepository implements ProductRepositoryPort {
  async getAllProducts(): Promise<Product[]> {
    try {
      const products = await fetchProducts(`${API_BASE_URL}/products?limit=100`);
      return products.map(mapProduct);
    } catch (error) {
      log("Error fetching products:", error);
      throw new Error("Failed to fetch products");
    }
  }

  async getProductById(id: number): Promise<Product | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(10_000),
      });
      if (response.status === 404) return null;
      if (!response.ok) throw new Error(`Product API returned HTTP ${response.status}`);
      return mapProduct(await response.json() as DummyJsonProduct);
    } catch (error) {
      log("Error fetching product:", error);
      throw new Error("Failed to fetch product");
    }
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    try {
      const products = await fetchProducts(
        `${API_BASE_URL}/products/category/${encodeURIComponent(category)}?limit=100`,
      );
      return products.map(mapProduct);
    } catch (error) {
      log(`Error fetching products for category ${category}:`, error);
      throw new Error("Failed to fetch products by category");
    }
  }

  async getTopRatedProducts(limit: number): Promise<Product[]> {
    try {
      const products = await fetchProducts(`${API_BASE_URL}/products?limit=100`);
      return products.map(mapProduct)
        .sort((a, b) => b.rating.rate - a.rating.rate)
        .slice(0, limit);
    } catch (error) {
      log("Error fetching top rated products:", error);
      throw new Error("Failed to fetch top rated products");
    }
  }
}