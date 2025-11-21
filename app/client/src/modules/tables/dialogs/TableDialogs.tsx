import { Table } from '@/types';
import { CreateTableDialog } from './single/CreateTableDialog';
import { EditTableDialog } from './single/EditTableDialog';
import { StatusChangeDialog } from './single/StatusChangeDialog';
import { DeleteTableDialog } from './single/DeleteTableDialog';

interface TableDialogsProps {
    showCreateDialog: boolean;
    showEditDialog: boolean;
    showStatusDialog: boolean;
    showDeleteDialog: boolean;
    selectedTable: Table | null;
    onClose: () => void;
    onSuccess: () => void;
}

export function TableDialogs({
    showCreateDialog,
    showEditDialog,
    showStatusDialog,
    showDeleteDialog,
    selectedTable,
    onClose,
    onSuccess,
}: TableDialogsProps) {
    return (
        <>
            <CreateTableDialog
                open={showCreateDialog}
                onClose={onClose}
                onSuccess={onSuccess}
            />
            {selectedTable && (
                <>
                    <EditTableDialog
                        open={showEditDialog}
                        table={selectedTable}
                        onClose={onClose}
                        onSuccess={onSuccess}
                    />
                    <StatusChangeDialog
                        open={showStatusDialog}
                        table={selectedTable}
                        onClose={onClose}
                        onSuccess={onSuccess}
                    />
                    <DeleteTableDialog
                        open={showDeleteDialog}
                        table={selectedTable}
                        onClose={onClose}
                        onSuccess={onSuccess}
                    />
                </>
            )}
        </>
    );
}
