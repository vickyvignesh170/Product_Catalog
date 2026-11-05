import express, { Application } from 'express';
import type { Request, Response } from 'express';
import cors, { CorsOptions } from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createServer, type Server as HttpServer } from 'http';
import { config } from '@server/config';
import path from 'path';
import fs from 'fs';
import { productRoutes } from '@modules/products/adapters/http/products.routes';
import { enquiryRoutes } from '@modules/product_enquiries/adapters/http/enquiry.routes';

dotenv.config();
const allowedOrigins = config.allowedDomains;

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    const isDevelopmentLocalOrigin = config.nodeEnv === 'development'
      && origin !== undefined
      && /^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?$/.test(origin);

    if (!origin || allowedOrigins.includes(origin) || isDevelopmentLocalOrigin) {
      callback(null, true);
      return;
    }

    callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
};

async function createApp(): Promise<{ app: Application; httpServer: HttpServer }> {
  const app: Application = express();
  const httpServer = createServer(app);

  const cspSetting = config.nodeEnv === 'development'
    ? false
    : {
        directives: {
          defaultSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:', 'http:'],
        },
      };


  app.use(helmet({
    contentSecurityPolicy: cspSetting,
  }));
  app.use(express.json());

  app.use('/api/v1', cors(corsOptions), productRoutes);
  app.use('/api/v1', cors(corsOptions), enquiryRoutes);

  const clientRootPath = path.join(__dirname, '../../client');
  const clientBuildPath = path.join(__dirname, '../../client/dist');

  if (config.nodeEnv === 'development') {
    if (fs.existsSync(clientBuildPath)) {
      app.use(express.static(clientBuildPath));
      app.get(/^(?!\/api).*/, (req: Request, res: Response) => {
        res.sendFile(path.join(clientBuildPath, 'index.html'));
      });
    } else {
      const { createServer: createViteServer } = require('vite');
      const vite = await createViteServer({
        root: clientRootPath,
        server: {
          middlewareMode: true,
          hmr: { server: httpServer, port: config.port },
        },
        appType: 'spa',
      });

      app.use(vite.middlewares);

      app.get(/^(?!\/api).*/, async (req: Request, res: Response, next) => {
        try {
          const template = fs.readFileSync(path.join(clientRootPath, 'index.html'), 'utf8');
          const transformedHtml = await vite.transformIndexHtml(req.originalUrl || '/', template);
          res.status(200).set({ 'Content-Type': 'text/html' }).send(transformedHtml);
        } catch (error) {
          next(error);
        }
      });
    }
  } else {
    console.log(`Serving static files from: ${clientBuildPath}`);
    app.use(express.static(clientBuildPath));

    if (fs.existsSync(clientBuildPath)) {
      app.get(/^(?!\/api).*/, (req: Request, res: Response) => {
        res.sendFile(path.join(clientBuildPath, 'index.html'));
      });
    }
  }

  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: err.message || 'Internal Server Error',
      ...(config.nodeEnv === 'development' && { stack: err.stack }),
    });
  });

  return { app, httpServer };
}

export const appPromise = createApp();

