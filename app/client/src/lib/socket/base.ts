import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

export type SocketEventCallback<T = unknown> = (data: T) => void;

/**
 * Base Socket Service
 * Manages connection and provides core socket functionality
 */
export class BaseSocketService {
    protected socket: Socket | null = null;
    protected listeners: Map<string, Set<SocketEventCallback>> = new Map();

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

    /**
     * Generic event listener
     */
    addEventListener<T = unknown>(event: string, callback: SocketEventCallback<T>) {
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

    /**
     * Remove event listener
     */
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

    /**
     * Emit events
     */
    emit(event: string, data?: unknown) {
        if (!this.socket?.connected) {
            console.warn('Socket not connected');
            return;
        }
        this.socket.emit(event, data);
    }

    /**
     * Get connection status
     */
    isConnected(): boolean {
        return this.socket?.connected || false;
    }

    /**
     * Join room
     */
    joinRoom(room: string) {
        this.emit('join-room', { room });
    }

    /**
     * Leave room
     */
    leaveRoom(room: string) {
        this.emit('leave-room', { room });
    }
}

// Export singleton instance
export const baseSocketService = new BaseSocketService();
