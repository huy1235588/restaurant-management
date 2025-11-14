import { Table } from '@/types';
import { CreateTableDialog } from './dialogs/single/CreateTableDialog';
import { EditTableDialog } from './dialogs/single/EditTableDialog';
import { StatusChangeDialog } from './dialogs/single/StatusChangeDialog';
import { DeleteTableDialog } from './dialogs/single/DeleteTableDialog';
import { QRCodeDialog } from './dialogs/single/QRCodeDialog';

interface TableDialogsProps {
    showCreateDialog: boolean;
    showEditDialog: boolean;
    showStatusDialog: boolean;
    showDeleteDialog: boolean;
    showQRDialog: boolean;
    selectedTable: Table | null;
    onClose: () => void;
    onSuccess: () => void;
}

export function TableDialogs({
    showCreateDialog,
    showEditDialog,
    showStatusDialog,
    showDeleteDialog,
    showQRDialog,
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
                    <QRCodeDialog
                        open={showQRDialog}
                        table={selectedTable}
                        onClose={onClose}
                    />
                </>
            )}
        </>
    );
}
