import { JobModel } from "../models/job.model";
import { IJob } from "../interfaces/job.interface";

interface TopSkill {
    skill: string;
    count: number;
}

interface JobsByLocation {
    location: string;
    count: number;
}

export class AnalyticsService {
    static async getTopPayingJobs(): Promise<IJob[]> {
        const jobs = await JobModel.aggregate([
            {
                $match: {
                    salary: { $exists: true, $ne: null }
                }
            },
            {
                $addFields: {
                    numericSalary: {
                        $toDouble: {
                            $replaceAll: { input: "$salary", find: "$", replacement: "" }
                        }
                    }
                }
            },
            { $sort: { numericSalary: -1 } },
            { $limit: 5 }
        ]);

        return jobs;
    }

    static async getMostDemandedJobs(): Promise<IJob[]> {
        const jobs = await JobModel.aggregate([
            {
                $project: {
                    title: 1,
                    company: 1,
                    skills: 1,
                    location: 1,
                    shortDescription: 1,
                    jobType: 1,
                    createdAt: 1,
                    skillsCount: { $size: "$skills" }
                }
            },
            { $sort: { skillsCount: -1 } },
            { $limit: 5 }
        ]);

        return jobs;
    }

    static async getMostCommonSkills(): Promise<TopSkill[]> {
        const result = await JobModel.aggregate([
            { $unwind: "$skills" },
            {
                $group: {
                    _id: "$skills",
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        return result.map((item) => ({
            skill: item._id,
            count: item.count
        }));
    }

    static async getJobsByLocation(): Promise<JobsByLocation[]> {
        const result = await JobModel.aggregate([
            {
                $group: {
                    _id: "$location",
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);

        return result.map((item) => ({
            location: item._id,
            count: item.count
        }));
    }
}
