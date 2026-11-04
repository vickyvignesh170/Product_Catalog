import express, { Application } from 'express';
import type { Request, Response } from 'express';
import cors, { CorsOptions } from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { config } from '@server/config';
import path from 'path';
import fs from 'fs';
import { productRoutes } from '@modules/products/adapters/http/products.routes';
import { enquiryRoutes } from '@modules/product_enquiries/adapters/http/enquiry.routes';

dotenv.config();
const allowedOrigins = config.allowedDomains;

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
};

const app: Application = express();
app.use(cors(corsOptions));
app.use(helmet());
app.use(express.json());

app.use('/api/v1', productRoutes);
app.use('/api/v1', enquiryRoutes);

const clientBuildPath = path.join(__dirname, '../../client/dist');
console.log(`Serving static files from: ${clientBuildPath}`);
app.use(express.static(clientBuildPath));

// Serve the frontend fallback only when the built client exists.
if (fs.existsSync(clientBuildPath)) {
  app.get(/^(?!\/api).*/, (req: Request, res: Response) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(config.nodeEnv === 'development' && { stack: err.stack }),
  });
});

export { app };
