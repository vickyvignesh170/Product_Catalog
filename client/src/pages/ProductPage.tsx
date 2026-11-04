import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { EnquiryModal } from '../features/enquiries/components/EnquiryModal';
import { getProductById } from '../features/products/api/productsApi';
import type { Product } from '../types/catalog';

export function ProductPage(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [isEnquiryOpen, setIsEnquiryOpen] = useState<boolean>(false);

  useEffect(() => {
    if (!id) {
      setError('Product was not found.');
      setLoading(false);
      return;
    }

    let ignore = false;

    async function loadProduct(): Promise<void> {
      try {
        setLoading(true);
        setError('');
        const fetchedProduct = await getProductById(id);

        if (!ignore) {
          setProduct(fetchedProduct);
        }
      } catch (loadError) {
        if (!ignore) {
          const message = loadError instanceof Error ? loadError.message : 'Unable to load this product.';
          setError(message);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    void loadProduct();

    return () => {
      ignore = true;
    };
  }, [id]);

  if (loading) {
    return <main className="page-shell"><div className="status-box">Loading product...</div></main>;
  }

  if (error) {
    return (
      <main className="page-shell">
        <div className="status-box error-box">{error}</div>
        <Link className="secondary-btn" to="/">Back to catalog</Link>
      </main>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <main className="page-shell detail-page">
      <Link className="back-link" to="/">← Back to catalog</Link>

      <article className="product-detail-card">
        <div className="product-detail-media">
          <img src={product.image} alt={product.title} />
        </div>

        <div className="product-detail-content">
          <div className="meta-row">
            <span className="badge">{product.category}</span>
            <span className="rating">★ {product.rating.rate}</span>
          </div>

          <h1>{product.title}</h1>
          <p className="product-price">${product.price.toFixed(2)}</p>
          <p className="product-description">{product.description}</p>

          <div className="detail-stats">
            <div>
              <span className="stat-label">Reviews</span>
              <strong>{product.rating.count}</strong>
            </div>
            <div>
              <span className="stat-label">Availability</span>
              <strong>In stock</strong>
            </div>
          </div>

          <div className="detail-actions">
            <button type="button" className="primary-btn" onClick={() => setIsEnquiryOpen(true)}>
              Enquire
            </button>
            <Link className="secondary-btn" to="/">
              Continue shopping
            </Link>
          </div>
        </div>
      </article>

      {isEnquiryOpen && (
        <EnquiryModal product={product} onClose={() => setIsEnquiryOpen(false)} />
      )}
    </main>
  );
}
