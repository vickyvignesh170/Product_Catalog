import { Request, Response, NextFunction } from 'express';
import { ProductService } from '@modules/products/services/product.services';
import { logMessage } from '@server/utils/loggers';

export class ProductController {
  private productService: ProductService;

  constructor(productService: ProductService) {
    this.productService = productService;
  }

  async getAllProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const category = req.query.category as string | undefined;
      const page = Number.parseInt((req.query.page as string | undefined) ?? '1', 10);
      const limit = Number.parseInt((req.query.limit as string | undefined) ?? '10', 10);

      const safePage = Number.isNaN(page) || page < 1 ? 1 : page;
      const safeLimit = Number.isNaN(limit) || limit < 1 ? 10 : limit;

      const allProducts = category
        ? await this.productService.getProductsByCategory(category)
        : await this.productService.getAllProducts();

      const totalItems = allProducts.length;
      const totalPages = Math.max(1, Math.ceil(totalItems / safeLimit));
      const currentPage = Math.min(safePage, totalPages);
      const startIndex = (currentPage - 1) * safeLimit;
      const paginatedProducts = allProducts.slice(startIndex, startIndex + safeLimit);

      res.json({
        items: paginatedProducts,
        page: currentPage,
        limit: safeLimit,
        totalItems,
        totalPages,
      });
    } catch (error) {
      next(error);
    }
  }

  async getProductCategories(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const products = await this.productService.getAllProducts();
        const categories = Array.from(new Set(products.map(product => product.category)));
        res.json(categories);
    } catch (error) {
        next(error);
    }
  }

  async getProductById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rawId = req.params.id;
      const idParam = Array.isArray(rawId) ? rawId[0] : rawId;
      const id = Number.parseInt(idParam, 10);

      if (Number.isNaN(id)) {
        res.status(400).json({ message: 'Invalid product id' });
        return;
      }

      const product = await this.productService.getProductById(id);
      if (product) {
        res.json(product);
      } else {
        res.status(404).json({ message: 'Product not found' });
      }
    } catch (error) {
      next(error);
    }
  }

  async getTopRatedProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limitParam = (req.query.limit as string | undefined) ?? '5';
      const limit = Number.parseInt(limitParam, 10);

      if (Number.isNaN(limit) || limit <= 0) {
        res.status(400).json({ message: 'Invalid limit parameter' });
        return;
      }

      const products = await this.productService.getTopRatedProducts(limit);
      res.json(products);
    } catch (error) {
      next(error);
    }
  }
}