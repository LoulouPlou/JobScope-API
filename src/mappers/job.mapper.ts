import { IJob } from "../interfaces/job.interface";
import { IJobInfo, IJobDetails } from "../dto/job.dto";

export class JobMapper {
  static toJobInfo(job: IJob, isFavorite: boolean = false): IJobInfo {
    return {
      _id: job._id.toString(),
      title: job.title,
      company: job.company,
      location: job.location,
      jobType: job.jobType,
      tags: job.tags,
      publishedTime: job.publishedTime,
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
      education: job.education,
      description: job.description,
      skills: job.skills,
      tags: job.tags,
      salary: job.salary,
      postedOn: job.postedOn,
      publishedTime: job.publishedTime,
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
