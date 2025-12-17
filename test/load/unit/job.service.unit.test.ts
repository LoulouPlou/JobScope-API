import { JobService } from "../../../src/services/job.service";
import { JobModel } from "../../../src/models/job.model";
import { UserModel } from "../../../src/models/user.model";

jest.mock("../../../src/models/job.model");
jest.mock("../../../src/models/user.model");

describe("JobService Unit Tests", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // =========================
  // searchJobs()
  // =========================
  test("searchJobs, should return paginated job results", async () => {
    const mockJobs = [{ title: "Dev" }];

    (JobModel.find as jest.Mock).mockReturnValue({
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      sort: jest.fn().mockResolvedValue(mockJobs),
    });

    (JobModel.countDocuments as jest.Mock).mockResolvedValue(1);

    const result = await JobService.searchJobs({
      page: 1,
      limit: 10,
      title: "Dev",
    });

    expect(JobModel.find).toHaveBeenCalled();
    expect(result.items).toHaveLength(1);
    expect(result.page).toBe(1);
    expect(result.total).toBe(1);
    expect(result.pages).toBe(1);
  });

  // =========================
  // getRecentJobs()
  // =========================
  test("getRecentJobs, should return 3 most recent jobs", async () => {
    (JobModel.find as jest.Mock).mockReturnValue({
      sort: jest.fn().mockReturnValue({
        limit: jest.fn().mockResolvedValue([{}, {}, {}]),
      }),
    });

    const result = await JobService.getRecentJobs();

    expect(JobModel.find).toHaveBeenCalled();
    expect(result).toHaveLength(3);
  });

  // =========================
  // getJobById()
  // =========================
  test("getJobById, should return a job", async () => {
    const mockJob = { title: "Backend Developer" };

    (JobModel.findById as jest.Mock).mockResolvedValue(mockJob);

    const result = await JobService.getJobById("1");

    expect(JobModel.findById).toHaveBeenCalledWith("1");
    expect(result).toEqual(mockJob);
  });

  test("getJobById, should throw JOB_NOT_FOUND", async () => {
    (JobModel.findById as jest.Mock).mockResolvedValue(null);

    await expect(JobService.getJobById("999")).rejects.toMatchObject({
      message: "Job not found",
      code: "JOB_NOT_FOUND",
    });
  });

  // =========================
  // getPersonalizedJobs()
  // =========================
  test("getPersonalizedJobs, no interest → return recent jobs", async () => {
    (UserModel.findById as jest.Mock).mockResolvedValue(null);

    (JobModel.find as jest.Mock).mockReturnValue({
      sort: jest.fn().mockReturnValue({
        limit: jest.fn().mockResolvedValue([{}, {}, {}]),
      }),
    });

    const result = await JobService.getPersonalizedJobs("1");

    expect(result).toHaveLength(3);
  });

  test("getPersonalizedJobs, with interest → return personalized jobs", async () => {
    (UserModel.findById as jest.Mock).mockResolvedValue({
      interest: "java",
    });

    (JobModel.find as jest.Mock).mockReturnValue({
      sort: jest.fn().mockReturnValue({
        limit: jest.fn().mockResolvedValue([{ title: "Java Dev" }]),
      }),
    });

    const result = await JobService.getPersonalizedJobs("1");

    expect(JobModel.find).toHaveBeenCalled();
    expect(result[0].title).toBe("Java Dev");
  });
});
