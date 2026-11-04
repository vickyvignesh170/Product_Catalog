import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { EnquiryModal } from './EnquiryModal';
import { submitEnquiry } from '../api/enquiriesApi';

vi.mock('../api/enquiriesApi', () => ({
  submitEnquiry: vi.fn(),
}));

describe('EnquiryModal', () => {
  const product = {
    id: 7,
    title: 'Desk lamp',
    price: 32.5,
    description: 'Minimal desk lamp',
    category: 'home',
    image: 'https://example.com/lamp.jpg',
    rating: { rate: 4.8, count: 10 },
  };

  it('validates required fields before submission and shows a success state on success', async () => {
    const user = userEvent.setup();
    vi.mocked(submitEnquiry).mockResolvedValue({ success: true, message: 'Thank you! Your enquiry has been sent successfully.' });

    render(<EnquiryModal product={product} onClose={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /send enquiry/i }));

    expect(screen.getByText('Full name is required.')).toBeInTheDocument();
    expect(screen.getByText('Email is required.')).toBeInTheDocument();
    expect(screen.getByText('Message is required.')).toBeInTheDocument();

    await user.type(screen.getByLabelText(/full name/i), 'Jane Doe');
    await user.type(screen.getByLabelText(/email/i), 'jane@example.com');
    await user.type(screen.getByLabelText(/phone number/i), '+1 555-0100');
    await user.type(screen.getByLabelText(/message/i), 'I would like more information about this product.');
    await user.click(screen.getByRole('button', { name: /send enquiry/i }));

    await waitFor(() => expect(submitEnquiry).toHaveBeenCalledTimes(1));
    expect(submitEnquiry).toHaveBeenCalledWith(
      expect.objectContaining({
        productId: 7,
        productTitle: 'Desk lamp',
        customerName: 'Jane Doe',
        customerEmail: 'jane@example.com',
        customerPhone: '+1 555-0100',
        message: 'I would like more information about this product.',
      }),
    );
    expect(await screen.findByText(/thank you! your enquiry has been sent successfully\./i)).toBeInTheDocument();
  });
});
