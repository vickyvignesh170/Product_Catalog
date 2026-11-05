import { Link } from 'react-router-dom';
import type { Product } from '../../../types/catalog';
import heroImage from '../../../assets/hero.png';

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps): JSX.Element {
  return (
    <Link to={`/products/${product.id}`} className="product-card" aria-label={`View ${product.title}`}>
      <div className="product-image-wrap">
        <img
          src={product.image}
          alt={product.title}
          onError={(event) => {
            const image = event.currentTarget;
            if (image.src !== new URL(heroImage, window.location.origin).href) {
              image.src = heroImage;
            }
          }}
        />
      </div>

      <div className="product-copy">
        <div className="product-topline">
          <span className="badge">{product.category}</span>
          <span className="rating">★ {product.rating.rate}</span>
        </div>

        <h2>{product.title}</h2>
        <p className="product-description">{product.description}</p>

        <div className="product-footer">
          <strong>${product.price.toFixed(2)}</strong>
          <span>View details</span>
        </div>
      </div>
    </Link>
  );
}
