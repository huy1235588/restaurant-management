'use client';

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface QuickCreateTableDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    position: { x: number; y: number };
    onCreateTable: (data: {
        tableNumber: string;
        capacity: number;
        shape: 'circle' | 'square' | 'rectangle' | 'oval';
        x: number;
        y: number;
    }) => void;
    existingTableNumbers: string[];
}

export function QuickCreateTableDialog({
    open,
    onOpenChange,
    position,
    onCreateTable,
    existingTableNumbers,
}: QuickCreateTableDialogProps) {
    const [tableNumber, setTableNumber] = useState('');
    const [capacity, setCapacity] = useState('4');
    const [shape, setShape] = useState<'circle' | 'square' | 'rectangle' | 'oval'>('circle');
    
    // Auto-generate next table number
    useEffect(() => {
        if (open) {
            const numbers = existingTableNumbers
                .map(num => parseInt(num.replace(/\D/g, '')))
                .filter(num => !isNaN(num));
            
            const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 0;
            setTableNumber(`T${maxNumber + 1}`);
        }
    }, [open, existingTableNumbers]);
    
    const handleCreate = () => {
        if (!tableNumber.trim()) {
            return;
        }
        
        onCreateTable({
            tableNumber: tableNumber.trim(),
            capacity: parseInt(capacity) || 4,
            shape,
            x: position.x,
            y: position.y,
        });
        
        onOpenChange(false);
    };
    
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleCreate();
        }
    };
    
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create New Table</DialogTitle>
                    <DialogDescription>
                        Add a new table at position ({Math.round(position.x)}, {Math.round(position.y)})
                    </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="tableNumber" className="text-right">
                            Table Number
                        </Label>
                        <Input
                            id="tableNumber"
                            value={tableNumber}
                            onChange={(e) => setTableNumber(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="col-span-3"
                            autoFocus
                        />
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="capacity" className="text-right">
                            Capacity
                        </Label>
                        <Input
                            id="capacity"
                            type="number"
                            min="1"
                            max="20"
                            value={capacity}
                            onChange={(e) => setCapacity(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="col-span-3"
                        />
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="shape" className="text-right">
                            Shape
                        </Label>
                        <Select value={shape} onValueChange={(value: any) => setShape(value)}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="circle">Circle</SelectItem>
                                <SelectItem value="square">Square</SelectItem>
                                <SelectItem value="rectangle">Rectangle</SelectItem>
                                <SelectItem value="oval">Oval</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleCreate}>
                        Create Table
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
