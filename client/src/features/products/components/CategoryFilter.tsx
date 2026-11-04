type CategoryFilterProps = {
  categories: string[];
  selectedCategory: string;
  onSelect: (category: string) => void | Promise<void>;
};

export function CategoryFilter({
  categories,
  selectedCategory,
  onSelect,
}: CategoryFilterProps): JSX.Element {
  const filters = ['all', 'top-rated', ...categories];

  return (
    <nav className="filter-bar" aria-label="Filter products by category">
      {filters.map((category) => {
        const isActive = selectedCategory === category;

        return (
          <button
            key={category}
            type="button"
            className={isActive ? 'filter-btn active' : 'filter-btn'}
            onClick={() => void onSelect(category)}
          >
            {category === 'all' ? 'All products' : category === 'top-rated' ? 'Top rated' : category}
          </button>
        );
      })}
    </nav>
  );
}
