import { Router } from 'express';
import { ProductController } from './products.controller';
import { ProductService } from '@modules/products/services/product.services';
import { PostgresProductRepository } from '@modules/products/adapters/db/postgres-product.repository';

const router = Router();

const productRepository = new PostgresProductRepository();
const productService = new ProductService(productRepository);
const productController = new ProductController(productService);

router.get('/product-categories', (req, res, next) => productController.getProductCategories(req, res, next));
router.get('/products/top-rated', (req, res, next) => productController.getTopRatedProducts(req, res, next));
router.get('/products', (req, res, next) => productController.getAllProducts(req, res, next));
router.get('/products/:id', (req, res, next) => productController.getProductById(req, res, next));

export { router as productRoutes };