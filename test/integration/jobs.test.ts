import request from "supertest";
import mongoose from "mongoose";
import app from "../../src/app";
import { setupIntegrationTestDB, createAuthenticatedUser } from "./testUtils";
import { JobModel } from "../../src/models/job.model";
import { UserModel } from "../../src/models/user.model";
import { JobService } from "../../src/services/job.service";

jest.setTimeout(90000);

setupIntegrationTestDB();

describe("Job endpoints", () => {
  it("returns recent jobs from the seed data", async () => {
    const res = await request(app).get("/api/jobs/recent");

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(3);
    expect(res.body[0]).toHaveProperty("title");
  });

  it("searches jobs with filters and pagination", async () => {
    const res = await request(app)
      .get("/api/jobs/search")
      .query({ title: "Developer", limit: 2, page: 1 });

    expect(res.status).toBe(200);
    expect(Number(res.body.page)).toBe(1);
    expect(Number(res.body.limit)).toBe(2);
    expect(res.body.items.length).toBeGreaterThan(0);
    expect(res.body.items[0]).toHaveProperty("title");
  });

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

  it("supports filtering by multiple fields", async () => {
    const res = await request(app)
      .get("/api/jobs/search")
      .query({
        title: "Developer",
        experience: ["Mid"],
        jobType: ["Full-time"],
      });

    expect(res.status).toBe(200);
    expect(res.body.items.length).toBeGreaterThan(0);
  });

  it("returns personalized jobs for authenticated users", async () => {
    const { token, user } = await createAuthenticatedUser();
    await UserModel.updateOne({ _id: user?._id }, { interest: "React" });

    const res = await request(app)
      .get("/api/jobs/personalized")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty("_id");
  });
});

describe("Job service behaviors", () => {
  it("filters by title at service layer", async () => {
    const result = await JobService.searchJobs({ title: "Developer" });
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.items[0].title).toMatch(/Developer/i);
  });

  it("filters by jobType array", async () => {
    const result = await JobService.searchJobs({ jobType: ["Full-time"] });
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.items[0].jobType).toBe("Full-time");
  });

  it("filters by experience array", async () => {
    const result = await JobService.searchJobs({ experience: ["Mid"] });
    expect(result.items.length).toBeGreaterThan(0);
    const details = await JobService.getJobById(result.items[0]._id.toString());
    expect(details.experience).toBe("Mid");
  });

  it("returns personalized jobs when user has interests", async () => {
    const user = await UserModel.findOne({ role: "user" });
    const jobs = await JobService.getPersonalizedJobs(String(user?._id));
    expect(jobs.length).toBeGreaterThan(0);
  });

  it("falls back to recent jobs when no interest", async () => {
    const admin = await UserModel.findOne({ role: "admin" });
    const jobs = await JobService.getPersonalizedJobs(String(admin?._id));
    expect(jobs.length).toBeGreaterThan(0);
  });
});
