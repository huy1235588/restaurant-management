import {
    NotFoundException,
    BadRequestException,
    ConflictException,
} from '@nestjs/common';

/**
 * Custom exceptions for Order module
 * Provides better error context and consistent error handling
 */

export class OrderNotFoundException extends NotFoundException {
    constructor(orderId?: number | string) {
        const message = orderId
            ? `Order with ID ${orderId} not found`
            : 'Order not found';
        super(message);
    }
}

export class OrderItemNotFoundException extends NotFoundException {
    constructor(itemId: number, orderId?: number) {
        super(
            orderId
                ? `Order item ${itemId} not found in order ${orderId}`
                : `Order item ${itemId} not found`,
        );
    }
}

export class TableNotFoundException extends NotFoundException {
    constructor(tableId: number) {
        super(`Table with ID ${tableId} not found`);
    }
}

export class MenuItemNotFoundException extends NotFoundException {
    constructor(itemId: number) {
        super(`Menu item with ID ${itemId} not found`);
    }
}

export class TableOccupiedException extends ConflictException {
    constructor(tableId: number, orderNumber: string) {
        super(
            `Table ${tableId} already has an active order (${orderNumber}). Please add items to the existing order.`,
        );
    }
}

export class MenuItemNotAvailableException extends BadRequestException {
    constructor(itemName: string) {
        super(`Menu item "${itemName}" is not currently available`);
    }
}

export class MenuItemNotActiveException extends BadRequestException {
    constructor(itemName: string) {
        super(`Menu item "${itemName}" is not active`);
    }
}

export class CannotModifyCompletedOrderException extends BadRequestException {
    constructor(action: string = 'modify') {
        super(`Cannot ${action} a completed order`);
    }
}

export class CannotModifyCancelledOrderException extends BadRequestException {
    constructor(action: string = 'modify') {
        super(`Cannot ${action} a cancelled order`);
    }
}

export class OrderAlreadyCancelledException extends BadRequestException {
    constructor(orderId: number) {
        super(`Order ${orderId} is already cancelled`);
    }
}

export class BillAlreadyCreatedException extends BadRequestException {
    constructor(action: string = 'modify order') {
        super(`Cannot ${action} after bill has been created`);
    }
}

export class KitchenOrderNotFoundException extends NotFoundException {
    constructor(kitchenOrderId: number) {
        super(`Kitchen order with ID ${kitchenOrderId} not found`);
    }
}

export class CannotCompleteKitchenOrderException extends BadRequestException {
    constructor(reason: string) {
        super(`Cannot complete kitchen order: ${reason}`);
    }
}

export class InvalidOrderStatusException extends BadRequestException {
    constructor(from: string, to: string) {
        super(`Invalid status transition from ${from} to ${to}`);
    }
}

export class CannotAddItemsToServingOrderException extends BadRequestException {
    constructor(orderId: number) {
        super(
            `Cannot add items to order ${orderId} - order is currently being served`,
        );
    }
}
