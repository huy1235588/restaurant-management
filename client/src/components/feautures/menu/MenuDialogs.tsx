import { useTranslation } from 'react-i18next';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
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
import { MenuItemForm } from './MenuItemForm';
import { MenuItemDetail } from './MenuItemDetail';
import { MenuItem, Category } from '@/types';

interface MenuDialogsProps {
    // Dialog states
    showCreateDialog: boolean;
    showEditDialog: boolean;
    showDetailDialog: boolean;
    showDeleteDialog: boolean;
    
    // Data
    selectedItem: MenuItem | null;
    categories: Category[];
    
    // Handlers
    onCreateDialogChange: (open: boolean) => void;
    onEditDialogChange: (open: boolean) => void;
    onDetailDialogChange: (open: boolean) => void;
    onDeleteDialogChange: (open: boolean) => void;
    
    onCreateSubmit: (data: Partial<MenuItem>) => Promise<void>;
    onUpdateSubmit: (data: Partial<MenuItem>) => Promise<void>;
    onDeleteConfirm: () => Promise<void>;
    onClearSelection: () => void;
}

export function MenuDialogs({
    showCreateDialog,
    showEditDialog,
    showDetailDialog,
    showDeleteDialog,
    selectedItem,
    categories,
    onCreateDialogChange,
    onEditDialogChange,
    onDetailDialogChange,
    onDeleteDialogChange,
    onCreateSubmit,
    onUpdateSubmit,
    onDeleteConfirm,
    onClearSelection,
}: MenuDialogsProps) {
    const { t } = useTranslation();

    return (
        <>
            {/* Create Dialog */}
            <Dialog open={showCreateDialog} onOpenChange={onCreateDialogChange}>
                <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{t('menu.createItem', 'Create Menu Item')}</DialogTitle>
                        <DialogDescription>
                            {t('menu.createDescription', 'Add a new item to your menu')}
                        </DialogDescription>
                    </DialogHeader>
                    <MenuItemForm
                        categories={categories}
                        onSubmit={onCreateSubmit}
                        onCancel={() => onCreateDialogChange(false)}
                    />
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={showEditDialog} onOpenChange={onEditDialogChange}>
                <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{t('menu.editItem', 'Edit Menu Item')}</DialogTitle>
                        <DialogDescription>
                            {t('menu.editDescription', 'Update menu item information')}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedItem && (
                        <MenuItemForm
                            item={selectedItem}
                            categories={categories}
                            onSubmit={onUpdateSubmit}
                            onCancel={() => {
                                onEditDialogChange(false);
                                onClearSelection();
                            }}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* Detail Dialog */}
            <Dialog open={showDetailDialog} onOpenChange={onDetailDialogChange}>
                <DialogContent className="sm:max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>{t('menu.itemDetails', 'Menu Item Details')}</DialogTitle>
                    </DialogHeader>
                    {selectedItem && (
                        <MenuItemDetail
                            item={selectedItem}
                            onClose={() => {
                                onDetailDialogChange(false);
                                onClearSelection();
                            }}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={onDeleteDialogChange}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {t('menu.deleteConfirmTitle', 'Delete Menu Item?')}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {t(
                                'menu.deleteConfirmDescription',
                                'Are you sure you want to delete this menu item? This action cannot be undone.'
                            )}
                            {selectedItem && (
                                <div className="mt-3 p-3 bg-muted rounded-md">
                                    <p className="font-medium text-foreground">
                                        {selectedItem.itemName}
                                    </p>
                                    <p className="text-sm mt-1">{selectedItem.itemCode}</p>
                                </div>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={onClearSelection}>
                            {t('common.cancel', 'Cancel')}
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={onDeleteConfirm}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {t('common.delete', 'Delete')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
