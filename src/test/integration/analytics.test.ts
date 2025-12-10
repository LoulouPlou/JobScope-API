// import request from "supertest";
// import app from "../../app";
// import { setupIntegrationTestDB } from "./testUtils";

// jest.setTimeout(30000);

// setupIntegrationTestDB();

// describe("Analytics", () => {
//   it("returns the most common skills breakdown", async () => {
//     const res = await request(app).get("/api/analytics/top-skills");

//     expect(res.status).toBe(200);
//     expect(res.body.length).toBeGreaterThan(0);
//     expect(res.body[0]).toHaveProperty("skill");
//     expect(res.body[0]).toHaveProperty("count");
//   });

//   it("lists most demanded jobs with skill counts", async () => {
//     const res = await request(app).get("/api/analytics/most-demanded");

//     expect(res.status).toBe(200);
//     expect(res.body.length).toBeGreaterThan(0);
//     expect(res.body[0]).toHaveProperty("skillsCount");
//   });

//   it("groups jobs by location", async () => {
//     const res = await request(app).get("/api/analytics/jobs-by-location");

//     expect(res.status).toBe(200);
//     expect(res.body.length).toBeGreaterThan(0);
//     expect(res.body[0]).toHaveProperty("location");
//     expect(res.body[0]).toHaveProperty("count");
//   });
// });
