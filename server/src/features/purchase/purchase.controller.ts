import { Request, Response, NextFunction } from 'express';
import purchaseService from './purchase.service';
import { ResponseHandler } from '@/shared/utils/response';

export class PurchaseController {
    // ============================================
    // PURCHASE ORDER ENDPOINTS
    // ============================================

    /**
     * GET /api/purchase-orders
     * Get all purchase orders with filters
     */
    async getAllPurchaseOrders(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await purchaseService.getAllPurchaseOrders(req.query as any);
            return ResponseHandler.success(res, 'Purchase orders retrieved successfully', result);
        } catch (error) {
            return next(error);
        }
    }

    /**
     * GET /api/purchase-orders/pending
     * Get pending purchase orders
     */
    async getPendingOrders(_req: Request, res: Response, next: NextFunction) {
        try {
            const orders = await purchaseService.getPendingOrders();
            return ResponseHandler.success(res, 'Pending orders retrieved successfully', orders);
        } catch (error) {
            return next(error);
        }
    }

    /**
     * GET /api/purchase-orders/:id
     * Get purchase order by ID
     */
    async getPurchaseOrderById(req: Request, res: Response, next: NextFunction) {
        try {
            const purchaseOrderId = parseInt(req.params['id'] || '0');
            const order = await purchaseService.getPurchaseOrderById(purchaseOrderId);
            return ResponseHandler.success(res, 'Purchase order retrieved successfully', order);
        } catch (error) {
            return next(error);
        }
    }

    /**
     * GET /api/purchase-orders/number/:orderNumber
     * Get purchase order by order number
     */
    async getPurchaseOrderByNumber(req: Request, res: Response, next: NextFunction) {
        try {
            const orderNumber = req.params['orderNumber'] || '';
            const order = await purchaseService.getPurchaseOrderByNumber(orderNumber);
            return ResponseHandler.success(res, 'Purchase order retrieved successfully', order);
        } catch (error) {
            return next(error);
        }
    }

    /**
     * POST /api/purchase-orders
     * Create new purchase order
     */
    async createPurchaseOrder(req: Request, res: Response, next: NextFunction) {
        try {
            const staffId = (req as any).user?.staffId || 1; // Get from auth middleware
            const order = await purchaseService.createPurchaseOrder(req.body, staffId);
            return ResponseHandler.created(res, 'Purchase order created successfully', order);
        } catch (error) {
            return next(error);
        }
    }

    /**
     * PATCH /api/purchase-orders/:id
     * Update purchase order
     */
    async updatePurchaseOrder(req: Request, res: Response, next: NextFunction) {
        try {
            const purchaseOrderId = parseInt(req.params['id'] || '0');
            const order = await purchaseService.updatePurchaseOrder(purchaseOrderId, req.body);
            return ResponseHandler.success(res, 'Purchase order updated successfully', order);
        } catch (error) {
            return next(error);
        }
    }

    /**
     * POST /api/purchase-orders/:id/receive
     * Receive purchase order
     */
    async receivePurchaseOrder(req: Request, res: Response, next: NextFunction) {
        try {
            const purchaseOrderId = parseInt(req.params['id'] || '0');
            const staffId = (req as any).user?.staffId || 1; // Get from auth middleware
            const order = await purchaseService.receivePurchaseOrder(
                purchaseOrderId,
                req.body,
                staffId
            );
            return ResponseHandler.success(res, 'Purchase order received successfully', order);
        } catch (error) {
            return next(error);
        }
    }

    /**
     * POST /api/purchase-orders/:id/cancel
     * Cancel purchase order
     */
    async cancelPurchaseOrder(req: Request, res: Response, next: NextFunction) {
        try {
            const purchaseOrderId = parseInt(req.params['id'] || '0');
            const order = await purchaseService.cancelPurchaseOrder(purchaseOrderId);
            return ResponseHandler.success(res, 'Purchase order cancelled successfully', order);
        } catch (error) {
            return next(error);
        }
    }

    /**
     * DELETE /api/purchase-orders/:id
     * Delete purchase order
     */
    async deletePurchaseOrder(req: Request, res: Response, next: NextFunction) {
        try {
            const purchaseOrderId = parseInt(req.params['id'] || '0');
            await purchaseService.deletePurchaseOrder(purchaseOrderId);
            return ResponseHandler.success(res, 'Purchase order deleted successfully');
        } catch (error) {
            return next(error);
        }
    }

    // ============================================
    // SUPPLIER ENDPOINTS
    // ============================================

    /**
     * GET /api/suppliers
     * Get all suppliers with filters
     */
    async getAllSuppliers(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await purchaseService.getAllSuppliers(req.query as any);
            return ResponseHandler.success(res, 'Suppliers retrieved successfully', result);
        } catch (error) {
            return next(error);
        }
    }

    /**
     * GET /api/suppliers/active
     * Get active suppliers
     */
    async getActiveSuppliers(_req: Request, res: Response, next: NextFunction) {
        try {
            const suppliers = await purchaseService.getActiveSuppliers();
            return ResponseHandler.success(res, 'Active suppliers retrieved successfully', suppliers);
        } catch (error) {
            return next(error);
        }
    }

    /**
     * GET /api/suppliers/:id
     * Get supplier by ID
     */
    async getSupplierById(req: Request, res: Response, next: NextFunction) {
        try {
            const supplierId = parseInt(req.params['id'] || '0');
            const supplier = await purchaseService.getSupplierById(supplierId);
            return ResponseHandler.success(res, 'Supplier retrieved successfully', supplier);
        } catch (error) {
            return next(error);
        }
    }

    /**
     * POST /api/suppliers
     * Create new supplier
     */
    async createSupplier(req: Request, res: Response, next: NextFunction) {
        try {
            const supplier = await purchaseService.createSupplier(req.body);
            return ResponseHandler.created(res, 'Supplier created successfully', supplier);
        } catch (error) {
            return next(error);
        }
    }

    /**
     * PATCH /api/suppliers/:id
     * Update supplier
     */
    async updateSupplier(req: Request, res: Response, next: NextFunction) {
        try {
            const supplierId = parseInt(req.params['id'] || '0');
            const supplier = await purchaseService.updateSupplier(supplierId, req.body);
            return ResponseHandler.success(res, 'Supplier updated successfully', supplier);
        } catch (error) {
            return next(error);
        }
    }

    /**
     * DELETE /api/suppliers/:id
     * Delete supplier
     */
    async deleteSupplier(req: Request, res: Response, next: NextFunction) {
        try {
            const supplierId = parseInt(req.params['id'] || '0');
            await purchaseService.deleteSupplier(supplierId);
            return ResponseHandler.success(res, 'Supplier deleted successfully');
        } catch (error) {
            return next(error);
        }
    }
}

export default new PurchaseController();
