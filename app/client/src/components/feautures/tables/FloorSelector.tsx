import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface FloorSelectorProps {
    floors: number[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
}

export function FloorSelector({ floors, value, onChange, placeholder, disabled }: FloorSelectorProps) {
    const { t } = useTranslation();

    const uniqueFloors = useMemo(() => {
        const sorted = [...new Set(floors)].sort((a, b) => a - b);
        return sorted;
    }, [floors]);

    return (
        <Select value={value} onValueChange={onChange} disabled={disabled}>
            <SelectTrigger className="min-w-40">
                <SelectValue placeholder={placeholder || t('tables.filters.floor', 'Select floor')} />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">{t('tables.filters.allFloors', 'All floors')}</SelectItem>
                {uniqueFloors.map((floor) => (
                    <SelectItem key={floor} value={floor.toString()}>
                        {t('tables.filters.floorNumber', 'Floor {{floor}}', { floor })}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
