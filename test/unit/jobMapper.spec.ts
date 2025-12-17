import mongoose from "mongoose";
import { JobMapper } from "../../src/mappers/job.mapper";
import { IJob } from "../../src/interfaces/job.interface";

describe("JobMapper timeAgo branches", () => {
    const baseJob = (publishedTime: Date): IJob => ({
        _id: new mongoose.Types.ObjectId(),
        title: "Developer",
        company: "TestCo",
        location: "Remote",
        description: "desc",
        skills: ["JS"],
        publishedTime,
    });

    it("formats days ago", () => {
        const job = baseJob(new Date(Date.now() - 4 * 24 * 60 * 60 * 1000));

        const result = JobMapper.toJobInfo(job);

        expect(result.publishedTime).toBe("4 days ago");
    });

    it("formats hours ago", () => {
        const job = baseJob(new Date(Date.now() - 3 * 60 * 60 * 1000));

        const result = JobMapper.toJobInfo(job);

        expect(result.publishedTime).toBe("3 hours ago");
    });

    it("formats minutes ago", () => {
        const job = baseJob(new Date(Date.now() - 10 * 60 * 1000));

        const result = JobMapper.toJobInfo(job);

        expect(result.publishedTime).toBe("10 minutes ago");
    });

    it("formats just now", () => {
        const job = baseJob(new Date(Date.now() - 10 * 1000));

        const result = JobMapper.toJobInfo(job);

        expect(result.publishedTime).toBe("just now");
    });

    it("maps to job details including favorites", () => {
        const job: IJob = {
            _id: new mongoose.Types.ObjectId(),
            title: "Backend Dev",
            company: "FavCo",
            location: "Remote",
            description: "desc",
            skills: ["TS"],
            tags: ["node"],
            jobType: "Full-time",
            experience: "Senior",
            salary: "$100k",
            postedOn: "2024-10-01",
            publishedTime: new Date(),
        };

        const details = JobMapper.toJobDetails(job, true);

        expect(details.isFavorite).toBe(true);
        expect(details.tags).toContain("node");
        expect(details.salary).toBe("$100k");
    });

    it("maps lists and marks favorites", () => {
        const jobs = [
            baseJob(new Date()),
            baseJob(new Date()),
        ];
        const favorites = new Set<string>([jobs[1]._id.toString()]);

        const infos = JobMapper.toJobInfoList(jobs, favorites);
        const details = JobMapper.toJobDetailsList(jobs, favorites);

        expect(infos[0].isFavorite).toBe(false);
        expect(infos[1].isFavorite).toBe(true);
        expect(details[1].isFavorite).toBe(true);
    });
});
