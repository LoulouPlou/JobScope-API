import request from "supertest";
import app from "../../app";
import { connectDB, disconnectDB, clearDB } from "../../utils/database";
import { seedDatabase } from "../../data/seed";
import { UserModel } from "../../models/user.model";
import mongoose from "mongoose";
import config from "config";

export const TEST_PASSWORD = "Password123!";

type Role = "user" | "admin";

let logSpy: jest.SpyInstance | null = null;
let errorSpy: jest.SpyInstance | null = null;

export function setupIntegrationTestDB(options: { muteConsole?: boolean } = {}): void {
  const { muteConsole = true } = options;

  beforeAll(async () => {
    const baseUri =
      process.env.MONGO_URI || config.get<string>("db.uri") || "mongodb://localhost:27017/jobscope_test";
    const workerId = process.env.JEST_WORKER_ID || "1";
    process.env.MONGO_URI = baseUri.replace(
      /([^/?]+)(\?.*)?$/,
      (_match, dbName: string, query: string = "") => `${dbName}_${workerId}${query}`
    );

    if (muteConsole) {
      logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
      errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    }
    await connectDB();
  });

  beforeEach(async () => {
    if (mongoose.connection.db) {
      await mongoose.connection.db.dropDatabase();
    } else {
      await clearDB();
    }
    await seedDatabase();
  });

  afterAll(async () => {
    await disconnectDB();
    logSpy?.mockRestore();
    errorSpy?.mockRestore();
  });
}

export async function createAuthenticatedUser(role: Role = "user") {
  const email = `test-${role}-${Date.now()}@example.com`;

  const registerRes = await request(app).post("/api/auth/register").send({
    email,
    password: TEST_PASSWORD,
    firstName: "Test",
    lastName: role === "admin" ? "Admin" : "User",
  });

  expect(registerRes.status).toBe(201);

  if (role === "admin") {
    await UserModel.updateOne({ email }, { role: "admin" });
  }

  const loginRes = await request(app).post("/api/auth/login").send({
    email,
    password: TEST_PASSWORD,
  });

  const loginPayload = loginRes.body.token;
  const authToken = loginPayload?.token;

  if (loginRes.status !== 200 || typeof authToken !== "string") {
    throw new Error(
      `Login failed: status=${loginRes.status} body=${JSON.stringify(
        loginRes.body
      )}`
    );
  }

  const user = await UserModel.findOne({ email });

  return { token: authToken, user };
}
