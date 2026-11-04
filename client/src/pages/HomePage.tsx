import { JSX, useEffect, useMemo, useState } from 'react';
import { CategoryFilter } from '../features/products/components/CategoryFilter';
import { ProductCard } from '../features/products/components/ProductCard';
import {
  getAllProducts,
  getCategories,
  getProductsByCategory,
  getTopProducts,
} from '../features/products/api/productsApi';
import type { Product } from '../types/catalog';

const PAGE_SIZE = 10;
const TOP_RATED_LIMIT = 5;

export function HomePage(): JSX.Element {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedQuery, setDebouncedQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
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

        const [catalogPage, categoryList] = await Promise.all([
          getAllProducts(1, PAGE_SIZE),
          getCategories(),
        ]);

        if (!ignore) {
          setProducts(catalogPage.items);
          setCategories(categoryList);
          setTotalPages(catalogPage.totalPages);
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

  const filteredProducts = useMemo(() => {
    const normalizedQuery = debouncedQuery;

    return (products ?? []).filter((product) => {
      const haystack = `${product.title} ${product.description} ${product.category}`.toLowerCase();
      const matchesQuery = !normalizedQuery || haystack.includes(normalizedQuery);
      return matchesQuery;
    });
  }, [debouncedQuery, products]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, debouncedQuery]);

  const handleCategoryChange = async (nextCategory: string): Promise<void> => {
    setSelectedCategory(nextCategory);
    setCurrentPage(1);

    try {
      setLoading(true);
      setError('');

      if (nextCategory === 'top-rated') {
        const topProducts = await getTopProducts(TOP_RATED_LIMIT);
        setProducts(topProducts);
        setTotalPages(1);
        return;
      }

      const response =
        nextCategory === 'all'
          ? await getAllProducts(1, PAGE_SIZE)
          : await getProductsByCategory(nextCategory, 1, PAGE_SIZE);

      setProducts(response.items);
      setTotalPages(response.totalPages);
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : 'Unable to filter products.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = async (nextPage: number): Promise<void> => {
    if (nextPage < 1 || nextPage > totalPages) {
      return;
    }

    setCurrentPage(nextPage);

    try {
      setLoading(true);
      setError('');

      const response =
        selectedCategory === 'top-rated'
          ? { items: await getTopProducts(TOP_RATED_LIMIT) }
          : selectedCategory === 'all'
            ? await getAllProducts(nextPage, PAGE_SIZE)
            : await getProductsByCategory(selectedCategory, nextPage, PAGE_SIZE);

      setProducts(response.items);
      if ('totalPages' in response) {
        setTotalPages(response.totalPages);
      } else {
        setTotalPages(1);
      }
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : 'Unable to load this page.';
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
          <span>{selectedCategory === 'top-rated' ? filteredProducts?.length : totalPages * PAGE_SIZE} items</span>
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
        <>
          <section className="product-grid">
            {filteredProducts?.length > 0 ? (
              filteredProducts?.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div className="status-box">No products found for this search.</div>
            )}
          </section>

          {selectedCategory !== 'top-rated' && totalPages > 1 && (
            <div className="pagination-bar" aria-label="Product pagination">
              <button
                type="button"
                className="secondary-btn"
                onClick={() => void handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>

              <span>
                Page {currentPage} of {totalPages}
              </span>

              <button
                type="button"
                className="secondary-btn"
                onClick={() => void handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </main>
  );
}
