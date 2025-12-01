import mongoose from "mongoose";
import config from "config";
import { logger } from "./logger";

export async function connectDB(): Promise<void> {
  try {
    const DEFAULT_URI = config.get<string>("db.uri");
    const MONGO_URI = process.env.MONGO_URI || DEFAULT_URI;

    await mongoose.connect(MONGO_URI);

    logger.info(`MongoDB connected: ${MONGO_URI}`);
  } catch (error) {
    logger.error("MongoDB connection error:", error);
    process.exit(1);
  }
}

export async function disconnectDB(): Promise<void> {
  try {
    await mongoose.disconnect();
    logger.info("MongoDB disconnected");
  } catch (error) {
    logger.error("MongoDB disconnection error:", error);
  }
}

export async function clearDB(): Promise<void> {
  const { collections } = mongoose.connection;

  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
}