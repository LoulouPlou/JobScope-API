import { JobController } from "../../src/controllers/job.controller";
import { JobService } from "../../src/services/job.service";

jest.mock("../../src/services/job.service");

const mockRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("JobController", () => {
  const controller = new JobController();
  const next = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("searchJobs delegates to service", async () => {
    const req: any = { query: { title: "Dev" } };
    const res = mockRes();
    (JobService.searchJobs as jest.Mock).mockResolvedValue({ items: [] });

    await controller.searchJobs(req, res, next);

    expect(JobService.searchJobs).toHaveBeenCalledWith(req.query);
    expect(res.json).toHaveBeenCalledWith({ items: [] });
  });

  it("getRecentJobs returns latest jobs", async () => {
    const req: any = {};
    const res = mockRes();
    (JobService.getRecentJobs as jest.Mock).mockResolvedValue([{ title: "A" }]);

    await controller.getRecentJobs(req, res, next);

    expect(JobService.getRecentJobs).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith([{ title: "A" }]);
  });

  it("getJobById validates id presence", async () => {
    const reqMissing: any = { params: {} };
    const resMissing = mockRes();

    await controller.getJobById(reqMissing, resMissing, next);

    expect(resMissing.status).toHaveBeenCalledWith(400);
    expect(resMissing.json).toHaveBeenCalledWith({ error: "Job ID is required." });
    expect(JobService.getJobById).not.toHaveBeenCalled();
  });

  it("getJobById returns job when id provided", async () => {
    const req: any = { params: { id: "1" } };
    const res = mockRes();
    (JobService.getJobById as jest.Mock).mockResolvedValue({ _id: "1" });

    await controller.getJobById(req, res, next);

    expect(JobService.getJobById).toHaveBeenCalledWith("1");
    expect(res.json).toHaveBeenCalledWith({ _id: "1" });
  });

  it("getJobPersonnalized uses auth user id", async () => {
    const req: any = { user: { _id: "user123" } };
    const res = mockRes();
    (JobService.getPersonalizedJobs as jest.Mock).mockResolvedValue([{ title: "P" }]);

    await controller.getJobPersonnalized(req, res, next);

    expect(JobService.getPersonalizedJobs).toHaveBeenCalledWith("user123");
    expect(res.json).toHaveBeenCalledWith([{ title: "P" }]);
  });
});
