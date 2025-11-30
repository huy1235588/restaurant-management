'use client';

import { useState, useMemo, useCallback } from 'react';
import { Staff, ViewMode, Role, StaffQueryParams } from '../types';
import { useStaff, useStaffStats, useToggleStaffStatus } from '../hooks';
import {
    StaffCard,
    StaffListRow,
    StaffFilters,
    StaffSearch,
    StaffStats,
    ViewModeSwitcher,
} from '../components';
import {
    StaffDetailDialog,
    ChangeRoleDialog,
    DeleteStaffDialog,
    CreateStaffWithAccountDialog,
} from '../dialogs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import { Plus, RefreshCw, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

export function StaffList() {
    const { t } = useTranslation();
    const { user } = useAuth();

    // View state
    const [viewMode, setViewMode] = useState<ViewMode>('grid');

    // Filter state
    const [search, setSearch] = useState('');
    const [role, setRole] = useState<Role | undefined>();
    const [isActive, setIsActive] = useState<boolean | undefined>();
    const [page, setPage] = useState(1);
    const [limit] = useState(12);

    // Dialog state
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    const [changeRoleDialogOpen, setChangeRoleDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);

    // Query params
    const queryParams: StaffQueryParams = useMemo(
        () => ({
            search: search || undefined,
            role,
            isActive,
            page,
            limit,
            sortBy: 'fullName',
            sortOrder: 'asc',
        }),
        [search, role, isActive, page, limit]
    );

    // Fetch data
    const { staffList, pagination, loading, error, refetch } = useStaff(queryParams);
    const stats = useStaffStats(staffList);
    const { toggleStatus, loading: togglingStatus } = useToggleStaffStatus();

    // Permissions
    const canManageStaff = user?.role === 'admin' || user?.role === 'manager';
    const canChangeRole = user?.role === 'admin';
    const canDelete = user?.role === 'admin';

    // Handlers
    const handleCreate = () => {
        setCreateDialogOpen(true);
    };

    const handleEdit = (staff: Staff) => {
        setSelectedStaff(staff);
        setDetailDialogOpen(true);
    };

    const handleViewDetails = (staff: Staff) => {
        setSelectedStaff(staff);
        setDetailDialogOpen(true);
    };

    const handleChangeRole = (staff: Staff) => {
        setSelectedStaff(staff);
        setChangeRoleDialogOpen(true);
    };

    const handleDelete = (staff: Staff) => {
        setSelectedStaff(staff);
        setDeleteDialogOpen(true);
    };

    const handleToggleStatus = useCallback(
        async (staff: Staff) => {
            try {
                await toggleStatus(staff.staffId, staff.isActive);
                toast.success(
                    staff.isActive ? t('staff.deactivateSuccess') : t('staff.activateSuccess')
                );
                refetch();
            } catch (error: any) {
                toast.error(error.message || t('common.error'));
            }
        },
        [toggleStatus, refetch, t]
    );

    const handleClearFilters = () => {
        setSearch('');
        setRole(undefined);
        setIsActive(undefined);
        setPage(1);
    };

    const handleSuccess = () => {
        refetch();
    };

    // Render loading skeleton
    const renderSkeleton = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-[200px] rounded-lg" />
            ))}
        </div>
    );

    // Render empty state
    const renderEmpty = () => (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t('staff.noStaffFound')}</h3>
            <p className="text-muted-foreground mb-4">{t('staff.noStaffDescription')}</p>
            {canManageStaff && (
                <Button onClick={handleCreate}>
                    <Plus className="w-4 h-4 mr-2" />
                    {t('staff.createStaff')}
                </Button>
            )}
        </div>
    );

    // Render grid view
    const renderGrid = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {staffList.map((staff) => (
                <StaffCard
                    key={staff.staffId}
                    staff={staff}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onViewDetails={handleViewDetails}
                    onChangeRole={handleChangeRole}
                    onToggleStatus={handleToggleStatus}
                    canChangeRole={canChangeRole}
                    canDelete={canDelete}
                />
            ))}
        </div>
    );

    // Render table view
    const renderTable = () => (
        <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
                <thead className="bg-muted/50">
                    <tr>
                        <th className="text-left py-3 px-4 font-medium">{t('staff.name')}</th>
                        <th className="text-left py-3 px-4 font-medium">{t('staff.role')}</th>
                        <th className="text-left py-3 px-4 font-medium">{t('staff.contact')}</th>
                        <th className="text-left py-3 px-4 font-medium">{t('staff.hireDate')}</th>
                        <th className="text-left py-3 px-4 font-medium">{t('common.status')}</th>
                        <th className="text-left py-3 px-4 font-medium">{t('common.actions')}</th>
                    </tr>
                </thead>
                <tbody>
                    {staffList.map((staff) => (
                        <StaffListRow
                            key={staff.staffId}
                            staff={staff}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onViewDetails={handleViewDetails}
                            onChangeRole={handleChangeRole}
                            onToggleStatus={handleToggleStatus}
                            canChangeRole={canChangeRole}
                            canDelete={canDelete}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">{t('staff.title')}</h1>
                    <p className="text-muted-foreground">{t('staff.pageDescription')}</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => refetch()}>
                        <RefreshCw className="w-4 h-4" />
                    </Button>
                    {canManageStaff && (
                        <Button onClick={handleCreate}>
                            <Plus className="w-4 h-4 mr-2" />
                            {t('staff.createStaff')}
                        </Button>
                    )}
                </div>
            </div>

            {/* Statistics */}
            <StaffStats stats={stats} />

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <StaffSearch value={search} onChange={setSearch} />
                    <StaffFilters
                        role={role}
                        isActive={isActive}
                        onRoleChange={setRole}
                        onStatusChange={setIsActive}
                        onClear={handleClearFilters}
                    />
                </div>
                <ViewModeSwitcher mode={viewMode} onChange={setViewMode} />
            </div>

            {/* Content */}
            {loading ? (
                renderSkeleton()
            ) : error ? (
                <div className="text-center py-12 text-destructive">
                    <p>{error}</p>
                    <Button variant="outline" onClick={() => refetch()} className="mt-4">
                        {t('common.tryAgain')}
                    </Button>
                </div>
            ) : staffList.length === 0 ? (
                renderEmpty()
            ) : viewMode === 'grid' ? (
                renderGrid()
            ) : (
                renderTable()
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        {t('common.showing')} {(page - 1) * limit + 1}-
                        {Math.min(page * limit, pagination.total)} {t('common.of')} {pagination.total}{' '}
                        {t('staff.staffMembers')}
                    </p>
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                />
                            </PaginationItem>
                            {Array.from({ length: Math.min(5, pagination.totalPages) }).map((_, i) => {
                                const pageNum = i + 1;
                                return (
                                    <PaginationItem key={pageNum}>
                                        <PaginationLink
                                            onClick={() => setPage(pageNum)}
                                            isActive={page === pageNum}
                                            className="cursor-pointer"
                                        >
                                            {pageNum}
                                        </PaginationLink>
                                    </PaginationItem>
                                );
                            })}
                            <PaginationItem>
                                <PaginationNext
                                    onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                                    className={
                                        page === pagination.totalPages
                                            ? 'pointer-events-none opacity-50'
                                            : 'cursor-pointer'
                                    }
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}

            {/* Dialogs */}
            <CreateStaffWithAccountDialog
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
                onSuccess={handleSuccess}
            />
            <StaffDetailDialog
                open={detailDialogOpen}
                onOpenChange={setDetailDialogOpen}
                staff={selectedStaff}
            />
            <ChangeRoleDialog
                open={changeRoleDialogOpen}
                onOpenChange={setChangeRoleDialogOpen}
                staff={selectedStaff}
                onSuccess={handleSuccess}
            />
            <DeleteStaffDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                staff={selectedStaff}
                onSuccess={handleSuccess}
            />
        </div>
    );
}
