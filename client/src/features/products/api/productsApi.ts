import type { PaginatedProductsResponse, Product } from '../../../types/catalog';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

function normalizePaginatedResponse(payload: Product[] | PaginatedProductsResponse | null | undefined): PaginatedProductsResponse {
  if (Array.isArray(payload)) {
    return {
      items: payload,
      page: 1,
      limit: payload.length || 10,
      totalItems: payload.length,
      totalPages: 1,
    };
  }

  const items = Array.isArray(payload?.items) ? payload.items : [];
  const fallbackLimit = items.length > 0 ? items.length : 10;
  const limit = Number(payload?.limit ?? fallbackLimit);
  const totalItems = Number(payload?.totalItems ?? items.length);
  const totalPages = Number(payload?.totalPages ?? Math.max(1, Math.ceil(totalItems / (limit || 1))));

  return {
    items,
    page: Number(payload?.page ?? 1),
    limit,
    totalItems,
    totalPages,
  };
}

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

export async function getAllProducts(page = 1, limit = 10): Promise<PaginatedProductsResponse> {
  const response = await fetch(`${API_BASE_URL}/products?page=${page}&limit=${limit}`);
  const payload = await handleResponse<Product[] | PaginatedProductsResponse>(response);
  return normalizePaginatedResponse(payload);
}

export async function getTopProducts(limit = 10): Promise<Product[]> {
  const response = await fetch(`${API_BASE_URL}/products/top-rated?limit=${limit}`);
  return handleResponse<Product[]>(response);
}

export async function getCategories(): Promise<string[]> {
  const response = await fetch(`${API_BASE_URL}/product-categories`);
  return handleResponse<string[]>(response);
}

export async function getProductsByCategory(category: string, page = 1, limit = 10): Promise<PaginatedProductsResponse> {
  const response = await fetch(
    `${API_BASE_URL}/products?category=${encodeURIComponent(category)}&page=${page}&limit=${limit}`,
  );
  const payload = await handleResponse<Product[] | PaginatedProductsResponse>(response);
  return normalizePaginatedResponse(payload);
}

export async function getProductById(productId: string | number): Promise<Product> {
  const response = await fetch(`${API_BASE_URL}/products/${productId}`);
  return handleResponse<Product>(response);
}
