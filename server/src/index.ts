import express, { Application } from 'express';
import type { Request, Response } from 'express';
import cors, { CorsOptions } from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { config } from '@server/config';
import path from 'path';
import fs from 'fs';

dotenv.config();
const corsOptions: CorsOptions = {
  origin: config.frontendUrl || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
};

const app: Application = express();
app.use(cors(corsOptions));
app.use(helmet());
app.use(express.json());

app.get('/api/v1/products', (req: Request, res: Response) => {
    res.json({ message: "TypeScript Server is running smoothly!" });
});

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
