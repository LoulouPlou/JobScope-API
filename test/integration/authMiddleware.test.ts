import request from "supertest";
import app from "../../src/app";
import { setupIntegrationTestDB } from "./testUtils";

jest.setTimeout(90000);

setupIntegrationTestDB();

describe("Auth middleware integration", () => {
  it("lets optional auth routes proceed when the token is invalid", async () => {
    const res = await request(app)
      .get("/api/jobs/search")
      .set("Authorization", "Bearer invalid.token.value")
      .query({ limit: 1, page: 1 });

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.items)).toBe(true);
    expect(res.body.items.length).toBeGreaterThan(0);
  });

  it("rejects protected routes when the token is invalid", async () => {
    const res = await request(app)
      .get("/api/admin/users")
      .set("Authorization", "Bearer invalid.token.value");

    expect(res.status).toBe(401);
    expect(res.body.code).toBe("INVALID_TOKEN");
  });
});
