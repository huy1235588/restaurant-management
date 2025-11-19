/**
 * @deprecated This file is deprecated. Please use @/lib/socket instead.
 * 
 * Legacy socket.ts file - kept for backward compatibility
 * New code should import from @/lib/socket/index
 * 
 * Migration guide:
 * - For order events: import { orderSocketService } from '@/lib/socket'
 * - For kitchen events: import { kitchenSocketService } from '@/lib/socket'
 * - For table events: import { tableSocketService } from '@/lib/socket'
 * - For base connection: import { baseSocketService } from '@/lib/socket'
 */

export { 
    socketService,
    baseSocketService,
    orderSocketService,
    kitchenSocketService,
    tableSocketService,
    type SocketEventCallback,
} from './socket/index';

export { socketService as default } from './socket/index';
