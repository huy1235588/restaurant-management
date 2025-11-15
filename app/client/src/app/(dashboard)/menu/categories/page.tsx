'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Category } from '@/types';
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
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';
import {
    CategoryList,
    CategoryForm,
    useCategories,
    useCreateCategory,
    useUpdateCategory,
    useDeleteCategory,
} from '@/features/menu';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function CategoriesPage() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<boolean | undefined>(undefined);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

    const { categories, loading, error, refetch } = useCategories({ isActive: statusFilter });
    const { createCategory, loading: creating } = useCreateCategory();
    const { updateCategory, loading: updating } = useUpdateCategory();
    const { deleteCategory, loading: deleting } = useDeleteCategory();

    // Filter categories by search query
    const filteredCategories = categories.filter((category) =>
        category.categoryName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Statistics
    const stats = {
        total: categories.length,
        active: categories.filter((c) => c.isActive).length,
        inactive: categories.filter((c) => !c.isActive).length,
    };

    const handleCreate = async (data: any) => {
        try {
            await createCategory(data);
            toast.success('Category created successfully');
            setCreateDialogOpen(false);
            refetch();
        } catch (error: any) {
            toast.error(error.message || 'Failed to create category');
        }
    };

    const handleUpdate = async (data: any) => {
        if (!selectedCategory) return;

        try {
            await updateCategory(selectedCategory.categoryId, data);
            toast.success('Category updated successfully');
            setEditDialogOpen(false);
            setSelectedCategory(null);
            refetch();
        } catch (error: any) {
            toast.error(error.message || 'Failed to update category');
        }
    };

    const handleDelete = async () => {
        if (!selectedCategory) return;

        // Check if category has items
        if (selectedCategory.menuItems && selectedCategory.menuItems.length > 0) {
            toast.error(
                `Cannot delete category with ${selectedCategory.menuItems.length} menu items. Please move or delete the items first.`
            );
            return;
        }

        try {
            await deleteCategory(selectedCategory.categoryId);
            toast.success('Category deleted successfully');
            setDeleteDialogOpen(false);
            setSelectedCategory(null);
            refetch();
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete category');
        }
    };

    const handleEdit = (category: Category) => {
        setSelectedCategory(category);
        setEditDialogOpen(true);
    };

    const handleDeleteClick = (category: Category) => {
        setSelectedCategory(category);
        setDeleteDialogOpen(true);
    };

    const handleViewDetails = (category: Category) => {
        router.push(`/menu/categories/${category.categoryId}`);
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Menu Categories</h1>
                    <p className="text-muted-foreground mt-1">
                        Organize your menu items into categories
                    </p>
                </div>
                <Button onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Category
                </Button>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                    <div className="text-sm text-muted-foreground">Total Categories</div>
                    <div className="text-2xl font-bold mt-1">{stats.total}</div>
                </div>
                <div className="p-4 border rounded-lg">
                    <div className="text-sm text-muted-foreground">Active</div>
                    <div className="text-2xl font-bold mt-1 text-green-600">{stats.active}</div>
                </div>
                <div className="p-4 border rounded-lg">
                    <div className="text-sm text-muted-foreground">Inactive</div>
                    <div className="text-2xl font-bold mt-1 text-gray-600">{stats.inactive}</div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search categories..."
                        className="pl-9"
                    />
                </div>
                <Select
                    value={
                        statusFilter === undefined ? 'all' : statusFilter ? 'active' : 'inactive'
                    }
                    onValueChange={(value) => {
                        if (value === 'all') setStatusFilter(undefined);
                        else if (value === 'active') setStatusFilter(true);
                        else setStatusFilter(false);
                    }}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Category List */}
            <CategoryList
                categories={filteredCategories}
                loading={loading}
                error={error}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
                onViewDetails={handleViewDetails}
            />

            {/* Create Dialog */}
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Create New Category</DialogTitle>
                    </DialogHeader>
                    <CategoryForm
                        onSubmit={handleCreate}
                        onCancel={() => setCreateDialogOpen(false)}
                        loading={creating}
                    />
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Category</DialogTitle>
                    </DialogHeader>
                    <CategoryForm
                        category={selectedCategory}
                        onSubmit={handleUpdate}
                        onCancel={() => {
                            setEditDialogOpen(false);
                            setSelectedCategory(null);
                        }}
                        loading={updating}
                    />
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Category</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete "{selectedCategory?.categoryName}"?
                            {selectedCategory?.menuItems && selectedCategory.menuItems.length > 0 ? (
                                <span className="block mt-2 text-destructive font-medium">
                                    This category has {selectedCategory.menuItems.length} menu items.
                                    You cannot delete a category with items.
                                </span>
                            ) : (
                                <span className="block mt-2">
                                    This action cannot be undone.
                                </span>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            onClick={() => {
                                setDeleteDialogOpen(false);
                                setSelectedCategory(null);
                            }}
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={
                                deleting ||
                                (selectedCategory?.menuItems &&
                                    selectedCategory.menuItems.length > 0)
                            }
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
