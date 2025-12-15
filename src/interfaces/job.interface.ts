import { Types } from 'mongoose';

export interface IJob {
    _id: Types.ObjectId;
    title: string;
    company: string;
    location: string;

    jobType?: string;
    experience?: string;

    languages?: string[];
    description: string;

    skills: string[];
    tags?: string[];

    salary?: string;
    postedOn?: string;
    
    publishedTime: Date;

    createdAt?: Date;
    updatedAt?: Date;
}