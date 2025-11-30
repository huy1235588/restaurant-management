'use client';

import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

interface StaffSearchProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export function StaffSearch({ value, onChange, placeholder }: StaffSearchProps) {
    const { t } = useTranslation();

    return (
        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder || t('staff.searchPlaceholder')}
                className="pl-9 pr-9 w-full md:w-[300px]"
            />
            {value && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                    onClick={() => onChange('')}
                >
                    <X className="w-4 h-4" />
                </Button>
            )}
        </div>
    );
}
