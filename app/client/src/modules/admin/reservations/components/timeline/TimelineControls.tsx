'use client';

import { useTranslation } from 'react-i18next';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toDateString, addDays, formatDate } from './timeline.utils';

interface TimelineControlsProps {
    selectedDate: Date;
    onDateChange: (date: Date) => void;
    floors: number[];
    selectedFloor: number | null;
    onFloorChange: (floor: number | null) => void;
}

/**
 * TimelineControls - Date picker, navigation, and floor filter
 */
export function TimelineControls({
    selectedDate,
    onDateChange,
    floors,
    selectedFloor,
    onFloorChange,
}: TimelineControlsProps) {
    const { t } = useTranslation();

    const handlePrevDay = () => {
        onDateChange(addDays(selectedDate, -1));
    };

    const handleNextDay = () => {
        onDateChange(addDays(selectedDate, 1));
    };

    const handleToday = () => {
        onDateChange(new Date());
    };

    const handleDateInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const date = new Date(e.target.value);
        if (!isNaN(date.getTime())) {
            onDateChange(date);
        }
    };

    const handleFloorSelect = (value: string) => {
        onFloorChange(value === 'all' ? null : parseInt(value, 10));
    };

    return (
        <div className="flex items-center justify-between gap-4 flex-wrap">
            {/* Date Navigation */}
            <div className="flex items-center gap-2">
                {/* Previous Day */}
                <Button
                    variant="outline"
                    size="icon"
                    onClick={handlePrevDay}
                    title={t('common.previous')}
                >
                    <ChevronLeft className="w-4 h-4" />
                </Button>

                {/* Date Picker */}
                <div className="relative">
                    <Input
                        type="date"
                        value={toDateString(selectedDate)}
                        onChange={handleDateInput}
                        className="w-[160px] pl-9"
                    />
                    <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>

                {/* Next Day */}
                <Button
                    variant="outline"
                    size="icon"
                    onClick={handleNextDay}
                    title={t('common.next')}
                >
                    <ChevronRight className="w-4 h-4" />
                </Button>

                {/* Today Button */}
                <Button variant="outline" onClick={handleToday}>
                    {t('common.today')}
                </Button>

                {/* Date Display */}
                <span className="text-sm text-gray-600 dark:text-gray-400 hidden sm:inline">
                    {formatDate(selectedDate)}
                </span>
            </div>

            {/* Floor Filter */}
            {floors.length > 1 && (
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                        {t('reservations.timeline.floor')}:
                    </span>
                    <Select
                        value={selectedFloor?.toString() ?? 'all'}
                        onValueChange={handleFloorSelect}
                    >
                        <SelectTrigger className="w-[140px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">
                                {t('reservations.timeline.allFloors')}
                            </SelectItem>
                            {floors.map((floor) => (
                                <SelectItem key={floor} value={floor.toString()}>
                                    {t('reservations.timeline.floorN', { n: floor })}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}
        </div>
    );
}
