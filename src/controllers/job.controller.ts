import { Request, Response, NextFunction } from "express";
import { JobService } from "../services/job.service";
import { AuthRequest } from "../middleware/auth.middleware";

export class JobController {
    //GET /api/jobs/search + Search jobs with filters + pagination
    async searchJobs(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const jobs = await JobService.searchJobs(req.query);
            res.json(jobs);
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

            const job = await JobService.getJobById(id);
            res.json(job);
        } catch (err) {
            next(err);
        }
    }

    async getJobPersonnalized(req: AuthRequest , res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?._id;
            const jobs = await JobService.getPersonalizedJobs(String(userId));
            res.json(jobs);
        } catch (err) {
            next(err);
        }
    }
}
