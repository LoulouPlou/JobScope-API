import { Router } from "express";
import { JobController } from "../controllers/job.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();
const controller = new JobController();

router.get("/search", controller.searchJobs.bind(controller));

router.get("/recent", controller.getRecentJobs.bind(controller));

router.get("/personalized", authenticate, controller.getJobPersonnalized.bind(controller));

router.get("/:id", controller.getJobById.bind(controller));

export default router;
