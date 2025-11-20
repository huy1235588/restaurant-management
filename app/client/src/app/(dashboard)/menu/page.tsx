'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { MenuItem } from '@/types';
import { uploadApi } from '@/services/upload.service';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, ArrowUpDown } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    ViewMode,
    MenuFilters,
    MenuItemList,
    MenuItemForm,
    MenuItemFilters,
    MenuSearch,
    MenuStatistics,
    ViewModeSwitcher,
    useMenuItems,
    useMenuItemCount,
    useCreateMenuItem,
    useUpdateMenuItem,
    useDeleteMenuItem,
    useUpdateAvailability,
    useMenuItemHandlers,
} from '@/modules/menu';
import { useCategories } from '@/modules/categories';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';

export default function MenuPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // View mode with localStorage persistence
    const [viewMode, setViewMode] = useState<ViewMode>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('menu-view-mode');
            return (saved as ViewMode) || 'table';
        }
        return 'grid';
    });

    // Filters state from URL
    const [filters, setFilters] = useState<MenuFilters>({});
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(20);
    const [sortBy, setSortBy] = useState('itemName');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    // Dialogs state
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);
    const [duplicateMode, setDuplicateMode] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    // Data fetching
    const { menuItems, pagination, loading, error, refetch } = useMenuItems({
        ...filters,
        search: searchQuery,
        page,
        limit,
        sortBy,
        sortOrder,
    });

    const { categories } = useCategories({ isActive: true });
    const { count: totalCount } = useMenuItemCount();
    const { count: availableCount } = useMenuItemCount({ isAvailable: true });
    const { count: outOfStockCount } = useMenuItemCount({ isAvailable: false });

    // Mutations
    const { createMenuItem, loading: creating } = useCreateMenuItem();
    const { updateMenuItem, loading: updating } = useUpdateMenuItem();
    const { deleteMenuItem, loading: deleting } = useDeleteMenuItem();
    const { updateAvailability } = useUpdateAvailability();

    // Statistics
    const stats = {
        total: totalCount,
        available: availableCount,
        outOfStock: outOfStockCount,
        newThisMonth: 0, // TODO: Calculate from createdAt
    };

    // Load filters from URL on mount
    useEffect(() => {
        const categoryId = searchParams.get('categoryId');
        const isAvailable = searchParams.get('isAvailable');
        const isActive = searchParams.get('isActive');
        const search = searchParams.get('search');
        const pageParam = searchParams.get('page');
        const sortByParam = searchParams.get('sortBy');
        const sortOrderParam = searchParams.get('sortOrder');
        const editId = searchParams.get('edit');
        const duplicateId = searchParams.get('duplicate');

        const newFilters: MenuFilters = {};
        if (categoryId) newFilters.categoryId = Number(categoryId);
        if (isAvailable !== null) newFilters.isAvailable = isAvailable === 'true';
        if (isActive !== null) newFilters.isActive = isActive === 'true';

        setFilters(newFilters);
        setSearchQuery(search || '');
        setPage(pageParam ? Number(pageParam) : 1);
        if (sortByParam) setSortBy(sortByParam);
        if (sortOrderParam) setSortOrder(sortOrderParam as 'asc' | 'desc');
        
        // Only set initialized once on mount
        if (!isInitialized) {
            setIsInitialized(true);
        }

        // Handle edit/duplicate from URL
        if (editId) {
            const item = menuItems.find((m) => m.itemId === Number(editId));
            if (item) {
                setSelectedMenuItem(item);
                setEditDialogOpen(true);
            }
        } else if (duplicateId) {
            const item = menuItems.find((m) => m.itemId === Number(duplicateId));
            if (item) {
                setSelectedMenuItem(item);
                setDuplicateMode(true);
                setCreateDialogOpen(true);
            }
        }
    }, [searchParams]);

    // Update URL when filters change
    const updateURL = () => {
        const params = new URLSearchParams();
        if (filters.categoryId) params.set('categoryId', filters.categoryId.toString());
        if (filters.isAvailable !== undefined)
            params.set('isAvailable', filters.isAvailable.toString());
        if (filters.isActive !== undefined) params.set('isActive', filters.isActive.toString());
        if (searchQuery) params.set('search', searchQuery);
        if (page > 1) params.set('page', page.toString());
        if (sortBy) params.set('sortBy', sortBy);
        if (sortOrder) params.set('sortOrder', sortOrder);

        const newUrl = `/menu?${params.toString()}`;
        const currentUrl = window.location.pathname + window.location.search;
        
        // Only push if URL actually changed
        if (newUrl !== currentUrl) {
            router.push(newUrl, { scroll: false });
        }
    };

    useEffect(() => {
        if (isInitialized) {
            updateURL();
        }
    }, [filters, searchQuery, page, sortBy, sortOrder, isInitialized]);

    // Save view mode to localStorage
    useEffect(() => {
        localStorage.setItem('menu-view-mode', viewMode);
    }, [viewMode]);

    // Menu item handlers
    const { handleCreate, handleUpdate, handleDelete: handleDeleteItem } = useMenuItemHandlers({
        onCreateMenuItem: async (data) => {
            await createMenuItem(data);
        },
        onUpdateMenuItem: async (itemId, data) => {
            await updateMenuItem(itemId, data);
        },
        onDeleteMenuItem: async (itemId) => {
            await deleteMenuItem(itemId);
        },
        onCreateSuccess: () => {
            setCreateDialogOpen(false);
            setDuplicateMode(false);
            setSelectedMenuItem(null);
            refetch();
        },
        onUpdateSuccess: () => {
            setEditDialogOpen(false);
            setSelectedMenuItem(null);
            refetch();
        },
        onDeleteSuccess: () => {
            setDeleteDialogOpen(false);
            setSelectedMenuItem(null);
            refetch();
        },
    });

    // Wrapper for form submissions
    const handleCreateFormSubmit = async (data: any, imageFile?: File | null) => {
        try {
            await handleCreate(data, imageFile);
        } catch (error) {
            // Error already handled in hook
        }
    };

    const handleUpdateFormSubmit = async (data: any, imageFile?: File | null) => {
        if (!selectedMenuItem) return;

        try {
            await handleUpdate(selectedMenuItem.itemId, selectedMenuItem, data, imageFile);
        } catch (error) {
            // Error already handled in hook
        }
    };

    const handleDeleteConfirm = async () => {
        if (!selectedMenuItem) return;

        try {
            await handleDeleteItem(selectedMenuItem.itemId, selectedMenuItem);
        } catch (error) {
            // Error already handled in hook
        }
    };

    const handleEdit = (item: MenuItem) => {
        setSelectedMenuItem(item);
        setEditDialogOpen(true);
    };

    const handleDeleteClick = (item: MenuItem) => {
        setSelectedMenuItem(item);
        setDeleteDialogOpen(true);
    };

    const handleDuplicate = (item: MenuItem) => {
        setSelectedMenuItem(item);
        setDuplicateMode(true);
        setCreateDialogOpen(true);
    };

    const handleViewDetails = (item: MenuItem) => {
        router.push(`/menu/${item.itemId}`);
    };

    const handleToggleAvailability = async (item: MenuItem, isAvailable: boolean) => {
        try {
            await updateAvailability(item.itemId, isAvailable);
            toast.success(
                `Menu item ${isAvailable ? 'marked as available' : 'marked as out of stock'}`
            );
            refetch();
        } catch (error: any) {
            toast.error(error.message || 'Failed to update availability');
        }
    };

    const handleFiltersChange = (newFilters: MenuFilters) => {
        setFilters(newFilters);
        setPage(1); // Reset to first page
    };

    const handleClearFilters = () => {
        setFilters({});
        setPage(1);
    };

    const handleSortChange = (value: string) => {
        const [field, order] = value.split('-');
        setSortBy(field);
        setSortOrder(order as 'asc' | 'desc');
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Menu Management</h1>
                    <p className="text-muted-foreground mt-1">Manage your restaurant menu items</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => setCreateDialogOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Menu Item
                    </Button>
                </div>
            </div>

            {/* Statistics */}
            <MenuStatistics data={stats} loading={false} />

            {/* Filters and Search */}
            <div className="space-y-4">
                <div className="flex items-center gap-4">
                    <MenuSearch
                        value={searchQuery}
                        onChange={setSearchQuery}
                        placeholder="Search menu items..."
                    />
                    <Select value={`${sortBy}-${sortOrder}`} onValueChange={handleSortChange}>
                        <SelectTrigger className="w-[200px]">
                            <ArrowUpDown className="w-4 h-4 mr-2" />
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="itemCode-asc">Code (A-Z)</SelectItem>
                            <SelectItem value="itemCode-desc">Code (Z-A)</SelectItem>
                            <SelectItem value="itemName-asc">Name (A-Z)</SelectItem>
                            <SelectItem value="itemName-desc">Name (Z-A)</SelectItem>
                            <SelectItem value="categoryId-asc">Category (A-Z)</SelectItem>
                            <SelectItem value="categoryId-desc">Category (Z-A)</SelectItem>
                            <SelectItem value="price-asc">Price (Low-High)</SelectItem>
                            <SelectItem value="price-desc">Price (High-Low)</SelectItem>
                            <SelectItem value="isActive-asc">Status (Inactive First)</SelectItem>
                            <SelectItem value="isActive-desc">Status (Active First)</SelectItem>
                            <SelectItem value="createdAt-desc">Newest First</SelectItem>
                            <SelectItem value="createdAt-asc">Oldest First</SelectItem>
                            <SelectItem value="displayOrder-asc">Display Order</SelectItem>
                        </SelectContent>
                    </Select>
                    <ViewModeSwitcher value={viewMode} onChange={setViewMode} />
                </div>

                <MenuItemFilters
                    filters={filters}
                    categories={categories}
                    onChange={handleFiltersChange}
                    onClear={handleClearFilters}
                />
            </div>

            {/* Menu Items List */}
            <MenuItemList
                items={menuItems}
                loading={loading}
                error={error}
                viewMode={viewMode}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={(field) => {
                    if (sortBy === field) {
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    } else {
                        setSortBy(field);
                        setSortOrder('asc');
                    }
                    setPage(1);
                }}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
                onDuplicate={handleDuplicate}
                onViewDetails={handleViewDetails}
                onToggleAvailability={handleToggleAvailability}
            />

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        Showing {(page - 1) * limit + 1} to{' '}
                        {Math.min(page * limit, pagination.total)} of {pagination.total} items
                    </div>
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                />
                            </PaginationItem>
                            {[...Array(pagination.totalPages)].map((_, i) => {
                                const pageNum = i + 1;
                                if (
                                    pageNum === 1 ||
                                    pageNum === pagination.totalPages ||
                                    (pageNum >= page - 1 && pageNum <= page + 1)
                                ) {
                                    return (
                                        <PaginationItem key={pageNum}>
                                            <PaginationLink
                                                onClick={() => setPage(pageNum)}
                                                isActive={pageNum === page}
                                                className="cursor-pointer"
                                            >
                                                {pageNum}
                                            </PaginationLink>
                                        </PaginationItem>
                                    );
                                } else if (pageNum === page - 2 || pageNum === page + 2) {
                                    return (
                                        <PaginationItem key={pageNum}>
                                            <span className="px-3">...</span>
                                        </PaginationItem>
                                    );
                                }
                                return null;
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

            {/* Create/Duplicate Dialog */}
            <Dialog
                open={createDialogOpen}
                onOpenChange={(open) => {
                    setCreateDialogOpen(open);
                    if (!open) {
                        setDuplicateMode(false);
                        setSelectedMenuItem(null);
                    }
                }}
            >
                <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {duplicateMode ? 'Duplicate Menu Item' : 'Create New Menu Item'}
                        </DialogTitle>
                    </DialogHeader>
                    <MenuItemForm
                        menuItem={duplicateMode ? { ...selectedMenuItem!, itemCode: '' } : null}
                        categories={categories}
                        onSubmit={handleCreateFormSubmit}
                        onCancel={() => {
                            setCreateDialogOpen(false);
                            setDuplicateMode(false);
                            setSelectedMenuItem(null);
                        }}
                        loading={creating}
                    />
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog
                open={editDialogOpen}
                onOpenChange={(open) => {
                    setEditDialogOpen(open);
                    if (!open) setSelectedMenuItem(null);
                }}
            >
                <DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Menu Item</DialogTitle>
                    </DialogHeader>
                    <MenuItemForm
                        menuItem={selectedMenuItem}
                        categories={categories}
                        onSubmit={handleUpdateFormSubmit}
                        onCancel={() => {
                            setEditDialogOpen(false);
                            setSelectedMenuItem(null);
                        }}
                        loading={updating}
                    />
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <AlertDialog
                open={deleteDialogOpen}
                onOpenChange={(open) => {
                    setDeleteDialogOpen(open);
                    if (!open) setSelectedMenuItem(null);
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Menu Item</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete "{selectedMenuItem?.itemName}"? This
                            action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            disabled={deleting}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            {deleting ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
