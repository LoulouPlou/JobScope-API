import { Router } from "express";
import { AnalyticsController } from "../controllers/analytics.controller";

const router = Router();
const controller = new AnalyticsController();

router.get("/top-paying", controller.getTopPaying.bind(controller));

router.get("/most-demanded", controller.getMostDemanded.bind(controller));

router.get("/top-skills", controller.getMostCommonSkills.bind(controller));

router.get("/jobs-by-location", controller.getJobsByLocation.bind(controller));

export default router;