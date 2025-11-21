import { createLogger, format, transports } from "winston";
import path from "path";
import fs from "fs";

const logsDir = path.join(__dirname, "../../logs");

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logFormat = format.printf(({ level, message, timestamp, ...meta }) => {
  const metaString = Object.keys(meta).length ? JSON.stringify(meta) : "";
  return `[${timestamp}] ${level.toUpperCase()}: ${message} ${metaString}`;
});

export const logger = createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.errors({ stack: true }),
    logFormat
  ),
  transports: [
    new transports.File({
      filename: path.join(logsDir, "error.log"),
      level: "error",
    }),
    new transports.File({ filename: path.join(logsDir, "combined.log") }),
    new transports.Console({
      format: format.combine(format.colorize(), logFormat),
    }),
  ],
});