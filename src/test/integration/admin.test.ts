import request from "supertest";
import mongoose from "mongoose";
import app from "../../app";
import { setupIntegrationTestDB, createAuthenticatedUser, TEST_PASSWORD } from "./testUtils";
import { UserModel } from "../../models/user.model";

jest.setTimeout(30000);

setupIntegrationTestDB();

describe("Admin protections", () => {
  it("blocks non-admin users from admin routes", async () => {
    const { token } = await createAuthenticatedUser();

    const res = await request(app)
      .get("/api/admin/users")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.code).toBe("FORBIDDEN");
  });

  it("allows admins to list users with pagination", async () => {
    const { token } = await createAuthenticatedUser("admin");

    const res = await request(app)
      .get("/api/admin/users")
      .query({ limit: 2, page: 1 })
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      page: 1,
      limit: 2,
    });
    expect(Array.isArray(res.body.items)).toBe(true);
    expect(res.body.items.length).toBeGreaterThan(0);
  });

  it("allows admins to update user details", async () => {
    const { token } = await createAuthenticatedUser("admin");
    const targetUser = await UserModel.findOne({ role: "user" });

    const res = await request(app)
      .put(`/api/admin/users/${targetUser?._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ firstName: "Updated" });

    expect(res.status).toBe(200);
    expect(res.body.firstName).toBe("Updated");
  });

  it("deletes a user account as admin", async () => {
    const { token } = await createAuthenticatedUser("admin");
    const email = `delete-${Date.now()}@mail.com`;

    await request(app).post("/api/auth/register").send({
      email,
      password: TEST_PASSWORD,
      firstName: "Delete",
      lastName: "Me",
    });

    const target = await UserModel.findOne({ email });

    const res = await request(app)
      .delete(`/api/admin/users/${target?._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(204);
    const deleted = await UserModel.findById(target?._id);
    expect(deleted).toBeNull();
  });

  it("rejects admin attempts to change user passwords", async () => {
    const { token } = await createAuthenticatedUser("admin");
    const targetUser = await UserModel.findOne({ role: "user" });

    const res = await request(app)
      .put(`/api/admin/users/${targetUser?._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ password: "NewPassword123" });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe("PASSWORD_UPDATE_FORBIDDEN");
  });

  it("returns 404 when deleting an unknown user", async () => {
    const { token } = await createAuthenticatedUser("admin");

    const res = await request(app)
      .delete(`/api/admin/users/${new mongoose.Types.ObjectId()}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.code).toBe("USER_NOT_FOUND");
  });

  it("returns user info by id for admins", async () => {
    const { token } = await createAuthenticatedUser("admin");
    const targetUser = await UserModel.findOne({ role: "user" });

    const res = await request(app)
      .get(`/api/admin/users/${targetUser?._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.email).toBe(targetUser?.email);
  });
});
