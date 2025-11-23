import {
    NotFoundException,
    BadRequestException,
    ConflictException,
} from '@nestjs/common';
import { KITCHEN_MESSAGES } from '../constants/kitchen.constants';

/**
 * Kitchen order not found exception
 */
export class KitchenOrderNotFoundException extends NotFoundException {
    constructor(kitchenOrderId: number) {
        super({
            message: KITCHEN_MESSAGES.ERROR.ORDER_NOT_FOUND,
            error: 'Kitchen Order Not Found',
            kitchenOrderId,
        });
    }
}

/**
 * Kitchen order already exists exception
 */
export class KitchenOrderAlreadyExistsException extends ConflictException {
    constructor(orderId: number) {
        super({
            message: KITCHEN_MESSAGES.ERROR.ORDER_ALREADY_EXISTS,
            error: 'Kitchen Order Already Exists',
            orderId,
        });
    }
}

/**
 * Main order not found exception
 */
export class MainOrderNotFoundException extends NotFoundException {
    constructor(orderId: number) {
        super({
            message: KITCHEN_MESSAGES.ERROR.MAIN_ORDER_NOT_FOUND,
            error: 'Main Order Not Found',
            orderId,
        });
    }
}

/**
 * Order not confirmed exception
 */
export class OrderNotConfirmedException extends BadRequestException {
    constructor(orderId: number, currentStatus: string) {
        super({
            message: KITCHEN_MESSAGES.ERROR.ORDER_NOT_CONFIRMED,
            error: 'Order Not Confirmed',
            orderId,
            currentStatus,
        });
    }
}

/**
 * Kitchen order not pending exception
 */
export class KitchenOrderNotPendingException extends BadRequestException {
    constructor(kitchenOrderId: number, currentStatus: string) {
        super({
            message: KITCHEN_MESSAGES.ERROR.ORDER_NOT_PENDING,
            error: 'Kitchen Order Not Pending',
            kitchenOrderId,
            currentStatus,
        });
    }
}

/**
 * Cannot mark order as ready exception
 */
export class CannotMarkOrderReadyException extends BadRequestException {
    constructor(kitchenOrderId: number, currentStatus: string) {
        super({
            message: KITCHEN_MESSAGES.ERROR.CANNOT_MARK_READY,
            error: 'Cannot Mark Order Ready',
            kitchenOrderId,
            currentStatus,
        });
    }
}

/**
 * Can only complete ready orders exception
 */
export class CanOnlyCompleteReadyOrdersException extends BadRequestException {
    constructor(kitchenOrderId: number, currentStatus: string) {
        super({
            message: KITCHEN_MESSAGES.ERROR.CANNOT_COMPLETE,
            error: 'Can Only Complete Ready Orders',
            kitchenOrderId,
            currentStatus,
        });
    }
}

/**
 * Kitchen order already completed exception
 */
export class KitchenOrderAlreadyCompletedException extends BadRequestException {
    constructor(kitchenOrderId: number) {
        super({
            message: KITCHEN_MESSAGES.ERROR.ORDER_ALREADY_COMPLETED,
            error: 'Kitchen Order Already Completed',
            kitchenOrderId,
        });
    }
}

/**
 * Kitchen order already cancelled exception
 */
export class KitchenOrderAlreadyCancelledException extends BadRequestException {
    constructor(kitchenOrderId: number) {
        super({
            message: KITCHEN_MESSAGES.ERROR.ORDER_ALREADY_CANCELLED,
            error: 'Kitchen Order Already Cancelled',
            kitchenOrderId,
        });
    }
}

/**
 * Cannot cancel completed order exception
 */
export class CannotCancelCompletedOrderException extends BadRequestException {
    constructor(kitchenOrderId: number) {
        super({
            message: KITCHEN_MESSAGES.ERROR.CANNOT_CANCEL_COMPLETED,
            error: 'Cannot Cancel Completed Order',
            kitchenOrderId,
        });
    }
}

/**
 * Cannot modify completed order exception
 */
export class CannotModifyCompletedOrderException extends BadRequestException {
    constructor(kitchenOrderId: number) {
        super({
            message: KITCHEN_MESSAGES.ERROR.CANNOT_MODIFY_COMPLETED,
            error: 'Cannot Modify Completed Order',
            kitchenOrderId,
        });
    }
}

/**
 * Invalid status transition exception
 */
export class InvalidKitchenStatusTransitionException extends BadRequestException {
    constructor(currentStatus: string, newStatus: string) {
        super({
            message: KITCHEN_MESSAGES.ERROR.INVALID_STATUS_TRANSITION,
            error: 'Invalid Status Transition',
            currentStatus,
            newStatus,
        });
    }
}

/**
 * Invalid priority level exception
 */
export class InvalidPriorityException extends BadRequestException {
    constructor(priority: string, validPriorities: readonly string[]) {
        super({
            message: KITCHEN_MESSAGES.ERROR.INVALID_PRIORITY,
            error: 'Invalid Priority',
            providedPriority: priority,
            validPriorities,
        });
    }
}

/**
 * Kitchen queue full exception
 */
export class KitchenQueueFullException extends BadRequestException {
    constructor(currentCount: number, maxCapacity: number) {
        super({
            message: KITCHEN_MESSAGES.ERROR.QUEUE_FULL,
            error: 'Kitchen Queue Full',
            currentCount,
            maxCapacity,
        });
    }
}
