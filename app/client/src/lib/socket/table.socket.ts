import { SocketTable } from '@/types';
import { BaseSocketService, SocketEventCallback } from './base';

/**
 * Table Socket Service
 * Handles real-time table events
 */
class TableSocketService extends BaseSocketService {
    /**
     * Listen to table status changed event
     */
    onTableStatusChanged(callback: (table: SocketTable) => void) {
        this.addEventListener<SocketTable>('table:status-changed', callback);
    }

    /**
     * Listen to table occupied event
     */
    onTableOccupied(callback: (table: SocketTable) => void) {
        this.addEventListener<SocketTable>('table:occupied', callback);
    }

    /**
     * Listen to table freed event
     */
    onTableFreed(callback: (table: SocketTable) => void) {
        this.addEventListener<SocketTable>('table:freed', callback);
    }

    /**
     * Remove table status changed listener
     */
    offTableStatusChanged(callback: (table: SocketTable) => void) {
        this.removeEventListener('table:status-changed', callback);
    }

    /**
     * Remove table occupied listener
     */
    offTableOccupied(callback: (table: SocketTable) => void) {
        this.removeEventListener('table:occupied', callback);
    }

    /**
     * Remove table freed listener
     */
    offTableFreed(callback: (table: SocketTable) => void) {
        this.removeEventListener('table:freed', callback);
    }
}

// Export singleton instance
export const tableSocketService = new TableSocketService();
export default tableSocketService;
