import { Router } from 'express';
import { JobController } from '../controllers/job.controller';
import { authenticate, optionalAuthenticate } from '../middleware/auth.middleware';

const router = Router();
const controller = new JobController();

router.get('/search', optionalAuthenticate, controller.searchJobs.bind(controller));

router.get('/recent', controller.getRecentJobs.bind(controller));

router.get('/personalized', authenticate, controller.getJobPersonalized.bind(controller));

router.get('/:id', optionalAuthenticate, controller.getJobById.bind(controller));

export default router;
