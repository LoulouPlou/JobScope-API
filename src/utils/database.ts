import mongoose from 'mongoose';
import config from 'config';
import { logger } from './logger';

export async function connectDB(retries: number = 15, delayMs: number = 3000): Promise<void> {
  const DEFAULT_URI = config.get<string>('db.uri');
  const MONGO_URI = process.env.MONGO_URI || DEFAULT_URI;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await mongoose.connect(MONGO_URI);
      logger.info(`MongoDB connected: ${MONGO_URI}`);
      return;
    } catch (error) {
      logger.error(`MongoDB connection error (attempt ${attempt}/${retries}):`, error);
      if (attempt === retries) {
        process.exit(1);
      }
      await new Promise((res) => setTimeout(res, delayMs));
    }
  }
}

export async function disconnectDB(): Promise<void> {
  try {
    await mongoose.disconnect();
    logger.info('MongoDB disconnected');
  } catch (error) {
    logger.error('MongoDB disconnection error:', error);
  }
}

export async function clearDB(): Promise<void> {
  const { collections } = mongoose.connection;

  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
}
