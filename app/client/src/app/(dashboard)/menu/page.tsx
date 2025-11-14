'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { menuApi, categoryApi } from '@/services/menu.service';
import { MenuItem, Category } from '@/types';
import { MenuHeader } from '@/features/menu/MenuHeader';
import { MenuStats } from '@/features/menu/MenuStats';
import { MenuFilters } from '@/features/menu/MenuFilters';
import { MenuItemsTable } from '@/features/menu/MenuItemsTable';
import { MenuItemsGrid } from '@/features/menu/MenuItemsGrid';
import { MenuPagination } from '@/features/menu/MenuPagination';
import { MenuDialogs } from '@/features/menu/MenuDialogs';

type ViewMode = 'list' | 'grid';
type SortField = 'name' | 'price' | 'category' | 'code' | 'date';
type SortOrder = 'asc' | 'desc';

export default function MenuPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    // View mode state (not synced with URL)
    const [viewMode, setViewMode] = useState<ViewMode>('list');

    // Dialog states
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [showDetailDialog, setShowDetailDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

    // Get all filter values from URL (memoized to prevent unnecessary recalculations)
    const filters = useMemo(() => ({
        searchTerm: searchParams.get('search') || '',
        selectedCategory: searchParams.get('category') || 'all',
        availabilityFilter: searchParams.get('availability') || 'all',
        currentPage: parseInt(searchParams.get('page') || '1', 10),
        itemsPerPage: parseInt(searchParams.get('limit') || '12', 10),
        sortField: (searchParams.get('sortBy') || 'name') as SortField,
        sortOrder: (searchParams.get('sortOrder') || 'asc') as SortOrder,
    }), [searchParams]);

    // Update URL with new filter values
    const updateFilters = useCallback((updates: Partial<typeof filters>) => {
        const params = new URLSearchParams(searchParams.toString());

        // Merge current filters with updates
        const newFilters = { ...filters, ...updates };

        // Update URL params
        if (newFilters.searchTerm) {
            params.set('search', newFilters.searchTerm);
        } else {
            params.delete('search');
        }

        if (newFilters.selectedCategory !== 'all') {
            params.set('category', newFilters.selectedCategory);
        } else {
            params.delete('category');
        }

        if (newFilters.availabilityFilter !== 'all') {
            params.set('availability', newFilters.availabilityFilter);
        } else {
            params.delete('availability');
        }

        if (newFilters.currentPage > 1) {
            params.set('page', newFilters.currentPage.toString());
        } else {
            params.delete('page');
        }

        if (newFilters.itemsPerPage !== 12) {
            params.set('limit', newFilters.itemsPerPage.toString());
        } else {
            params.delete('limit');
        }

        if (newFilters.sortField !== 'name') {
            params.set('sortBy', newFilters.sortField);
        } else {
            params.delete('sortBy');
        }

        if (newFilters.sortOrder !== 'asc') {
            params.set('sortOrder', newFilters.sortOrder);
        } else {
            params.delete('sortOrder');
        }

        const query = params.toString();
        const href = query ? `/menu?${query}` : '/menu';
        router.push(href);
    }, [filters, searchParams, router]);

    const loadCategories = async () => {
        try {
            const data = await categoryApi.getAll({ isActive: true });
            setCategories(data);
        } catch (error) {
            console.error('Failed to load categories:', error);
            toast.error(t('menu.loadCategoriesError'));
        }
    };

    // Load categories once on mount
    useEffect(() => {
        loadCategories();
    }, []);

    // Load menu items when filters change
    useEffect(() => {
        loadMenuItems();
    }, [filters.searchTerm, filters.selectedCategory, filters.availabilityFilter,
    filters.currentPage, filters.itemsPerPage, filters.sortField, filters.sortOrder]);

    const loadMenuItems = async () => {
        try {
            setLoading(true);
            const params: Record<string, string | number | boolean> = {
                page: filters.currentPage,
                limit: filters.itemsPerPage,
            };

            // Map sortField to server field names
            const sortFieldMapping: Record<SortField, string> = {
                name: 'itemName',
                price: 'price',
                category: 'category.categoryName',
                code: 'itemCode',
                date: 'createdAt',
            };

            params.sortBy = sortFieldMapping[filters.sortField];
            params.sortOrder = filters.sortOrder;

            if (filters.searchTerm) params.search = filters.searchTerm;
            if (filters.selectedCategory !== 'all') params.categoryId = parseInt(filters.selectedCategory);
            if (filters.availabilityFilter !== 'all') params.isAvailable = filters.availabilityFilter === 'available';

            const response = await menuApi.getAll(params);
            setMenuItems(response.items);
            setTotalPages(response.pagination.totalPages);
            setTotalItems(response.pagination.total);
        } catch (error) {
            console.error('Failed to load menu items:', error);
            toast.error(t('menu.loadItemsError'));
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (data: Partial<MenuItem>) => {
        try {
            await menuApi.create(data);
            toast.success(t('menu.createSuccess'));
            setShowCreateDialog(false);
            loadMenuItems();
        } catch (error) {
            console.error('Failed to create menu item:', error);
            toast.error(t('menu.createError'));
        }
    };

    const handleUpdate = async (data: Partial<MenuItem>) => {
        if (!selectedItem) return;
        try {
            await menuApi.update(selectedItem.itemId, data);
            toast.success(t('menu.updateSuccess'));
            setShowEditDialog(false);
            setSelectedItem(null);
            loadMenuItems();
        } catch (error) {
            console.error('Failed to update menu item:', error);
            toast.error(t('menu.updateError'));
        }
    };

    const handleDelete = async () => {
        if (!selectedItem) return;
        try {
            await menuApi.delete(selectedItem.itemId);
            toast.success(t('menu.deleteSuccess'));
            setShowDeleteDialog(false);
            setSelectedItem(null);
            loadMenuItems();
        } catch (error) {
            console.error('Failed to delete menu item:', error);
            toast.error(t('menu.deleteError'));
        }
    };

    const handleToggleAvailability = async (item: MenuItem) => {
        try {
            await menuApi.updateAvailability(item.itemId, !item.isAvailable);
            toast.success(t('menu.availabilityUpdated'));
            loadMenuItems();
        } catch (error) {
            console.error('Failed to update availability:', error);
            toast.error(t('menu.availabilityError'));
        }
    };

    const handleSort = (field: SortField) => {
        if (filters.sortField === field) {
            // Toggle sort order
            updateFilters({
                sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc',
                currentPage: 1
            });
        } else {
            // Change sort field
            updateFilters({
                sortField: field,
                sortOrder: 'asc',
                currentPage: 1
            });
        }
    };

    const handleItemsPerPageChange = (newItemsPerPage: number) => {
        updateFilters({
            itemsPerPage: newItemsPerPage,
            currentPage: 1
        });
    };

    const handleFilterChange = {
        search: (value: string) => {
            updateFilters({
                searchTerm: value,
                currentPage: 1
            });
        },
        category: (value: string) => {
            updateFilters({
                selectedCategory: value,
                currentPage: 1
            });
        },
        availability: (value: string) => {
            updateFilters({
                availabilityFilter: value,
                currentPage: 1
            });
        },
    };

    const handleReset = () => {
        router.push('/menu');
    };

    const handlePageChange = (page: number) => {
        updateFilters({ currentPage: page });
    };

    const handleViewItem = (item: MenuItem) => {
        setSelectedItem(item);
        setShowDetailDialog(true);
    };

    const handleEditItem = (item: MenuItem) => {
        setSelectedItem(item);
        setShowEditDialog(true);
    };

    const handleDeleteItem = (item: MenuItem) => {
        setSelectedItem(item);
        setShowDeleteDialog(true);
    };

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto">
            <MenuHeader onAddClick={() => setShowCreateDialog(true)} />

            <MenuStats />

            <MenuFilters
                searchTerm={filters.searchTerm}
                selectedCategory={filters.selectedCategory}
                availabilityFilter={filters.availabilityFilter}
                categories={categories}
                viewMode={viewMode}
                sortField={filters.sortField}
                sortOrder={filters.sortOrder}
                onSearchChange={handleFilterChange.search}
                onCategoryChange={handleFilterChange.category}
                onAvailabilityChange={handleFilterChange.availability}
                onViewModeChange={setViewMode}
                onSort={handleSort}
                onReset={handleReset}
            />

            {viewMode === 'list' ? (
                <MenuItemsTable
                    menuItems={menuItems}
                    loading={loading}
                    totalItems={totalItems}
                    sortField={filters.sortField}
                    sortOrder={filters.sortOrder}
                    onView={handleViewItem}
                    onEdit={handleEditItem}
                    onDelete={handleDeleteItem}
                    onToggleAvailability={handleToggleAvailability}
                    onSort={handleSort}
                />
            ) : (
                <MenuItemsGrid
                    menuItems={menuItems}
                    loading={loading}
                    onView={handleViewItem}
                    onEdit={handleEditItem}
                    onDelete={handleDeleteItem}
                    onToggleAvailability={handleToggleAvailability}
                />
            )}

            {!loading && menuItems.length > 0 && (
                <MenuPagination
                    currentPage={filters.currentPage}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    itemsPerPage={filters.itemsPerPage}
                    onPageChange={handlePageChange}
                    onItemsPerPageChange={handleItemsPerPageChange}
                />
            )}

            <MenuDialogs
                showCreateDialog={showCreateDialog}
                showEditDialog={showEditDialog}
                showDetailDialog={showDetailDialog}
                showDeleteDialog={showDeleteDialog}
                selectedItem={selectedItem}
                categories={categories}
                onCreateDialogChange={setShowCreateDialog}
                onEditDialogChange={setShowEditDialog}
                onDetailDialogChange={setShowDetailDialog}
                onDeleteDialogChange={setShowDeleteDialog}
                onCreateSubmit={handleCreate}
                onUpdateSubmit={handleUpdate}
                onDeleteConfirm={handleDelete}
                onClearSelection={() => setSelectedItem(null)}
            />
        </div>
    );
}
