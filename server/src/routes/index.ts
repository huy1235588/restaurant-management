import { Router } from 'express';
import authRoutes from './auth.routes';
import orderRoutes from './order.routes';
import billRoutes from './bill.routes';

const router: Router = Router();

// API Routes
router.use('/auth', authRoutes);
router.use('/orders', orderRoutes);
router.use('/bills', billRoutes);

// Health check
router.get('/health', (_req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
    });
});

export default router;
