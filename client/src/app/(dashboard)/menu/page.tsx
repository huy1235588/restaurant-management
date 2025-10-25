'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { menuApi, categoryApi } from '@/services/menu.service';
import { MenuItem, Category } from '@/types';
import { MenuHeader } from '@/components/feautures/menu/MenuHeader';
import { MenuStats } from '@/components/feautures/menu/MenuStats';
import { MenuFilters } from '@/components/feautures/menu/MenuFilters';
import { MenuItemsTable } from '@/components/feautures/menu/MenuItemsTable';
import { MenuPagination } from '@/components/feautures/menu/MenuPagination';
import { MenuDialogs } from '@/components/feautures/menu/MenuDialogs';

export default function MenuPage() {
    const { t } = useTranslation();
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [availabilityFilter, setAvailabilityFilter] = useState<string>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const itemsPerPage = 10;

    // Dialog states
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [showDetailDialog, setShowDetailDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

    // Load categories
    useEffect(() => {
        loadCategories();
    }, []);

    // Load menu items
    useEffect(() => {
        loadMenuItems();
    }, [currentPage, selectedCategory, availabilityFilter, searchTerm]);

    const loadCategories = async () => {
        try {
            const data = await categoryApi.getAll({ isActive: true });
            setCategories(data);
        } catch (error) {
            console.error('Failed to load categories:', error);
            toast.error(t('menu.loadCategoriesError'));
        }
    };

    const loadMenuItems = async () => {
        try {
            setLoading(true);
            const params: Record<string, string | number | boolean> = {
                page: currentPage,
                limit: itemsPerPage,
            };

            if (searchTerm) params.search = searchTerm;
            if (selectedCategory !== 'all') params.categoryId = parseInt(selectedCategory);
            if (availabilityFilter !== 'all') params.isAvailable = availabilityFilter === 'available';

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

    const handleFilterChange = {
        search: (value: string) => {
            setSearchTerm(value);
            setCurrentPage(1);
        },
        category: (value: string) => {
            setSelectedCategory(value);
            setCurrentPage(1);
        },
        availability: (value: string) => {
            setAvailabilityFilter(value);
            setCurrentPage(1);
        },
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
        <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
            <MenuHeader onAddClick={() => setShowCreateDialog(true)} />
            
            <MenuStats menuItems={menuItems} categories={categories} />

            <MenuFilters
                searchTerm={searchTerm}
                selectedCategory={selectedCategory}
                availabilityFilter={availabilityFilter}
                categories={categories}
                onSearchChange={handleFilterChange.search}
                onCategoryChange={handleFilterChange.category}
                onAvailabilityChange={handleFilterChange.availability}
            />

            <MenuItemsTable
                menuItems={menuItems}
                loading={loading}
                totalItems={totalItems}
                onView={handleViewItem}
                onEdit={handleEditItem}
                onDelete={handleDeleteItem}
                onToggleAvailability={handleToggleAvailability}
            />

            {!loading && menuItems.length > 0 && (
                <MenuPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
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
