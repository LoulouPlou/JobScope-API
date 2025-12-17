import request from "supertest";
import app from "../../src/app";
import { setupIntegrationTestDB, createAuthenticatedUser } from "./testUtils";
import { UserModel } from "../../src/models/user.model";

jest.setTimeout(90000);

setupIntegrationTestDB();

describe("User profile", () => {
  it("returns the authenticated user profile", async () => {
    const { token, user } = await createAuthenticatedUser();

    const res = await request(app)
      .get("/api/users/profile")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.email).toBe(user?.email);
    expect(res.body.password).toBe("");
  });

  it("updates profile data while keeping immutable fields intact", async () => {
    const { token, user } = await createAuthenticatedUser();

    const res = await request(app)
      .put("/api/users/profile")
      .set("Authorization", `Bearer ${token}`)
      .send({
        biography: "I love building APIs.",
        interest: "Node.js",
        email: "ignored-change@example.com",
      });

    expect(res.status).toBe(200);
    expect(res.body.biography).toBe("I love building APIs.");
    expect(res.body.interest).toBe("Node.js");
    expect(res.body.email).toBe(user?.email);
  });
});

describe("User lifecycle edge cases", () => {
  it("returns 404 when the token references a deleted user", async () => {
    const { token, user } = await createAuthenticatedUser();

    await UserModel.deleteOne({ _id: user?._id });

    const res = await request(app)
      .get("/api/users/profile")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.code).toBe("USER_NOT_FOUND");
  });
});
