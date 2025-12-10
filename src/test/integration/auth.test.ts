import request from "supertest";
import app from "../../app";
import { setupIntegrationTestDB, createAuthenticatedUser, TEST_PASSWORD } from "./testUtils";

jest.setTimeout(90000);

setupIntegrationTestDB();

describe("Auth routes", () => {
  it("registers a new user and hides sensitive fields", async () => {
    const email = `new-${Date.now()}@mail.com`;

    const res = await request(app).post("/api/auth/register").send({
      email,
      password: TEST_PASSWORD,
      firstName: "New",
      lastName: "User",
    });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      email,
      role: "user",
      firstName: "New",
      lastName: "User",
    });
    expect(res.body.password).toBeUndefined();
  });

  it("rejects login with invalid credentials", async () => {
    const email = `invalid-${Date.now()}@mail.com`;

    await request(app).post("/api/auth/register").send({
      email,
      password: TEST_PASSWORD,
      firstName: "Wrong",
      lastName: "Password",
    });

    const res = await request(app).post("/api/auth/login").send({
      email,
      password: "NotTheRightPass1",
    });

    expect(res.status).toBe(401);
    expect(res.body.code).toBe("INVALID_CREDENTIALS");
  });

  it("logs out successfully", async () => {
    const { token } = await createAuthenticatedUser();

    const res = await request(app)
      .post("/api/auth/logout")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Logged out successfully.");
  });
});
