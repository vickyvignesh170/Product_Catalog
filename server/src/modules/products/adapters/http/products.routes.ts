import { Router } from 'express';
import { ProductController } from './products.controller';
import { ProductService } from '@modules/products/services/product.services';
import { PostgresProductRepository } from '@modules/products/adapters/db/postgres-product.repository';

const router = Router();

const productRepository = new PostgresProductRepository();
const productService = new ProductService(productRepository);
const productController = new ProductController(productService);

router.get('/product-image', async (req, res, next) => {
  try {
    const rawUrl = typeof req.query.url === 'string' ? req.query.url : '';
    const url = new URL(rawUrl);

    if (url.protocol !== 'https:' || url.hostname !== 'cdn.dummyjson.com') {
      res.status(400).json({ message: 'Invalid product image URL' });
      return;
    }

    const response = await fetch(url, { signal: AbortSignal.timeout(10_000) });
    if (!response.ok) throw new Error(`Image API returned HTTP ${response.status}`);

    const contentType = response.headers.get('content-type');
    if (!contentType?.startsWith('image/')) {
      throw new Error('Product image URL returned a non-image response');
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(Buffer.from(await response.arrayBuffer()));
  } catch (error) {
    next(error);
  }
});

router.get('/product-categories', (req, res, next) => productController.getProductCategories(req, res, next));
router.get('/products/top-rated', (req, res, next) => productController.getTopRatedProducts(req, res, next));
router.get('/products', (req, res, next) => productController.getAllProducts(req, res, next));
router.get('/products/:id', (req, res, next) => productController.getProductById(req, res, next));

export { router as productRoutes };