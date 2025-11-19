/**
 * Socket Services
 * Centralized export for all socket services
 */

export { baseSocketService, BaseSocketService } from './base';
export { orderSocketService } from './order.socket';
export { kitchenSocketService } from './kitchen.socket';
export { tableSocketService } from './table.socket';

// Re-export types
export type { SocketEventCallback } from './base';

// Legacy compatibility - export a unified service that combines all
import { baseSocketService } from './base';
export const socketService = baseSocketService;
export default socketService;
