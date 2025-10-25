import { io, Socket } from 'socket.io-client';
import { SocketOrder, SocketTable, KitchenOrder } from '@/types';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

type SocketEventCallback<T = unknown> = (data: T) => void;

class SocketService {
    private socket: Socket | null = null;
    private listeners: Map<string, Set<SocketEventCallback>> = new Map();

    connect(token?: string) {
        if (this.socket?.connected) {
            return this.socket;
        }

        this.socket = io(SOCKET_URL, {
            auth: {
                token: token || localStorage.getItem('accessToken'),
            },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        this.setupListeners();
        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.listeners.clear();
        }
    }

    private setupListeners() {
        if (!this.socket) return;

        this.socket.on('connect', () => {
            console.log('Socket connected:', this.socket?.id);
        });

        this.socket.on('disconnect', () => {
            console.log('Socket disconnected');
        });

        this.socket.on('error', (error: Error) => {
            console.error('Socket error:', error);
        });
    }

    // Order events
    onOrderCreated(callback: (order: SocketOrder) => void) {
        this.addEventListener<SocketOrder>('order:created', callback);
    }

    onOrderUpdated(callback: (order: SocketOrder) => void) {
        this.addEventListener<SocketOrder>('order:updated', callback);
    }

    onOrderStatusChanged(callback: (data: { orderId: number; status: string }) => void) {
        this.addEventListener<{ orderId: number; status: string }>('order:status-changed', callback);
    }

    // Table events
    onTableStatusChanged(callback: (table: SocketTable) => void) {
        this.addEventListener<SocketTable>('table:status-changed', callback);
    }

    onTableOccupied(callback: (table: SocketTable) => void) {
        this.addEventListener<SocketTable>('table:occupied', callback);
    }

    onTableFreed(callback: (table: SocketTable) => void) {
        this.addEventListener<SocketTable>('table:freed', callback);
    }

    // Kitchen events
    onKitchenOrderReceived(callback: (order: KitchenOrder) => void) {
        this.addEventListener<KitchenOrder>('kitchen:order-received', callback);
    }

    onKitchenOrderUpdated(callback: (order: KitchenOrder) => void) {
        this.addEventListener<KitchenOrder>('kitchen:order-updated', callback);
    }

    // Generic event listener
    private addEventListener<T = unknown>(event: string, callback: SocketEventCallback<T>) {
        if (!this.socket) {
            console.warn('Socket not connected');
            return;
        }

        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());

            // Set up socket listener
            this.socket.on(event, (data: T) => {
                const callbacks = this.listeners.get(event);
                if (callbacks) {
                    callbacks.forEach((cb: SocketEventCallback) => cb(data));
                }
            });
        }

        this.listeners.get(event)?.add(callback as SocketEventCallback);
    }

    // Remove event listener
    removeEventListener<T = unknown>(event: string, callback: SocketEventCallback<T>) {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            callbacks.delete(callback as SocketEventCallback);

            if (callbacks.size === 0) {
                this.socket?.off(event);
                this.listeners.delete(event);
            }
        }
    }

    // Emit events
    emit(event: string, data?: unknown) {
        if (!this.socket?.connected) {
            console.warn('Socket not connected');
            return;
        }
        this.socket.emit(event, data);
    }

    // Get connection status
    isConnected(): boolean {
        return this.socket?.connected || false;
    }

    // Join room (for specific table, kitchen, etc.)
    joinRoom(room: string) {
        this.emit('join-room', { room });
    }

    // Leave room
    leaveRoom(room: string) {
        this.emit('leave-room', { room });
    }
}

// Export singleton instance
export const socketService = new SocketService();
export default socketService;
