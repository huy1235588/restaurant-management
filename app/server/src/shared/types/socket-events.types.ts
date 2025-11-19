/**
 * WebSocket Event Types for Order & Kitchen Management
 * Real-time bidirectional communication events
 */

// ============================================================================
// ORDER MANAGEMENT EVENTS (Waiter-facing)
// ============================================================================

/**
 * order:created
 * Emitted when: New order is created
 * Sent to: Kitchen, Waiters, Table room
 * Payload: { orderId, tableId, orderNumber, status, totalAmount, finalAmount, items }
 */

/**
 * order:confirmed
 * Emitted when: Order status changes to 'confirmed'
 * Sent to: Kitchen, Waiters, Table room
 * Payload: { orderId, tableId, orderNumber, confirmedAt }
 */

/**
 * order:status_changed
 * Emitted when: Order status is updated
 * Sent to: Kitchen, Waiters, Table room, Order room
 * Payload: { orderId, tableId?, status }
 */

/**
 * order:items_added
 * Emitted when: New items added to existing order
 * Sent to: Kitchen, Table room, Order room
 * Payload: { orderId, tableId, items, newTotalAmount, newFinalAmount }
 */

/**
 * order:item_status_changed
 * Emitted when: Individual order item status changes
 * Sent to: Table room, Waiters, Order room
 * Payload: { orderId, itemId, status }
 */

/**
 * order:cancel_request
 * Emitted when: Waiter requests order cancellation
 * Sent to: Kitchen, Order room
 * Payload: { orderId, tableId, reason, staffId? }
 */

/**
 * order:cancelled
 * Emitted when: Order is cancelled (by kitchen or system)
 * Sent to: Kitchen, Table room, Waiters, Order room
 * Payload: { orderId, tableId, reason }
 */

// ============================================================================
// KITCHEN MANAGEMENT EVENTS (Chef-facing)
// ============================================================================

/**
 * kitchen:order_acknowledged
 * Emitted when: Chef acknowledges order
 * Sent to: Kitchen, Waiters, Order room
 * Payload: { kitchenOrderId, orderId, chefId, chefName }
 */

/**
 * kitchen:order_preparing
 * Emitted when: Chef starts preparing order
 * Sent to: Kitchen, Table room, Waiters
 * Payload: { kitchenOrderId, orderId, tableId }
 */

/**
 * kitchen:order_ready
 * Emitted when: Order is ready for serving
 * Sent to: Kitchen, Table room, Waiters, Order room
 * Payload: { kitchenOrderId, orderId, tableId }
 */

/**
 * kitchen:order_completed
 * Emitted when: Order fully completed
 * Sent to: Kitchen, Table room, Waiters
 * Payload: { kitchenOrderId, orderId, tableId, prepTime }
 */

/**
 * kitchen:cancel_accepted
 * Emitted when: Kitchen accepts cancellation request
 * Sent to: Kitchen, Waiters, Order room
 * Payload: { kitchenOrderId, orderId, tableId }
 */

/**
 * kitchen:cancel_rejected
 * Emitted when: Kitchen rejects cancellation request
 * Sent to: Kitchen, Waiters, Order room
 * Payload: { kitchenOrderId, orderId, tableId, reason }
 */

/**
 * kitchen:priority_changed
 * Emitted when: Order priority is updated
 * Sent to: Kitchen
 * Payload: { kitchenOrderId, orderId, priority }
 */

/**
 * kitchen:station_assigned
 * Emitted when: Order assigned to specific station
 * Sent to: Kitchen
 * Payload: { kitchenOrderId, orderId, stationId, stationName }
 */

/**
 * kitchen:order:update
 * Emitted when: General kitchen order update
 * Sent to: Kitchen
 * Payload: { kitchenOrderId, status, orderId, tableId }
 */

/**
 * kitchen:stats_update
 * Emitted when: Kitchen statistics change
 * Sent to: Kitchen
 * Payload: { pending, preparing, ready, total }
 */

// ============================================================================
// ROOMS STRUCTURE
// ============================================================================

/**
 * 'kitchen' - All kitchen staff/chefs
 * 'waiters' - All waiters/servers
 * 'table:{tableId}' - Specific table clients (customer displays, table tablets)
 * 'order:{orderId}' - Specific order subscribers (detail views, tracking)
 */

// ============================================================================
// CLIENT-TO-SERVER EVENTS (Socket.on)
// ============================================================================

/**
 * join:kitchen - Client joins kitchen room
 * join:waiters - Client joins waiters room
 * join:table - Client joins specific table room (payload: tableId)
 * join:order - Client joins specific order room (payload: orderId)
 * leave:kitchen - Client leaves kitchen room
 * leave:waiters - Client leaves waiters room
 * leave:table - Client leaves table room (payload: tableId)
 * leave:order - Client leaves order room (payload: orderId)
 */

export {};
