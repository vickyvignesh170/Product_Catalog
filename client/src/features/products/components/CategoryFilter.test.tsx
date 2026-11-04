import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CategoryFilter } from './CategoryFilter';

describe('CategoryFilter', () => {
  it('renders available category buttons and emits the selected category', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(
      <CategoryFilter categories={['electronics', 'home']} selectedCategory="all" onSelect={onSelect} />,
    );

    await user.click(screen.getByRole('button', { name: /top rated/i }));

    expect(onSelect).toHaveBeenCalledWith('top-rated');
    expect(screen.getByRole('button', { name: /all products/i })).toHaveClass('filter-btn');
    expect(screen.getByRole('button', { name: /electronics/i })).toBeInTheDocument();
  });
});
