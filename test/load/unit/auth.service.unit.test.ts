import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import config from "config";
import { AuthService } from "../../../src/services/auth.service";
import { UserModel } from "../../../src/models/user.model";

jest.mock("../../../src/models/user.model");
jest.mock("bcryptjs");
jest.mock("jsonwebtoken");
jest.mock("config");

describe("AuthService", () => {

  // register()
  test("register , success", async () => {
    (UserModel.findOne as jest.Mock).mockResolvedValue(null);
    (bcrypt.hash as jest.Mock).mockResolvedValue("hashed");
    (config.get as jest.Mock).mockReturnValue(10);
    (UserModel.create as jest.Mock).mockResolvedValue({ email: "a@test.com" });

    const result = await AuthService.register({
      email: "a@test.com",
      password: "123",
      firstName: "A",
      lastName: "B",
    });

    expect(result.email).toBe("a@test.com");
  });

  test("register , USER_EXISTS", async () => {
    (UserModel.findOne as jest.Mock).mockResolvedValue({});

    await expect(
      AuthService.register({} as any)
    ).rejects.toMatchObject({ code: "USER_EXISTS" });
  });

  // login()
  test("login ,success", async () => {
    (UserModel.findOne as jest.Mock).mockResolvedValue({
      _id: "1",
      email: "a@test.com",
      password: "hashed",
      role: "user",
    });

    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (config.get as jest.Mock).mockReturnValue("secret");
    (jwt.sign as jest.Mock).mockReturnValue("token");

    const result = await AuthService.login({
      email: "a@test.com",
      password: "123",
    });

    expect(result.token).toBe("token");
  });

  test("login , INVALID_CREDENTIALS (no user)", async () => {
    (UserModel.findOne as jest.Mock).mockResolvedValue(null);

    await expect(
      AuthService.login({} as any)
    ).rejects.toMatchObject({ code: "INVALID_CREDENTIALS" });
  });

  test("login ,INVALID_CREDENTIALS (bad password)", async () => {
    (UserModel.findOne as jest.Mock).mockResolvedValue({ password: "x" });
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(
      AuthService.login({} as any)
    ).rejects.toMatchObject({ code: "INVALID_CREDENTIALS" });
  });

  test("login , JWT secret missing", async () => {
    (UserModel.findOne as jest.Mock).mockResolvedValue({ password: "x", role: "user" });
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (config.get as jest.Mock).mockReturnValue(null);

    await expect(
      AuthService.login({} as any)
    ).rejects.toThrow();
  });

  // logOut()
  test("logOut , resolve", async () => {
    await expect(AuthService.logOut()).resolves.toBeUndefined();
  });

  // sanitizeUser()
  test("sanitizeUser , no password", () => {
    const result = AuthService.sanitizeUser({
      email: "a@test.com",
      password: "secret",
    });

    expect((result as any).password).toBeUndefined();
  });
});
