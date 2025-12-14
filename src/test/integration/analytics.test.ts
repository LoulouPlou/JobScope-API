import request from "supertest";
import app from "../../app";
import { setupIntegrationTestDB } from "./testUtils";
import { VALID_DOMAINS } from "../../constants/domains.constant";

jest.setTimeout(90000);

setupIntegrationTestDB();

describe("Analytics dashboards", () => {
  it("returns overview dashboard with charts", async () => {
    const res = await request(app).get("/api/analytics/dashboard/overview");

    expect(res.status).toBe(200);
    expect(res.body.dashboard).toBe("overview");
    expect(Array.isArray(res.body.charts)).toBe(true);
    expect(res.body.total).toBe(res.body.charts.length);
    if (res.body.charts.length > 0) {
      expect(res.body.charts[0]).toHaveProperty("type");
      expect(res.body.charts[0]).toHaveProperty("chart_type");
    }
  });

  it("returns domain dashboard even if charts are empty", async () => {
    const domain = VALID_DOMAINS[0];
    const res = await request(app).get(`/api/analytics/dashboard/domain/${domain}`);

    expect(res.status).toBe(200);
    expect(res.body.dashboard).toBe("domain");
    expect(res.body.domain).toBe(domain);
    expect(Array.isArray(res.body.charts)).toBe(true);
    expect(res.body.total).toBe(res.body.charts.length);
  });

  it("rejects invalid domain", async () => {
    const res = await request(app).get("/api/analytics/dashboard/domain/InvalidDomain");

    expect(res.status).toBe(400);
    expect(res.body.validDomains).toEqual(VALID_DOMAINS);
  });
});
