import { JobModel } from "../models/job.model";
import { FavoriteModel } from "../models/favorite.model";
import { UserModel } from "../models/user.model";
import { IJobInfo, IJobDetails } from "../dto/job.dto";
import { JobMapper } from "../mappers/job.mapper";
import { FavoriteService } from "./favorite.service";

interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    pages: number;
    limit: number;
}

interface SearchFilters {
    title?: string;
    jobType?: string[]; //checkbox form in FE
    experience?: string[]; //checkbox form in FE
}

export class JobService {
    static async searchJobs(
        filters: SearchFilters,
        page: number = 1,
        limit: number = 10,
        userId?: string
    ): Promise<PaginatedResponse<IJobInfo>> {
        const skip = (page - 1) * limit;

        const filter: any = {};

        if (filters.title) {
            filter.title = { $regex: filters.title, $options: "i" };
        }

        if (filters.jobType && filters.jobType.length > 0) {
            filter.jobType = { $in: filters.jobType };
        }

        if (filters.experience && filters.experience.length > 0) {
            filter.experience = { $in: filters.experience };
        }

        const [jobs, total] = await Promise.all([
            JobModel.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
            JobModel.countDocuments(filter),
        ]);

        // if auth, get user's favorite job IDs, else empty
        let favoriteJobIds: Set<string>;

        if (userId) {
            favoriteJobIds = await FavoriteService.getUserFavoriteJobIds(userId);
        } else {
            favoriteJobIds = new Set<string>();
        }

        // convert to DTO with isFavorite (empty will return false)
        const jobInfos = JobMapper.toJobInfoList(jobs, favoriteJobIds);

        return {
            items: jobInfos,
            total,
            page,
            pages: Math.ceil(total / limit),
            limit,
        };
    }

    static async getJobById(id: string, userId?: string): Promise<IJobDetails> {
        const job = await JobModel.findById(id);

        if (!job) {
            const error: any = new Error("Job not found");
            error.status = 404;
            error.code = "JOB_NOT_FOUND";
            throw error;
        }

        // isFavorite?
        const isFavorite = userId
            ? await FavoriteModel.exists({ userId, jobId: id })
            : false;

        return JobMapper.toJobDetails(job, !!isFavorite);
    }

    // if not auth, get recent jobs instead of personnalized
    static async getRecentJobs(): Promise<IJobInfo[]> {
        const jobs = await JobModel.find().sort({ publishedTime: -1 }).limit(3);

        return JobMapper.toJobInfoList(jobs, new Set<string>());
    }

    static async getPersonalizedJobs(userId: string): Promise<IJobInfo[]> {
        const user = await UserModel.findById(userId);

        // fallback: if no user or no interests, return recent jobs
        if (!user || !user.interest) {
            return this.getRecentJobs();
        }

        const interest = user.interest;

        const jobs = await JobModel.find({
            $or: [
                { skills: { $in: [new RegExp(interest, "i")] } },
                { title: { $regex: interest, $options: "i" } },
            ],
        })
            .sort({ publishedTime: -1 })
            .limit(3);

        // fallback: if no personalized jobs found, return recent jobs
        if (jobs.length === 0) {
            return this.getRecentJobs();
        }

        const favoriteJobIds = await FavoriteService.getUserFavoriteJobIds(userId);

        return JobMapper.toJobInfoList(jobs, favoriteJobIds);
    }
}
