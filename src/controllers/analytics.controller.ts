import { Request, Response, NextFunction } from "express";
import { AnalyticsService } from "../services/analytics.service";

export class AnalyticsController {

    async getTopPaying(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const topPayingJobs = await AnalyticsService.getTopPayingJobs();
            res.status(200).json(topPayingJobs);
        } catch (error) {
            next(error);
        }
    }

    async getMostDemanded(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const mostDemandedJobs = await AnalyticsService.getMostDemandedJobs();
            res.status(200).json(mostDemandedJobs);
        } catch (error) {
            next(error);
        }
    }

    async getMostCommonSkills(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const mostCommonSkills = await AnalyticsService.getMostCommonSkills();
            res.status(200).json(mostCommonSkills);
        } catch (error) {
            next(error);
        }
    }

    async getJobsByLocation(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const jobsByLocation = await AnalyticsService.getJobsByLocation();
            res.status(200).json(jobsByLocation);
        } catch (error) {
            next(error);
        }
    }
}