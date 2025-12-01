
export interface IJob {
    title: string;
    company: string;
    location: string;

    jobType?: string;
    experience?: string;

    education: string;
    languages?: string[];

    shortDescription: string;
    description: string;

    skills: string[];
    tags?: [string, string, string];

    salary?: string;
    postedOn?: string;
    publishedTime?: string;

    createdAt?: Date;
    updatedAt?: Date;
}