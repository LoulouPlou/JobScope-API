import { Router } from "express";
import { JobController } from "../controllers/job.controller";

const router = Router();
const controller = new JobController();

router.get("/search", controller.searchJobs.bind(controller));

router.get("/recent", controller.getRecentJobs.bind(controller));

router.get("/:id", controller.getJobById.bind(controller));

export default router;