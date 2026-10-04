import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import compression from 'compression';
import mongoose from 'mongoose';
import adminRoutes from './routes/admin.routes.js';
import excelRoutes from './routes/excel.routes.js';
import appRoutes from './routes/app.routes.js';
import { getAllowedOrigins } from './config/env.js';

const app = express();
const allowedOrigins = new Set(getAllowedOrigins());

app.set('trust proxy', 1);
app.use(compression());
app.use(cors({
  origin(origin, callback) {
    // Health checks and server-to-server requests have no Origin header.
    // Browser requests must come from an explicitly configured frontend URL.
    if (!origin || allowedOrigins.has(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`Origin not allowed by CORS: ${origin}`));
  },
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Authorization', 'Content-Type'],
  maxAge: 86400,
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/admin', adminRoutes);
app.use('/admin', excelRoutes);
app.use('/app', appRoutes);

app.get('/', (req, res) => {
  return res.status(200).json({ success: true, msg: 'SDC Portal API is running' });
});

app.get('/health', (req, res) => {
  const databaseConnected = mongoose.connection.readyState === 1;

  return res.status(databaseConnected ? 200 : 503).json({
    success: databaseConnected,
    status: databaseConnected ? 'ok' : 'degraded',
    database: databaseConnected ? 'connected' : 'disconnected',
  });
});

app.use((req, res) => {
  return res.status(404).json({
    success: false,
    msg: 'Route not found',
  });
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  const status = error.name === 'MulterError'
    ? 400
    : error.message?.startsWith('Origin not allowed by CORS')
      ? 403
      : error.statusCode || 500;

  if (status >= 500) {
    console.error('Unhandled request error:', error);
  }

  return res.status(status).json({
    success: false,
    msg: status >= 500 ? 'Internal server error' : error.message,
  });
});

export default app;
