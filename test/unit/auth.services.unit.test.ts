import { AuthService } from "../../src/services/auth.service";
import { UserModel } from "../../src/models/user.model";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import config from "config";

jest.mock("../../src/models/user.model");
jest.mock("bcryptjs");
jest.mock("jsonwebtoken");
jest.mock("config");

describe("AuthService Unit Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("register success", async () => {
    (UserModel.findOne as jest.Mock).mockResolvedValue(null);
    (bcrypt.hash as jest.Mock).mockResolvedValue("hashed");
    (config.get as jest.Mock).mockReturnValue(10);

    (UserModel.create as jest.Mock).mockResolvedValue({
      email: "test@test.com",
      role: "user",
    });

    const result = await AuthService.register({
      email: "test@test.com",
      password: "123456",
      firstName: "Test",
      lastName: "User",
    });

    expect(result.email).toBe("test@test.com");
  });

  test("register USER_EXISTS", async () => {
    (UserModel.findOne as jest.Mock).mockResolvedValue({ email: "test@test.com" });

    await expect(
      AuthService.register({
        email: "test@test.com",
        password: "123",
        firstName: "Test",
        lastName: "User",
      })
    ).rejects.toMatchObject({ code: "USER_EXISTS" });
  });

  test("login USER_NOT_FOUND", async () => {
    (UserModel.findOne as jest.Mock).mockResolvedValue(null);

    await expect(
      AuthService.login({ email: "x@test.com", password: "123" })
    ).rejects.toMatchObject({ code: "INVALID_CREDENTIALS" });
  });

  test("login INVALID_PASSWORD", async () => {
    (UserModel.findOne as jest.Mock).mockResolvedValue({
      password: "hashed",
    });

    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(
      AuthService.login({ email: "test@test.com", password: "wrong" })
    ).rejects.toMatchObject({ code: "INVALID_CREDENTIALS" });
  });

  test("login JWT_SECRET_MISSING", async () => {
    (UserModel.findOne as jest.Mock).mockResolvedValue({
      _id: "1",
      email: "test@test.com",
      password: "hashed",
      role: "user",
    });

    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    (config.get as jest.Mock).mockImplementation((key: string) => {
      if (key === "security.jwt.secret") return undefined;
      if (key === "security.jwt.expiresIn") return "1d";
      return null;
    });

    await expect(
      AuthService.login({ email: "test@test.com", password: "123" })
    ).rejects.toThrow("JWT secret is not configured");
  });

  test("login success", async () => {
    (UserModel.findOne as jest.Mock).mockResolvedValue({
      _id: "1",
      email: "test@test.com",
      password: "hashed",
      role: "user",
    });

    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (jwt.sign as jest.Mock).mockReturnValue("token");

    (config.get as jest.Mock).mockImplementation((key: string) => {
      if (key === "security.jwt.secret") return "secret";
      if (key === "security.jwt.expiresIn") return "1d";
      return null;
    });

    const result = await AuthService.login({
      email: "test@test.com",
      password: "123",
    });

    expect(result.token).toBe("token");
    expect(result.user.email).toBe("test@test.com");
  });
});