import { FavoriteService } from "../../services/favorite.service";
import { FavoriteModel } from "../../models/favorite.model";
import { JobModel } from "../../models/job.model";

jest.mock("../../../src/models/favorite.model");
jest.mock("../../../src/models/job.model");

describe("FavoriteService Unit Tests", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  //getUserFavorites()
  test("getUserFavorites,should return a list of favorites", async () => {
    const mockFavorites = [
      { userId: "1", jobId: "job1", savedAt: new Date() },
      { userId: "1", jobId: "job2", savedAt: new Date() },
    ];

    (FavoriteModel.find as jest.Mock).mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockResolvedValue(mockFavorites)
    });

    const result = await FavoriteService.getUserFavorites("1");

    expect(result).toHaveLength(2);
    expect(FavoriteModel.find).toHaveBeenCalledWith({ userId: "1" });
  });

  //addFavorite()
  test("addFavorite , should throw JOB_NOT_FOUND", async () => {
    (JobModel.findById as jest.Mock).mockResolvedValue(null);

    await expect(
      FavoriteService.addFavorite("1", "3")
    ).rejects.toMatchObject({
      message: "Job not found",
      code: "JOB_NOT_FOUND",
    });
  });

  test("addFavorite , should throw FAVORITE_ALREADY_EXISTS", async () => {
    (JobModel.findById as jest.Mock).mockResolvedValue({ id: "job1" });

    (FavoriteModel.findOne as jest.Mock).mockResolvedValue({
      userId: "1",
      jobId: "job1",
    });

    await expect(
      FavoriteService.addFavorite("1", "job1")
    ).rejects.toMatchObject({
      message: "Job already in favorites",
      code: "FAVORITE_ALREADY_EXISTS",
    });
  });

  test("addFavorite , should create and return a new favorite", async () => {
    const newFavorite = {
      userId: "1",
      jobId: "job1",
      savedAt: new Date()
    };

    (JobModel.findById as jest.Mock).mockResolvedValue({ _id: "job1" });
    (FavoriteModel.findOne as jest.Mock).mockResolvedValue(null);
    (FavoriteModel.create as jest.Mock).mockResolvedValue(newFavorite);

    const result = await FavoriteService.addFavorite("1", "job1");

    expect(result).toEqual(newFavorite);
    expect(FavoriteModel.create).toHaveBeenCalled();
  });

  //removeFavorite()
  test("removeFavorite, should throw FAVORITE_NOT_FOUND", async () => {
    (FavoriteModel.findOneAndDelete as jest.Mock).mockResolvedValue(null);

    await expect(
      FavoriteService.removeFavorite("1", "job1")
    ).rejects.toMatchObject({
      message: "Favorite not found",
      code: "FAVORITE_NOT_FOUND",
    });
  });

  test("removeFavorite, should delete a favorite successfully", async () => {
    (FavoriteModel.findOneAndDelete as jest.Mock).mockResolvedValue({
      userId: "1",
      jobId: "job1"
    });

    await expect(
      FavoriteService.removeFavorite("1", "job1")
    ).resolves.toBeUndefined();

    expect(FavoriteModel.findOneAndDelete).toHaveBeenCalledWith({
      userId: "1",
      jobId: "job1",
    });
  });
});
