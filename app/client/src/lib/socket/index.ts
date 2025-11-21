/**
 * Socket Services
 * Centralized export for all socket services
 */

export { baseSocketService, BaseSocketService } from './base';

// Re-export types
export type { SocketEventCallback } from './base';

// Legacy compatibility - export a unified service that combines all
import { baseSocketService } from './base';
export const socketService = baseSocketService;
export default socketService;
