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
});