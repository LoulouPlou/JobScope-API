import request from "supertest";
import app from "../../app";
import { setupIntegrationTestDB, createAuthenticatedUser } from "./testUtils";
import { JobModel } from "../../models/job.model";

jest.setTimeout(30000);

setupIntegrationTestDB();

describe("Favorites", () => {
  it("requires authentication to access favorites", async () => {
    const res = await request(app).get("/api/favorites");

    expect(res.status).toBe(401);
    expect(res.body.code).toBe("AUTH_REQUIRED");
  });

  it("adds and removes a favorite job for the user", async () => {
    const { token, user } = await createAuthenticatedUser();
    const job = await JobModel.findOne();

    const addRes = await request(app)
      .post(`/api/favorites/${job?._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(addRes.status).toBe(201);
    expect(addRes.body.userId).toBe(String(user?._id));
    expect(addRes.body.jobId).toBe(String(job?._id));

    const removeRes = await request(app)
      .delete(`/api/favorites/${job?._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(removeRes.status).toBe(204);
  });

  it("prevents adding the same job to favorites twice", async () => {
    const { token } = await createAuthenticatedUser();
    const job = await JobModel.findOne();

    await request(app)
      .post(`/api/favorites/${job?._id}`)
      .set("Authorization", `Bearer ${token}`);

    const duplicateRes = await request(app)
      .post(`/api/favorites/${job?._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(duplicateRes.status).toBe(400);
    expect(duplicateRes.body.code).toBe("FAVORITE_ALREADY_EXISTS");
  });

  it("returns 404 when removing a non-existent favorite", async () => {
    const { token } = await createAuthenticatedUser();
    const job = await JobModel.findOne();

    const res = await request(app)
      .delete(`/api/favorites/${job?._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.code).toBe("FAVORITE_NOT_FOUND");
  });

  // it("lists favorites for the authenticated user", async () => {
  //   const { token } = await createAuthenticatedUser();
  //   const job = await JobModel.findOne();

  //   await request(app)
  //     .post(`/api/favorites/${job?._id}`)
  //     .set("Authorization", `Bearer ${token}`);

  //   const res = await request(app)
  //     .get("/api/favorites")
  //     .set("Authorization", `Bearer ${token}`);

  //   expect(res.status).toBe(200);
  //   expect(res.body.length).toBe(1);
  //   const returnedJobId = res.body[0].jobId._id || res.body[0].jobId;
  //   expect(returnedJobId).toBe(String(job?._id));
  // });
});
