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
import ingredientRoutes from '../features/ingredient/ingredient.routes';
import purchaseRoutes from '../features/purchase/purchase.routes';
import stockRoutes from '../features/stock/stock.routes';
import storageRoutes from '../features/storage/storage.routes';
import floorPlanRoutes from '../features/floor-plan/floor-plan.routes';

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
router.use('/ingredients', ingredientRoutes);
router.use('/purchase-orders', purchaseRoutes);
router.use('/suppliers', purchaseRoutes);
router.use('/stock', stockRoutes);
router.use('/storage', storageRoutes);

// Health check
router.get('/health', (_req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
    });
});

export default router;

