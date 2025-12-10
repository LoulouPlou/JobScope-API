import request from "supertest";
import mongoose from "mongoose";
import app from "../../app";
import { setupIntegrationTestDB } from "./testUtils";
import { JobModel } from "../../models/job.model";

jest.setTimeout(30000);

setupIntegrationTestDB();

describe("Job endpoints", () => {
  it("returns recent jobs from the seed data", async () => {
    const res = await request(app).get("/api/jobs/recent");

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(3);
    expect(res.body[0]).toHaveProperty("title");
  });

  // it("searches jobs with filters and pagination", async () => {
  //   const res = await request(app)
  //     .get("/api/jobs/search")
  //     .query({ skills: "React", limit: 2, page: 1 });

  //   expect(res.status).toBe(200);
  //   expect(Number(res.body.page)).toBe(1);
  //   expect(Number(res.body.limit)).toBe(2);
  //   expect(res.body.items.length).toBeGreaterThan(0);
  //   expect(res.body.items[0]).toHaveProperty("skills");
  // });

  it("returns job details by id and handles missing jobs", async () => {
    const job = await JobModel.findOne();

    const foundRes = await request(app).get(`/api/jobs/${job?._id}`);
    expect(foundRes.status).toBe(200);
    expect(foundRes.body.title).toBe(job?.title);

    const missingRes = await request(app).get(
      `/api/jobs/${new mongoose.Types.ObjectId()}`
    );
    expect(missingRes.status).toBe(404);
    expect(missingRes.body.code).toBe("JOB_NOT_FOUND");
  });

  // it("supports filtering by multiple fields", async () => {
  //   const res = await request(app)
  //     .get("/api/jobs/search")
  //     .query({
  //       title: "Developer",
  //       company: "Lightspeed",
  //       location: "Toronto",
  //       jobType: "Full-time",
  //     });

  //   expect(res.status).toBe(200);
  //   expect(res.body.items.length).toBeGreaterThan(0);
  // });
});
