import { Router } from "express";
import { AnalyticsController } from "../controllers/analytics.controller";

const router = Router();
const controller = new AnalyticsController();

router.get('/dashboard/overview', controller.getOverviewDashboard.bind(controller));

router.get('/dashboard/domain/:domain', controller.getDomainDashboard.bind(controller));

export default router;