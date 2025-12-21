import { Request, Response, NextFunction } from "express";
import { AnalyticsService } from "../services/analytics.service";
import { VALID_DOMAINS, isValidDomain } from '../constants/domains.constant';

export class AnalyticsController {
    async getOverviewDashboard(_req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const dashboard = await AnalyticsService.getOverviewDashboard();
            res.json(dashboard);
        } catch (error) {
            next(error);
        }
          
    }

    async getDomainDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { domain } = req.params;

            if (!domain) {
                res.status(400).json({
                    error: 'Domain parameter is required'
                });
                return;
            }

            if (!isValidDomain(domain)) {
                res.status(400).json({
                    error: `Invalid domain: ${domain}`,
                    code: "VALIDATION_ERROR",
                    validDomains: VALID_DOMAINS
                });
                return;
            }

            const dashboard = await AnalyticsService.getDomainDashboard(domain);
            res.json(dashboard);
        } catch (error) {
            next(error);
        }
    }
}