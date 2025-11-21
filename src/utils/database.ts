import mongoose from "mongoose";
import config from "config";
import { logger } from "./logger";

export async function connectDB(): Promise<void> {
  try {
    const mongoUri = config.get<string>("db.uri");

    await mongoose.connect(mongoUri);

    logger.info(`MongoDB connected: ${mongoUri}`);
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