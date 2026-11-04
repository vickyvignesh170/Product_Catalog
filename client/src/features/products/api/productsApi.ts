import type { Product } from '../../../types/catalog';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type') || '';

  if (!response.ok) {
    const errorPayload = contentType.includes('application/json')
      ? await response.json()
      : { message: 'Request failed.' };

    throw new Error((errorPayload as { message?: string }).message || 'Request failed.');
  }

  return contentType.includes('application/json') ? response.json() : (null as T);
}

export async function getTopProducts(limit = 10): Promise<Product[]> {
  const response = await fetch(`${API_BASE_URL}/products/top-rated?limit=${limit}`);
  return handleResponse<Product[]>(response);
}

export async function getCategories(): Promise<string[]> {
  const response = await fetch(`${API_BASE_URL}/product-categories`);
  return handleResponse<string[]>(response);
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  const response = await fetch(`${API_BASE_URL}/products?category=${encodeURIComponent(category)}`);
  return handleResponse<Product[]>(response);
}

export async function getProductById(productId: string | number): Promise<Product> {
  const response = await fetch(`${API_BASE_URL}/products/${productId}`);
  return handleResponse<Product>(response);
}
