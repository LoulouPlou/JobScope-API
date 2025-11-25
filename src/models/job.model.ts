import mongoose, { Schema, Model } from "mongoose";
import { IJob } from "../interfaces/job.interface";

const jobSchema = new Schema<IJob>(
    {
        title: {
            type: String,
            required: true,
            trim: true

        },
        company: {
            type: String,
            required: true,
            trim: true

        },
        location: {
            type: String,
            required: true,
            trim: true

        },

        jobType: {
            type: String,
            trim: true

        },
        experience: {
            type: String,
            trim: true

        },

        education: {
            type: String,
            required: true,
            trim: true

        },

        languages: [{ type: String }],

        shortDescription: {
            type: String,
            required: true,
            trim: true,
            minlength: 1,
        },

        description: {
            type: String,
            required: true,
            trim: true,
            minlength: 1,
        },

        skills: {
            type: [String],
            required: true,
        },

        tags: {
            type: [String],
            validate: {
                validator: function (arr: string[] | undefined) {
                    return !arr || arr.length === 3;
                },
                message: "tags must contain exactly 3 items",
            }
        },

        salary: {
            type: String, trim: true

        },
        postedOn: {
            type: String, trim: true

        },
        publishedTime: {
            type: String, trim: true

        },
    },
    {
        timestamps: true
    }
);

// Indexes
jobSchema.index({ company: 1 });
jobSchema.index({ location: 1 });
jobSchema.index({ skills: 1 });

export const JobModel: Model<IJob> = mongoose.model<IJob>(
    "Job",
    jobSchema
);
