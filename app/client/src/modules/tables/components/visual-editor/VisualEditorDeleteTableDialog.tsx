'use client';

import React from 'react';
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

interface DeleteTableDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    tableNumbers: string[];
}

export function VisualEditorDeleteTableDialog({
    open,
    onOpenChange,
    onConfirm,
    tableNumbers,
}: DeleteTableDialogProps) {
    const handleConfirm = () => {
        onConfirm();
        onOpenChange(false);
    };
    
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Table{tableNumbers.length > 1 ? 's' : ''}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {tableNumbers.length === 1 ? (
                            <>Are you sure you want to delete table <strong>{tableNumbers[0]}</strong>?</>
                        ) : (
                            <>Are you sure you want to delete <strong>{tableNumbers.length} tables</strong>?</>
                        )}
                        <br />
                        This action cannot be undone, but you can use Undo (Ctrl+Z) to restore them.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleConfirm}
                        className="bg-red-600 hover:bg-red-700 text-white"
                    >
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
