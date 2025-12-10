import { Request, Response, NextFunction } from "express";
import { JobService } from "../services/job.service";
import { AuthRequest } from "../middleware/auth.middleware";

export class JobController {
    //GET /api/jobs/search + Search jobs with filters + pagination
    async searchJobs(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { title, jobType, experience, page = 1, limit = 10 } = req.query;

            // Get userId if authenticated
            const userId = (req as AuthRequest).user?._id;

            const filters: any = {};

            // job title
            if (title) {
                filters.title = String(title);
            }

            // job type (array or single)
            if (jobType) {
                if (Array.isArray(jobType)) {
                    filters.jobType = jobType;
                } else {
                    filters.jobType = [String(jobType)];
                }
            }

            // experience (array or single)
            if (experience) {
                if (Array.isArray(experience)) {
                    filters.experience = experience;
                } else {
                    filters.experience = [String(experience)];
                }
            }

            const result = await JobService.searchJobs(
                filters,
                Number(page),
                Number(limit),
                userId ? String(userId) : undefined
            );

            res.json(result);
        } catch (err) {
            next(err);
        }
    }

    // GET /api/jobs/recent + Get 3 most recent jobs
    async getRecentJobs(_req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const jobs = await JobService.getRecentJobs();

            res.json(jobs);
        } catch (err) {
            next(err);
        }
    }

    // GET /api/jobs/:id + Get job details by ID
    async getJobById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;

            if (!id) {
                res.status(400).json({ error: "Job ID is required." });
                return;
            }

            const userId = (req as AuthRequest).user?._id;

            const job = await JobService.getJobById(id, userId ? String(userId) : undefined);
            res.json(job);
        } catch (err) {
            next(err);
        }
    }

    async getJobPersonalized(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?._id;

            if (!userId) {
                res.status(401).json({
                    error: "Unauthorized. Please login to get personalized jobs."
                });
                return;
            }

            const jobs = await JobService.getPersonalizedJobs(String(userId));
            res.json(jobs);
        } catch (err) {
            next(err);
        }
    }
}
