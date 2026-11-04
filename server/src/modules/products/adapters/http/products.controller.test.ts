import { describe, expect, it, vi } from 'vitest';
import { ProductController } from './products.controller';

describe('ProductController', () => {
  const products = [
    { id: 1, title: 'Keyboard', category: 'electronics', price: 20, description: 'Mechanical keyboard', image: 'k.png', rating: { rate: 4.7, count: 30 } },
    { id: 2, title: 'Chair', category: 'furniture', price: 90, description: 'Ergonomic chair', image: 'c.png', rating: { rate: 4.4, count: 21 } },
    { id: 3, title: 'Monitor', category: 'electronics', price: 120, description: '4K monitor', image: 'm.png', rating: { rate: 4.9, count: 16 } },
    { id: 4, title: 'Lamp', category: 'home', price: 35, description: 'Desk lamp', image: 'l.png', rating: { rate: 4.6, count: 14 } },
  ];

  it('paginates and returns product collections for the requested page', async () => {
    const productService = {
      getAllProducts: vi.fn().mockResolvedValue(products),
      getProductById: vi.fn(),
      getProductsByCategory: vi.fn(),
      getTopRatedProducts: vi.fn(),
    };

    const controller = new ProductController(productService as any);
    const req = { query: { page: '2', limit: '2' }, params: {} } as any;
    const res = { json: vi.fn(), status: vi.fn().mockReturnThis() } as any;
    const next = vi.fn();

    await controller.getAllProducts(req, res, next);

    expect(res.json).toHaveBeenCalledWith({
      items: [products[2], products[3]],
      page: 2,
      limit: 2,
      totalItems: 4,
      totalPages: 2,
    });
  });

  it('returns product categories without duplicates', async () => {
    const productService = {
      getAllProducts: vi.fn().mockResolvedValue(products),
      getProductById: vi.fn(),
      getProductsByCategory: vi.fn(),
      getTopRatedProducts: vi.fn(),
    };

    const controller = new ProductController(productService as any);
    const res = { json: vi.fn(), status: vi.fn().mockReturnThis() } as any;

    await controller.getProductCategories({} as any, res, vi.fn());

    expect(res.json).toHaveBeenCalledWith(['electronics', 'furniture', 'home']);
  });

  it('returns a 400 response when the product id is invalid', async () => {
    const productService = {
      getAllProducts: vi.fn(),
      getProductById: vi.fn(),
      getProductsByCategory: vi.fn(),
      getTopRatedProducts: vi.fn(),
    };

    const controller = new ProductController(productService as any);
    const req = { params: { id: 'abc' } } as any;
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as any;
    const next = vi.fn();

    await controller.getProductById(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid product id' });
  });

  it('returns a 400 response when the top-rated limit is invalid', async () => {
    const productService = {
      getAllProducts: vi.fn(),
      getProductById: vi.fn(),
      getProductsByCategory: vi.fn(),
      getTopRatedProducts: vi.fn(),
    };

    const controller = new ProductController(productService as any);
    const req = { query: { limit: '0' } } as any;
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as any;
    const next = vi.fn();

    await controller.getTopRatedProducts(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid limit parameter' });
  });
});
