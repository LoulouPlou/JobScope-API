import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import adminRoutes from './admin.routes';
import favoriteRoutes from './favorite.routes';
import jobRoutes from './job.routes';
import analyticsRoutes from './analytics.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/admin', adminRoutes);
router.use('/favorites', favoriteRoutes);
router.use('/jobs', jobRoutes);
router.use('/analytics', analyticsRoutes);

export default router;
