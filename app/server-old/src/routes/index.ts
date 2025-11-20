import { Router } from 'express';
import authRoutes from '../features/auth/auth.routes';
import orderRoutes from '../features/order/order.routes';
import billRoutes from '../features/bill/bill.routes';
import categoryRoutes from '../features/category/category.routes';
import menuRoutes from '../features/menu/menu.routes';
import tableRoutes from '../features/table/table.routes';
import reservationRoutes from '../features/reservation/reservation.routes';
import kitchenRoutes from '../features/kitchen/kitchen.routes';
import staffRoutes from '../features/staff/staff.routes';
import paymentRoutes from '../features/payment/payment.routes';
import storageRoutes from '../features/storage/storage.routes';
import floorPlanRoutes from '../features/floor-plan/floor-plan.routes';
import customerRoutes from '../features/customer/customer.routes';
import DatabaseClient from '@/config/database';

const router: Router = Router();

// API Routes
router.use('/auth', authRoutes);
router.use('/orders', orderRoutes);
router.use('/bills', billRoutes);
router.use('/categories', categoryRoutes);
router.use('/menu', menuRoutes);
router.use('/tables', tableRoutes);
router.use('/floor-plans', floorPlanRoutes);
router.use('/reservations', reservationRoutes);
router.use('/kitchen', kitchenRoutes);
router.use('/staff', staffRoutes);
router.use('/payments', paymentRoutes);
router.use('/storage', storageRoutes);
router.use('/customers', customerRoutes);

// Enhanced health check endpoint for production monitoring
router.get('/health', async (_req, res) => {
    const health: {
        status: 'healthy' | 'unhealthy';
        uptime: number;
        timestamp: string;
        environment: string;
        services: {
            database: string;
        };
    } = {
        status: 'healthy',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        environment: process.env['NODE_ENV'] || 'development',
        services: {
            database: 'unknown',
        },
    };

    try {
        // Check database connection
        await DatabaseClient.getInstance().$queryRaw`SELECT 1`;
        health.services.database = 'healthy';
    } catch (error) {
        health.services.database = 'unhealthy';
        health.status = 'unhealthy';
    }

    const statusCode = health.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(health);
});

export default router;

