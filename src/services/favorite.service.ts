import { FavoriteModel } from "../models/favorite.model";
import { JobModel } from "../models/job.model";
import { IFavorite } from "../interfaces/favorite.interface";

export class FavoriteService {
    static async getUserFavorites(userId: string): Promise<IFavorite[]> {
        const favorites = await FavoriteModel.find({ userId })
            .populate("jobId") // optional: if you want full job details
            .sort({ savedAt: -1 });

        return favorites;
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
