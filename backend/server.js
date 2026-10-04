import 'dotenv/config';
import http from 'http';
import mongoose from 'mongoose';
import app from './app.js';
import { connectToDB } from './db/db.js';
import { validateEnvironment } from './config/env.js';

const port = Number(process.env.PORT) || 3000;
const server = http.createServer(app);

const startServer = async () => {
  try {
    validateEnvironment();
    await connectToDB();

    server.listen(port, () => {
      console.log(`Server is listening on port ${port}`);
    });
  } catch (error) {
    console.error('Server failed to start:', error.message);
    process.exit(1);
  }
};

const shutdown = (signal) => {
  console.log(`${signal} received. Closing server...`);

  server.close(async (error) => {
    try {
      await mongoose.disconnect();
    } catch (disconnectError) {
      console.error('MongoDB disconnect failed:', disconnectError.message);
    }

    process.exit(error ? 1 : 0);
  });
};

process.once('SIGTERM', () => shutdown('SIGTERM'));
process.once('SIGINT', () => shutdown('SIGINT'));

void startServer();
