import { JSX, useEffect, useMemo, useState } from 'react';
import { CategoryFilter } from '../features/products/components/CategoryFilter';
import { ProductCard } from '../features/products/components/ProductCard';
import {
  getCategories,
  getProductsByCategory,
  getTopProducts,
} from '../features/products/api/productsApi';
import type { Product } from '../types/catalog';

export function HomePage(): JSX.Element {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedQuery, setDebouncedQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedQuery(searchQuery.trim().toLowerCase());
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [searchQuery]);

  useEffect(() => {
    let ignore = false;

    async function loadCatalog(): Promise<void> {
      try {
        setLoading(true);
        setError('');

        const [topProducts, categoryList] = await Promise.all([
          getTopProducts(10),
          getCategories(),
        ]);

        if (!ignore) {
          setAllProducts(topProducts);
          setCategories(categoryList);
        }
      } catch (loadError) {
        if (!ignore) {
          const message = loadError instanceof Error ? loadError.message : 'Unable to load products right now.';
          setError(message);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    void loadCatalog();

    return () => {
      ignore = true;
    };
  }, []);

  const visibleProducts = useMemo(() => {
    const normalizedQuery = debouncedQuery;

    return allProducts.filter((product) => {
      const matchesCategory =
        selectedCategory === 'all' || product.category === selectedCategory;

      const haystack = `${product.title} ${product.description} ${product.category}`.toLowerCase();
      const matchesQuery = !normalizedQuery || haystack.includes(normalizedQuery);

      return matchesCategory && matchesQuery;
    });
  }, [allProducts, debouncedQuery, selectedCategory]);

  const handleCategoryChange = async (nextCategory: string): Promise<void> => {
    setSelectedCategory(nextCategory);

    try {
      setLoading(true);
      setError('');

      const nextProducts =
        nextCategory === 'all'
          ? await getTopProducts(10)
          : await getProductsByCategory(nextCategory);

      setAllProducts(nextProducts);
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : 'Unable to filter products.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page-shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">Curated picks</p>
          <h1>Product catalog</h1>
        </div>
        <div className="header-summary">
          <span>{visibleProducts.length} items</span>
        </div>
      </header>

      <div className="catalog-toolbar">
        <label className="search-box" htmlFor="product-search">
          <span>Search</span>
          <input
            id="product-search"
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search products, categories, or keywords"
          />
        </label>
      </div>

      <CategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onSelect={handleCategoryChange}
      />

      {error && <div className="status-box error-box">{error}</div>}

      {loading ? (
        <div className="status-box">Loading products...</div>
      ) : (
        <section className="product-grid">
          {visibleProducts.length > 0 ? (
            visibleProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <div className="status-box">No products found for this search.</div>
          )}
        </section>
      )}
    </main>
  );
}
