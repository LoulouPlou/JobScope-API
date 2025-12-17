import { JobModel } from "../models/job.model";
import { IJob } from "../interfaces/job.interface";
import { UserModel } from "../models/user.model";

interface PaginatedRespond<T> {
    items: T[];
    total: number;
    page: number;
    pages: number;
    limit: number;
}

export class JobService {
    static async searchJobs(query: any): Promise<PaginatedRespond<IJob>> {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const skip = (page - 1) * limit;

        const toArray = (value: unknown): string[] =>
            Array.isArray(value) ? value.map(String) : [String(value)];

        const filter: any = {};

        if (query.title) {
            filter.title = { $regex: query.title, $options: "i" };
        }

        if (query.company) {
            filter.company = { $regex: query.company, $options: "i" };
        }

        if (query.location) {
            filter.location = { $regex: query.location, $options: "i" };
        }

        if (query.skills) {
            const skills = toArray(query.skills).map((skill) => new RegExp(skill, "i"));
            filter.skills = { $in: skills };
        }

        if (query.jobType) {
            const jobTypes = toArray(query.jobType);
            filter.jobType = { $in: jobTypes };
        }

        if (query.experience) {
            const experiences = toArray(query.experience);
            filter.experience = { $in: experiences };
        }

        if (query.tags) {
            const tags = toArray(query.tags).map((tag) => new RegExp(tag, "i"));
            filter.tags = { $in: tags };
        }

        const [jobs, total] = await Promise.all([
            JobModel.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
            JobModel.countDocuments(filter),
        ]);

        return {
            items: jobs,
            total,
            page,
            pages: Math.ceil(total / limit),
            limit,
        };
    }

    static async getRecentJobs(): Promise<IJob[]> {
        return JobModel.find().sort({ createdAt: -1 }).limit(3);
    }

    static async getJobById(id: string): Promise<IJob> {
        const job = await JobModel.findById(id);

        if (!job) {
            const error: any = new Error("Job not found");
            error.status = 404;
            error.code = "JOB_NOT_FOUND";
            throw error;
        }

        return job;
    }

    static async getPersonalizedJobs(userId: string): Promise<IJob[]> {
        const user = await UserModel.findById(userId);

        if (!user || !user.interest) {
            return JobModel.find().sort({ createdAt: -1 }).limit(3);
        }
        const interest = user.interest;

        return JobModel.find({
            $or: [
                { skills: { $in: [new RegExp(interest, "i")] } },
                { tags: { $in: [new RegExp(interest, "i")] } },
                { title: { $regex: interest, $options: "i" } }
            ]
        })
            .sort({ createdAt: -1 })
            .limit(3);
    }
}
