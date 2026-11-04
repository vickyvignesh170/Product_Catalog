import { describe, expect, it, vi } from 'vitest';
import { ProductService } from './product.services';

describe('ProductService', () => {
  const products = [
    {
      id: 1,
      title: 'Wireless mouse',
      price: 29.99,
      description: 'Ergonomic wireless mouse',
      category: 'electronics',
      image: 'mouse.png',
      rating: { rate: 4.5, count: 88 },
    },
    {
      id: 2,
      title: 'Desk lamp',
      price: 49.5,
      description: 'Minimal desk lamp',
      category: 'home',
      image: 'lamp.png',
      rating: { rate: 4.8, count: 44 },
    },
  ];

  it('returns all products from the repository', async () => {
    const productRepository = {
      getAllProducts: vi.fn().mockResolvedValue(products),
      getProductById: vi.fn(),
      getProductsByCategory: vi.fn(),
      getTopRatedProducts: vi.fn(),
    };

    const service = new ProductService(productRepository as any);

    await expect(service.getAllProducts()).resolves.toEqual(products);
    expect(productRepository.getAllProducts).toHaveBeenCalledTimes(1);
  });

  it('returns a product by id from the repository', async () => {
    const productRepository = {
      getAllProducts: vi.fn(),
      getProductById: vi.fn().mockResolvedValue(products[0]),
      getProductsByCategory: vi.fn(),
      getTopRatedProducts: vi.fn(),
    };

    const service = new ProductService(productRepository as any);

    await expect(service.getProductById(1)).resolves.toEqual(products[0]);
    expect(productRepository.getProductById).toHaveBeenCalledWith(1);
  });

  it('filters products by category and returns only matching results', async () => {
    const filtered = [products[0]];
    const productRepository = {
      getAllProducts: vi.fn(),
      getProductById: vi.fn(),
      getProductsByCategory: vi.fn().mockResolvedValue(filtered),
      getTopRatedProducts: vi.fn(),
    };

    const service = new ProductService(productRepository as any);

    await expect(service.getProductsByCategory('electronics')).resolves.toEqual(filtered);
    expect(productRepository.getProductsByCategory).toHaveBeenCalledWith('electronics');
  });

  it('returns the top rated products with a requested limit', async () => {
    const topProducts = [products[1]];
    const productRepository = {
      getAllProducts: vi.fn(),
      getProductById: vi.fn(),
      getProductsByCategory: vi.fn(),
      getTopRatedProducts: vi.fn().mockResolvedValue(topProducts),
    };

    const service = new ProductService(productRepository as any);

    await expect(service.getTopRatedProducts(1)).resolves.toEqual(topProducts);
    expect(productRepository.getTopRatedProducts).toHaveBeenCalledWith(1);
  });
});
