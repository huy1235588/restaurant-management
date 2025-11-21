import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { tableApi } from '../services/table.service';
import { CreateTableDto, UpdateTableDto, TableStatus } from '@/types';

/**
 * Hook for table mutations (create, update, delete, status change)
 */
export const useTableMutations = () => {
    const queryClient = useQueryClient();

    const createTable = useMutation({
        mutationFn: (data: CreateTableDto) => tableApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tables'] });
            toast.success('Tạo bàn thành công');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Tạo bàn thất bại');
        },
    });

    const updateTable = useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateTableDto }) =>
            tableApi.update(id, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['tables'] });
            queryClient.invalidateQueries({ queryKey: ['table', data.tableId] });
            toast.success('Cập nhật bàn thành công');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Cập nhật bàn thất bại');
        },
    });

    const deleteTable = useMutation({
        mutationFn: (id: number) => tableApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tables'] });
            toast.success('Xóa bàn thành công');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Xóa bàn thất bại');
        },
    });

    const updateTableStatus = useMutation({
        mutationFn: ({ id, status }: { id: number; status: TableStatus }) =>
            tableApi.updateStatus(id, status),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['tables'] });
            queryClient.invalidateQueries({ queryKey: ['table', data.tableId] });
            toast.success('Cập nhật trạng thái bàn thành công');
        },
        onError: (error: any) => {
            toast.error(
                error.response?.data?.message || 'Cập nhật trạng thái bàn thất bại'
            );
        },
    });

    const bulkUpdateStatus = useMutation({
        mutationFn: ({ tableIds, status }: { tableIds: number[]; status: TableStatus }) =>
            tableApi.bulkUpdateStatus(tableIds, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tables'] });
            toast.success('Cập nhật hàng loạt thành công');
        },
        onError: (error: any) => {
            toast.error(
                error.response?.data?.message || 'Cập nhật hàng loạt thất bại'
            );
        },
    });

    return {
        createTable,
        updateTable,
        deleteTable,
        updateTableStatus,
        bulkUpdateStatus,
    };
};
