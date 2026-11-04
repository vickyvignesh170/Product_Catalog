import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { HomePage } from './HomePage';
import { getAllProducts, getCategories, getProductsByCategory, getTopProducts } from '../features/products/api/productsApi';

vi.mock('../features/products/api/productsApi', () => ({
  getAllProducts: vi.fn(),
  getCategories: vi.fn(),
  getProductsByCategory: vi.fn(),
  getTopProducts: vi.fn(),
}));

describe('HomePage', () => {
  const products = [
    {
      id: 1,
      title: 'Sample product 1',
      price: 10,
      description: 'The first sample product',
      category: 'electronics',
      image: 'https://example.com/1.jpg',
      rating: { rate: 4.2, count: 15 },
    },
    {
      id: 2,
      title: 'Sample product 2',
      price: 20,
      description: 'The second sample product',
      category: 'home',
      image: 'https://example.com/2.jpg',
      rating: { rate: 4.8, count: 21 },
    },
  ];

  beforeEach(() => {
    vi.mocked(getAllProducts).mockResolvedValue({
      items: products,
      page: 1,
      limit: 10,
      totalItems: 2,
      totalPages: 1,
    });
    vi.mocked(getCategories).mockResolvedValue(['electronics', 'home']);
    vi.mocked(getProductsByCategory).mockResolvedValue({
      items: [products[0]],
      page: 1,
      limit: 10,
      totalItems: 1,
      totalPages: 1,
    });
    vi.mocked(getTopProducts).mockResolvedValue(products);
  });

  it('loads the catalog and supports category switching in the product toolbar', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByText('Sample product 1')).toBeInTheDocument());
    expect(screen.getByRole('searchbox', { name: /search/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /top rated/i }));

    await waitFor(() => expect(getTopProducts).toHaveBeenCalledWith(5));
  });
});
