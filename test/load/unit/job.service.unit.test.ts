import { JobService } from "../../../src/services/job.service";
import { JobModel } from "../../../src/models/job.model";
import { UserModel } from "../../../src/models/user.model";

jest.mock("../../../src/models/job.model");
jest.mock("../../../src/models/user.model");

describe("JobService Unit Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  
  // searchJobs()
  test("searchJobs , empty query (NO FILTERS)", async () => {
    (JobModel.find as jest.Mock).mockReturnValue({
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      sort: jest.fn().mockResolvedValue([]),
    });

    (JobModel.countDocuments as jest.Mock).mockResolvedValue(0);

    const result = await JobService.searchJobs({});

    expect(result.items).toEqual([]);
    expect(result.total).toBe(0);
    expect(result.pages).toBe(0);
  });

  test("searchJobs , with filters", async () => {
    (JobModel.find as jest.Mock).mockReturnValue({
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      sort: jest.fn().mockResolvedValue([{ title: "Dev" }]),
    });

    (JobModel.countDocuments as jest.Mock).mockResolvedValue(1);

    const result = await JobService.searchJobs({
      title: "Dev",
      company: "ACME",
      location: "MTL",
      skills: "JS",
      jobType: "Full-time",
    });

    expect(result.items.length).toBe(1);
    expect(result.total).toBe(1);
  });

  // getPersonalizedJobs()
  test("getPersonalizedJobs , user NOT FOUND", async () => {
    (UserModel.findById as jest.Mock).mockResolvedValue(null);

    (JobModel.find as jest.Mock).mockReturnValue({
      sort: jest.fn().mockReturnValue({
        limit: jest.fn().mockResolvedValue([{}, {}, {}]),
      }),
    });

    const result = await JobService.getPersonalizedJobs("1");
    expect(result.length).toBe(3);
  });

  test("getPersonalizedJobs , user WITHOUT interest", async () => {
    (UserModel.findById as jest.Mock).mockResolvedValue({});

    (JobModel.find as jest.Mock).mockReturnValue({
      sort: jest.fn().mockReturnValue({
        limit: jest.fn().mockResolvedValue([{}, {}, {}]),
      }),
    });

    const result = await JobService.getPersonalizedJobs("1");
    expect(result.length).toBe(3);
  });

  test("getPersonalizedJobs , user WITH interest", async () => {
    (UserModel.findById as jest.Mock).mockResolvedValue({ interest: "java" });

    (JobModel.find as jest.Mock).mockReturnValue({
      sort: jest.fn().mockReturnValue({
        limit: jest.fn().mockResolvedValue([{ title: "Java Dev" }]),
      }),
    });

    const result = await JobService.getPersonalizedJobs("1");

    expect(result[0].title).toBe("Java Dev");
  });
});
