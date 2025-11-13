import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useTableStore } from '@/stores/tableStore';
import { Table, TableStatus } from '@/types';
import { toast } from 'sonner';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export function useTableSocket() {
    const socketRef = useRef<Socket | null>(null);
    const { addTable, updateTable, updateTableStatus, removeTable } = useTableStore();

    useEffect(() => {
        // Initialize socket connection
        socketRef.current = io(SOCKET_URL, {
            withCredentials: true,
            transports: ['websocket', 'polling'],
        });

        const socket = socketRef.current;

        // Connection events
        socket.on('connect', () => {
            console.log('Table socket connected:', socket.id);
        });

        socket.on('disconnect', () => {
            console.log('Table socket disconnected');
        });

        socket.on('connect_error', (error) => {
            console.error('Table socket connection error:', error);
        });

        // Table events
        socket.on('table:created', (data: Table) => {
            console.log('Table created:', data);
            addTable(data);
            toast.success('New table created');
        });

        socket.on('table:updated', (data: { tableId: number; [key: string]: any }) => {
            console.log('Table updated:', data);
            const { tableId, ...updates } = data;
            updateTable(tableId, updates);
        });

        socket.on('table:deleted', (data: { tableId: number }) => {
            console.log('Table deleted:', data);
            removeTable(data.tableId);
            toast.info('Table deleted');
        });

        socket.on('table:status_changed', (data: { tableId: number; status: TableStatus; previousStatus?: TableStatus }) => {
            console.log('Table status changed:', data);
            updateTableStatus(data.tableId, data.status);
            toast.info(`Table status changed to ${data.status}`);
        });

        // Legacy event (kept for backward compatibility)
        socket.on('table:status', (data: { tableId: number; status: string }) => {
            console.log('Table status update (legacy):', data);
            updateTableStatus(data.tableId, data.status as TableStatus);
        });

        // Cleanup on unmount
        return () => {
            if (socket) {
                socket.off('connect');
                socket.off('disconnect');
                socket.off('connect_error');
                socket.off('table:created');
                socket.off('table:updated');
                socket.off('table:deleted');
                socket.off('table:status_changed');
                socket.off('table:status');
                socket.disconnect();
            }
        };
    }, [addTable, updateTable, updateTableStatus, removeTable]);

    return socketRef.current;
}
