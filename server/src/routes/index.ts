import { Router } from 'express';
import authRoutes from './auth.routes';
import orderRoutes from './order.routes';
import billRoutes from './bill.routes';
import categoryRoutes from './category.routes';
import menuRoutes from './menu.routes';
import tableRoutes from './table.routes';
import reservationRoutes from './reservation.routes';
import kitchenRoutes from './kitchen.routes';
import staffRoutes from './staff.routes';
import paymentRoutes from './payment.routes';

const router: Router = Router();

// API Routes
router.use('/auth', authRoutes);
router.use('/orders', orderRoutes);
router.use('/bills', billRoutes);
router.use('/categories', categoryRoutes);
router.use('/menu', menuRoutes);
router.use('/tables', tableRoutes);
router.use('/reservations', reservationRoutes);
router.use('/kitchen', kitchenRoutes);
router.use('/staff', staffRoutes);
router.use('/payments', paymentRoutes);

// Health check
router.get('/health', (_req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
    });
});

export default router;
