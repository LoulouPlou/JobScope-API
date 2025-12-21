import { FavoriteModel } from '../models/favorite.model';
import { JobModel } from '../models/job.model';
import { IFavorite } from '../interfaces/favorite.interface';
import { IJobInfo } from '../dto/job.dto';
import { JobMapper } from '../mappers/job.mapper';

interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
  limit: number;
}

export class FavoriteService {
  static async getUserFavoriteJobIds(userId: string): Promise<Set<string>> {
    const favorites = await FavoriteModel.find({ userId }).select('jobId');
    return new Set(favorites.map((fav) => fav.jobId.toString()));
  }

  static async getUserFavorites(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<IJobInfo>> {
    const skip = (page - 1) * limit;

    const [favorites, total] = await Promise.all([
      FavoriteModel.find({ userId })
        .populate('jobId')
        .sort({ savedAt: -1 })
        .skip(skip)
        .limit(limit),

      FavoriteModel.countDocuments({ userId }),
    ]);

    const jobIds = favorites.map((f) => f.jobId);

    const jobs = await JobModel.find({ _id: { $in: jobIds } });

    // all jobs are favorites
    const favoriteJobIds = new Set(jobs.map((job) => job._id.toString()));

    // convert to dto before returning
    const jobInfos = JobMapper.toJobInfoList(jobs, favoriteJobIds);

    return {
      items: jobInfos,
      total,
      page,
      pages: Math.ceil(total / limit),
      limit,
    };
  }

  static async addFavorite(userId: string, jobId: string): Promise<IFavorite> {
    // Check if job exists
    const job = await JobModel.findById(jobId);
    if (!job) {
      const error: any = new Error('Job not found');
      error.status = 404;
      error.code = 'JOB_NOT_FOUND';
      throw error;
    }

    // Check if already in favorites
    const existing = await FavoriteModel.findOne({ userId, jobId });
    if (existing) {
      const error: any = new Error('Job already in favorites');
      error.status = 400;
      error.code = 'FAVORITE_ALREADY_EXISTS';
      throw error;
    }
    const favorite = await FavoriteModel.create({
      userId,
      jobId,
      savedAt: new Date(),
    });

    return favorite;
  }

  static async removeFavorite(userId: string, jobId: string): Promise<void> {
    const result = await FavoriteModel.findOneAndDelete({ userId, jobId });
    if (!result) {
      const error: any = new Error('Favorite not found');
      error.status = 404;
      error.code = 'FAVORITE_NOT_FOUND';
      throw error;
    }
  }
}
