import { AnalyticsService } from "../../services/analytics.service";
import { JobModel } from "../../models/job.model";

jest.mock("../../../src/models/job.model");

describe("AnalyticsService", () => {

  // getMostDemandedJobs()
  test("getMostDemandedJobs, success", async () => {
    (JobModel.aggregate as jest.Mock).mockResolvedValue([{ title: "Dev" }]);

    const result = await AnalyticsService.getMostDemandedJobs();
    expect(result.length).toBe(1);
  });

  // getMostCommonSkills()
  test("getMostCommonSkills, success", async () => {
    (JobModel.aggregate as jest.Mock).mockResolvedValue([
      { _id: "JS", count: 5 }
    ]);

    const result = await AnalyticsService.getMostCommonSkills();
    expect(result[0]).toEqual({ skill: "JS", count: 5 });
  });

  // getJobsByLocation()
  test("getJobsByLocation, success", async () => {
    (JobModel.aggregate as jest.Mock).mockResolvedValue([
      { _id: "Canada", count: 3 }
    ]);

    const result = await AnalyticsService.getJobsByLocation();
    expect(result[0]).toEqual({ location: "Canada", count: 3 });
  });

  // getTopPayingJobs()
  test("getTopPayingJobs, null", async () => {
    const result = await AnalyticsService.getTopPayingJobs();
    expect(result).toBeNull();
  });
});
