import { PrismaService } from '@/database/prisma.service';
import {
    MenuItemNotFoundException,
    MenuItemNotAvailableException,
    MenuItemNotActiveException,
} from '../exceptions/order.exceptions';
import { OrderItemStatus } from '@/lib/prisma';

/**
 * Order Validation Helper
 * Provides reusable validation logic for order operations
 */
export class OrderValidationHelper {
    /**
     * Validate and prepare order items
     * Checks menu item existence, availability, and calculates prices
     */
    static async validateAndPrepareOrderItems(
        prisma: PrismaService,
        items: Array<{
            itemId: number;
            quantity: number;
            specialRequest?: string;
        }>,
    ): Promise<
        Array<{
            itemId: number;
            quantity: number;
            unitPrice: number;
            totalPrice: number;
            specialRequest: string | null;
            status: OrderItemStatus;
        }>
    > {
        // Batch fetch all menu items in single query
        const itemIds = items.map((item) => item.itemId);
        const menuItems = await prisma.menuItem.findMany({
            where: {
                itemId: { in: itemIds },
            },
            select: {
                itemId: true,
                itemName: true,
                price: true,
                isAvailable: true,
                isActive: true,
            },
        });

        // Create lookup map for O(1) access
        const menuItemMap = new Map(
            menuItems.map((item) => [item.itemId, item]),
        );

        // Validate and prepare order items
        const orderItems: Array<{
            itemId: number;
            quantity: number;
            unitPrice: number;
            totalPrice: number;
            specialRequest: string | null;
            status: OrderItemStatus;
        }> = [];

        for (const item of items) {
            const menuItem = menuItemMap.get(item.itemId);

            if (!menuItem) {
                throw new MenuItemNotFoundException(item.itemId);
            }

            if (!menuItem.isAvailable) {
                throw new MenuItemNotAvailableException(menuItem.itemName);
            }

            if (!menuItem.isActive) {
                throw new MenuItemNotActiveException(menuItem.itemName);
            }

            const unitPrice = Number(menuItem.price);
            const totalPrice = unitPrice * item.quantity;

            orderItems.push({
                itemId: item.itemId,
                quantity: item.quantity,
                unitPrice,
                totalPrice,
                specialRequest: item.specialRequest ?? null,
                status: OrderItemStatus.pending,
            });
        }

        return orderItems;
    }

    /**
     * Calculate total amount from order items
     */
    static calculateTotalAmount(items: Array<{ totalPrice: number }>): number {
        return items.reduce((sum, item) => sum + Number(item.totalPrice), 0);
    }

    /**
     * Calculate total amount from existing order items in database
     */
    static async calculateOrderTotal(
        prisma: PrismaService,
        orderId: number,
    ): Promise<number> {
        const items = await prisma.orderItem.findMany({
            where: {
                orderId,
                status: { not: OrderItemStatus.cancelled },
            },
            select: {
                totalPrice: true,
            },
        });

        return this.calculateTotalAmount(
            items.map((item) => ({
                totalPrice: Number(item.totalPrice),
            })),
        );
    }
}
