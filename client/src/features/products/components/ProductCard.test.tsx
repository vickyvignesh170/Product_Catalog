import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProductCard } from './ProductCard';

describe('ProductCard', () => {
  it('renders the product information and uses the product route as the card link', () => {
    const product = {
      id: 42,
      title: 'Wireless keyboard',
      price: 79.99,
      description: 'Compact mechanical keyboard with noise dampening.',
      category: 'electronics',
      image: 'https://example.com/keyboard.jpg',
      rating: { rate: 4.7, count: 120 },
    };

    render(
      <MemoryRouter>
        <ProductCard product={product} />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: /view wireless keyboard/i })).toHaveAttribute('href', '/products/42');
    expect(screen.getByText('Wireless keyboard')).toBeInTheDocument();
    expect(screen.getByText('electronics')).toBeInTheDocument();
    expect(screen.getByText('$79.99')).toBeInTheDocument();
  });
});
