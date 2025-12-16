import { IJob } from "../interfaces/job.interface";
import { IJobInfo, IJobDetails } from "../dto/job.dto";

export class JobMapper {

  // returns "x days ago" instead of Date to frontend
  private static timeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();

    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    return "just now";
  }

  static toJobInfo(job: IJob, isFavorite: boolean = false): IJobInfo {
    return {
      _id: job._id.toString(),
      title: job.title,
      company: job.company,
      location: job.location,
      jobType: job.jobType,
      tags: job.tags,
      publishedTime: job.publishedTime ? this.timeAgo(job.publishedTime) : undefined,
      isFavorite,
    };
  }

  static toJobDetails(job: IJob, isFavorite: boolean = false): IJobDetails {
    return {
      _id: job._id.toString(),
      title: job.title,
      company: job.company,
      location: job.location,
      jobType: job.jobType,
      experience: job.experience,
      description: job.description,
      skills: job.skills,
      tags: job.tags,
      salary: job.salary,
      postedOn: job.postedOn,
      publishedTime: job.publishedTime ? this.timeAgo(job.publishedTime) : undefined,
      isFavorite,
    };
  }

  static toJobInfoList(jobs: IJob[], favoriteJobIds: Set<string>): IJobInfo[] {
    return jobs.map((job) =>
      this.toJobInfo(job, favoriteJobIds.has(job._id.toString()))
    );
  }

  static toJobDetailsList(jobs: IJob[], favoriteJobIds: Set<string>): IJobDetails[] {
    return jobs.map((job) =>
      this.toJobDetails(job, favoriteJobIds.has(job._id.toString()))
    );
  }
}