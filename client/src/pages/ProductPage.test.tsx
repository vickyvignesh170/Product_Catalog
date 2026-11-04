import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';
import { ProductPage } from './ProductPage';
import { getProductById } from '../features/products/api/productsApi';

vi.mock('../features/products/api/productsApi', () => ({
  getProductById: vi.fn(),
}));

describe('ProductPage', () => {
  it('loads the selected product, reveals the enquiry modal, and renders the detail page', async () => {
    const user = userEvent.setup();
    vi.mocked(getProductById).mockResolvedValue({
      id: 10,
      title: 'Premium desk chair',
      price: 299.99,
      description: 'A premium chair for your office.',
      category: 'furniture',
      image: 'https://example.com/chair.jpg',
      rating: { rate: 4.9, count: 100 },
    });

    render(
      <MemoryRouter initialEntries={['/products/10']}>
        <Routes>
          <Route path="/products/:id" element={<ProductPage />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByText('Premium desk chair')).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: /enquire/i }));

    expect(screen.getByText(/product enquiry/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /premium desk chair/i, level: 1 })).toBeInTheDocument();
  });
});
