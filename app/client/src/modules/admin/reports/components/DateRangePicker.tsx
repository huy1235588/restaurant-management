'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CalendarIcon } from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { DateRange, DateRangePreset } from '../types';

interface DateRangePickerProps {
    value: DateRange;
    onChange: (value: DateRange) => void;
}

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
    const { t, i18n } = useTranslation();
    const locale = i18n.language === 'vi' ? vi : enUS;
    const [isOpen, setIsOpen] = useState(false);

    const presets: { label: string; value: DateRangePreset }[] = [
        { label: t('reports.today'), value: 'today' },
        { label: t('reports.last7Days'), value: 'week' },
        { label: t('reports.last30Days'), value: 'month' },
        { label: t('reports.custom'), value: 'custom' },
    ];

    const handlePresetChange = (preset: DateRangePreset) => {
        const today = new Date();
        let startDate: Date;
        let endDate: Date = today;

        switch (preset) {
            case 'today':
                startDate = today;
                break;
            case 'week':
                startDate = subDays(today, 6);
                break;
            case 'month':
                startDate = subDays(today, 29);
                break;
            default:
                // Keep current dates for custom
                return onChange({ ...value, preset });
        }

        onChange({
            startDate: format(startDate, 'yyyy-MM-dd'),
            endDate: format(endDate, 'yyyy-MM-dd'),
            preset,
        });
    };

    const handleDateSelect = (range: { from?: Date; to?: Date } | undefined) => {
        if (range?.from && range?.to) {
            onChange({
                startDate: format(range.from, 'yyyy-MM-dd'),
                endDate: format(range.to, 'yyyy-MM-dd'),
                preset: 'custom',
            });
        }
    };

    const displayText = () => {
        if (value.preset === 'today') {
            return t('reports.today');
        }
        if (value.preset === 'week') {
            return t('reports.last7Days');
        }
        if (value.preset === 'month') {
            return t('reports.last30Days');
        }
        
        const start = format(new Date(value.startDate), 'dd/MM/yyyy', { locale });
        const end = format(new Date(value.endDate), 'dd/MM/yyyy', { locale });
        return `${start} - ${end}`;
    };

    return (
        <div className="flex items-center gap-2">
            <Select value={value.preset} onValueChange={handlePresetChange}>
                <SelectTrigger className="w-[140px]">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {presets.map((preset) => (
                        <SelectItem key={preset.value} value={preset.value}>
                            {preset.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {value.preset === 'custom' && (
                <Popover open={isOpen} onOpenChange={setIsOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className={cn(
                                'justify-start text-left font-normal',
                                !value.startDate && 'text-muted-foreground'
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {displayText()}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={new Date(value.startDate)}
                            selected={{
                                from: new Date(value.startDate),
                                to: new Date(value.endDate),
                            }}
                            onSelect={handleDateSelect}
                            numberOfMonths={2}
                            locale={locale}
                        />
                    </PopoverContent>
                </Popover>
            )}
        </div>
    );
}
