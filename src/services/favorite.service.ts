import { FavoriteModel } from "../models/favorite.model";
import { JobModel } from "../models/job.model";
import { IFavorite } from "../interfaces/favorite.interface";
import { JobMapper } from "../mappers/job.mapper";

interface PaginationOptions {
    page?: number;
    limit?: number;
}

export class FavoriteService {
    static async getUserFavorites(userId: string, options: PaginationOptions = {}): Promise<{
        items: any[];
        total: number;
        page: number;
        limit: number;
    }> {
        const page = options.page && options.page > 0 ? options.page : 1;
        const limit = options.limit && options.limit > 0 ? options.limit : 10;
        const skip = (page - 1) * limit;

        const [favorites, total] = await Promise.all([
            FavoriteModel.find({ userId })
                .populate("jobId")
                .sort({ savedAt: -1 })
                .skip(skip)
                .limit(limit),
            FavoriteModel.countDocuments({ userId }),
        ]);

        const items = favorites
            .filter((fav) => fav.jobId)
            .map((fav) => JobMapper.toJobInfo(fav.jobId as any, true));

        return { items, total, page, limit };
    }

    static async addFavorite(userId: string, jobId: string): Promise<IFavorite> {
        // Check if job exists
        const job = await JobModel.findById(jobId);
        if (!job) {
            const error: any = new Error("Job not found");
            error.status = 404;
            error.code = "JOB_NOT_FOUND";
            throw error;
        }

        // Check if already in favorites
        const existing = await FavoriteModel.findOne({ userId, jobId });
        if (existing) {
            const error: any = new Error("Job already in favorites");
            error.status = 400;
            error.code = "FAVORITE_ALREADY_EXISTS";
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
            const error: any = new Error("Favorite not found");
            error.status = 404;
            error.code = "FAVORITE_NOT_FOUND";
            throw error;
        }
    }
}
