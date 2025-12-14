import dotenv from 'dotenv';
import path from 'path';
import { connectDB, clearDB, disconnectDB } from '../../src/utils/database';

export async function setupTestDB() {
  dotenv.config({ path: path.resolve(process.cwd(), '.env.test') });

  process.env.NODE_ENV = 'test';

  await connectDB();
}

export async function cleanupTestDB() {
  await clearDB();
}

export async function teardownTestDB() {
  await disconnectDB();
}
