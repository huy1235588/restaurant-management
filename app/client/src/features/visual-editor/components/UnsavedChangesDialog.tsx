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

interface UnsavedChangesDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSaveAndSwitch: () => void;
    onDiscardAndSwitch: () => void;
}

export function UnsavedChangesDialog({
    open,
    onOpenChange,
    onSaveAndSwitch,
    onDiscardAndSwitch,
}: UnsavedChangesDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
                    <AlertDialogDescription>
                        You have unsaved changes on this floor. What would you like to do?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => onOpenChange(false)}>
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction 
                        onClick={onDiscardAndSwitch}
                        className="bg-red-600 hover:bg-red-700 text-white"
                    >
                        Discard Changes
                    </AlertDialogAction>
                    <AlertDialogAction onClick={onSaveAndSwitch}>
                        Save & Switch
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
