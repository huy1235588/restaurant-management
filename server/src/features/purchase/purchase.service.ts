import purchaseOrderRepository from './purchase.repository';
import supplierRepository from './supplier.repository';
import ingredientRepository from '../ingredient/ingredient.repository';
import { prisma } from '@/config/database';
import { NotFoundError, BadRequestError } from '@/shared/utils/errors';
import {
    CreatePurchaseOrderDto,
    UpdatePurchaseOrderDto,
    ReceivePurchaseOrderDto,
    PurchaseOrderQueryDto,
} from '@/features/purchase/dtos/purchase-order.dto';
import {
    CreateSupplierDto,
    UpdateSupplierDto,
    SupplierQueryDto,
} from '@/features/purchase/dtos/supplier.dto';

export class PurchaseService {
    // ============================================
    // PURCHASE ORDER MANAGEMENT
    // ============================================

    /**
     * Get all purchase orders with filters
     */
    async getAllPurchaseOrders(query: PurchaseOrderQueryDto) {
        const { page = 1, limit = 20, ...filters } = query;
        return purchaseOrderRepository.findAll(filters, page, limit);
    }

    /**
     * Get purchase order by ID
     */
    async getPurchaseOrderById(purchaseOrderId: number) {
        const order = await purchaseOrderRepository.findById(purchaseOrderId);

        if (!order) {
            throw new NotFoundError('Purchase order not found');
        }

        return order;
    }

    /**
     * Get purchase order by order number
     */
    async getPurchaseOrderByNumber(orderNumber: string) {
        const order = await purchaseOrderRepository.findByOrderNumber(orderNumber);

        if (!order) {
            throw new NotFoundError('Purchase order not found');
        }

        return order;
    }

    /**
     * Create new purchase order
     */
    async createPurchaseOrder(data: CreatePurchaseOrderDto, staffId: number) {
        // Verify supplier exists
        const supplier = await supplierRepository.findById(data.supplierId);
        if (!supplier) {
            throw new NotFoundError('Supplier not found');
        }

        // Verify all ingredients exist
        for (const item of data.items) {
            const ingredient = await ingredientRepository.findById(item.ingredientId);
            if (!ingredient) {
                throw new NotFoundError(`Ingredient with ID ${item.ingredientId} not found`);
            }
        }

        // Calculate totals
        const subtotal = data.items.reduce(
            (sum, item) => sum + item.quantity * item.unitPrice,
            0
        );
        const taxAmount = 0; // Can be calculated based on business rules
        const totalAmount = subtotal + taxAmount;

        // Create purchase order with items
        return prisma.purchaseOrder.create({
            data: {
                supplier: { connect: { supplierId: data.supplierId } },
                staff: { connect: { staffId } },
                expectedDate: data.expectedDate ? new Date(data.expectedDate) : undefined,
                notes: data.notes,
                subtotal,
                taxAmount,
                totalAmount,
                status: 'pending',
                items: {
                    create: data.items.map((item) => ({
                        ingredient: { connect: { ingredientId: item.ingredientId } },
                        quantity: item.quantity,
                        unit: item.unit,
                        unitPrice: item.unitPrice,
                        subtotal: item.quantity * item.unitPrice,
                    })),
                },
            },
            include: {
                supplier: true,
                staff: true,
                items: {
                    include: {
                        ingredient: true,
                    },
                },
            },
        });
    }

    /**
     * Update purchase order
     */
    async updatePurchaseOrder(
        purchaseOrderId: number,
        data: UpdatePurchaseOrderDto
    ) {
        const order = await purchaseOrderRepository.findById(purchaseOrderId);

        if (!order) {
            throw new NotFoundError('Purchase order not found');
        }

        // Can only update if status is pending or ordered
        if (order.status === 'received' || order.status === 'cancelled') {
            throw new BadRequestError(
                `Cannot update purchase order with status: ${order.status}`
            );
        }

        // Verify supplier if provided
        if (data.supplierId) {
            const supplier = await supplierRepository.findById(data.supplierId);
            if (!supplier) {
                throw new NotFoundError('Supplier not found');
            }
        }

        const updateData: any = {
            expectedDate: data.expectedDate ? new Date(data.expectedDate) : undefined,
            notes: data.notes,
            status: data.status,
        };

        if (data.supplierId) {
            updateData.supplier = { connect: { supplierId: data.supplierId } };
        }

        return purchaseOrderRepository.update(purchaseOrderId, updateData);
    }

    /**
     * Receive purchase order
     */
    async receivePurchaseOrder(
        purchaseOrderId: number,
        data: ReceivePurchaseOrderDto,
        staffId: number
    ) {
        const order = await purchaseOrderRepository.findById(purchaseOrderId);

        if (!order) {
            throw new NotFoundError('Purchase order not found');
        }

        if (order.status === 'received') {
            throw new BadRequestError('Purchase order already received');
        }

        if (order.status === 'cancelled') {
            throw new BadRequestError('Cannot receive cancelled purchase order');
        }

        // Use transaction to ensure data consistency
        return prisma.$transaction(async (tx) => {
            // Update purchase order status
            const updatedOrder = await tx.purchaseOrder.update({
                where: { purchaseOrderId },
                data: {
                    status: 'received',
                    receivedDate: data.receivedDate ? new Date(data.receivedDate) : new Date(),
                },
                include: {
                    supplier: true,
                    items: {
                        include: {
                            ingredient: true,
                        },
                    },
                },
            });

            // Update received quantities and create batches
            for (const item of data.items) {
                // Update purchase order item
                await tx.purchaseOrderItem.update({
                    where: { itemId: item.itemId },
                    data: {
                        receivedQuantity: item.receivedQuantity,
                    },
                });

                // Get the purchase order item to get ingredient info
                const poItem = await tx.purchaseOrderItem.findUnique({
                    where: { itemId: item.itemId },
                    include: { ingredient: true },
                });

                if (!poItem) continue;

                // Create ingredient batch
                await tx.ingredientBatch.create({
                    data: {
                        ingredient: { connect: { ingredientId: poItem.ingredientId } },
                        purchaseOrder: { connect: { purchaseOrderId } },
                        batchNumber: item.batchNumber,
                        quantity: item.receivedQuantity,
                        remainingQuantity: item.receivedQuantity,
                        unit: poItem.unit,
                        unitCost: poItem.unitPrice,
                        expiryDate: item.expiryDate ? new Date(item.expiryDate) : undefined,
                        receivedDate: data.receivedDate ? new Date(data.receivedDate) : new Date(),
                    },
                });

                // Update ingredient current stock
                await tx.ingredient.update({
                    where: { ingredientId: poItem.ingredientId },
                    data: {
                        currentStock: {
                            increment: item.receivedQuantity,
                        },
                    },
                });

                // Create stock transaction
                await tx.stockTransaction.create({
                    data: {
                        ingredient: { connect: { ingredientId: poItem.ingredientId } },
                        transactionType: 'in',
                        quantity: item.receivedQuantity,
                        unit: poItem.unit,
                        referenceType: 'purchase_order',
                        referenceId: purchaseOrderId,
                        staff: { connect: { staffId } },
                        notes: `Received from PO: ${updatedOrder.orderNumber}`,
                    },
                });

                // Check and resolve low stock alerts
                const ingredient = await tx.ingredient.findUnique({
                    where: { ingredientId: poItem.ingredientId },
                });

                if (ingredient && ingredient.currentStock >= ingredient.minimumStock) {
                    await tx.stockAlert.updateMany({
                        where: {
                            ingredientId: poItem.ingredientId,
                            alertType: 'low_stock',
                            isResolved: false,
                        },
                        data: {
                            isResolved: true,
                            resolvedAt: new Date(),
                            resolvedBy: staffId,
                        },
                    });
                }
            }

            return updatedOrder;
        });
    }

    /**
     * Cancel purchase order
     */
    async cancelPurchaseOrder(purchaseOrderId: number) {
        const order = await purchaseOrderRepository.findById(purchaseOrderId);

        if (!order) {
            throw new NotFoundError('Purchase order not found');
        }

        if (order.status === 'received') {
            throw new BadRequestError('Cannot cancel received purchase order');
        }

        if (order.status === 'cancelled') {
            throw new BadRequestError('Purchase order already cancelled');
        }

        return purchaseOrderRepository.update(purchaseOrderId, {
            status: 'cancelled',
        });
    }

    /**
     * Delete purchase order
     */
    async deletePurchaseOrder(purchaseOrderId: number) {
        const order = await purchaseOrderRepository.findById(purchaseOrderId);

        if (!order) {
            throw new NotFoundError('Purchase order not found');
        }

        // Can only delete pending orders
        if (order.status !== 'pending') {
            throw new BadRequestError(
                'Can only delete purchase orders with pending status'
            );
        }

        return purchaseOrderRepository.delete(purchaseOrderId);
    }

    /**
     * Get pending purchase orders
     */
    async getPendingOrders() {
        return purchaseOrderRepository.findPending();
    }

    // ============================================
    // SUPPLIER MANAGEMENT
    // ============================================

    /**
     * Get all suppliers with filters
     */
    async getAllSuppliers(query: SupplierQueryDto) {
        const { page = 1, limit = 20, ...filters } = query;
        return supplierRepository.findAll(filters, page, limit);
    }

    /**
     * Get supplier by ID
     */
    async getSupplierById(supplierId: number) {
        const supplier = await supplierRepository.findById(supplierId);

        if (!supplier) {
            throw new NotFoundError('Supplier not found');
        }

        return supplier;
    }

    /**
     * Create new supplier
     */
    async createSupplier(data: CreateSupplierDto) {
        // Check if supplier code already exists
        const existingSupplier = await supplierRepository.findByCode(
            data.supplierCode
        );

        if (existingSupplier) {
            throw new BadRequestError('Supplier code already exists');
        }

        return supplierRepository.create(data);
    }

    /**
     * Update supplier
     */
    async updateSupplier(supplierId: number, data: UpdateSupplierDto) {
        const supplier = await supplierRepository.findById(supplierId);

        if (!supplier) {
            throw new NotFoundError('Supplier not found');
        }

        // Check if new code already exists
        if (data.supplierCode && data.supplierCode !== supplier.supplierCode) {
            const existingSupplier = await supplierRepository.findByCode(
                data.supplierCode
            );

            if (existingSupplier) {
                throw new BadRequestError('Supplier code already exists');
            }
        }

        return supplierRepository.update(supplierId, data);
    }

    /**
     * Delete supplier
     */
    async deleteSupplier(supplierId: number) {
        const supplier = await supplierRepository.findById(supplierId);

        if (!supplier) {
            throw new NotFoundError('Supplier not found');
        }

        // Check if supplier has purchase orders
        if (supplier._count.purchaseOrders > 0) {
            throw new BadRequestError(
                'Cannot delete supplier with existing purchase orders'
            );
        }

        return supplierRepository.delete(supplierId);
    }

    /**
     * Get active suppliers
     */
    async getActiveSuppliers() {
        return supplierRepository.findActive();
    }
}

export default new PurchaseService();
