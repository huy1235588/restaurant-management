import { useState } from 'react';
import { ReservationStatus } from '../types';
import { Search, Filter, X } from 'lucide-react';

interface ReservationFiltersProps {
    onFilterChange: (filters: {
        status?: ReservationStatus;
        date?: string;
        search?: string;
    }) => void;
}

export function ReservationFilters({ onFilterChange }: ReservationFiltersProps) {
    const [status, setStatus] = useState<ReservationStatus | ''>('');
    const [date, setDate] = useState('');
    const [search, setSearch] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    const handleStatusChange = (newStatus: ReservationStatus | '') => {
        setStatus(newStatus);
        onFilterChange({
            status: newStatus || undefined,
            date: date || undefined,
            search: search || undefined,
        });
    };

    const handleDateChange = (newDate: string) => {
        setDate(newDate);
        onFilterChange({
            status: status || undefined,
            date: newDate || undefined,
            search: search || undefined,
        });
    };

    const handleSearchChange = (newSearch: string) => {
        setSearch(newSearch);
        onFilterChange({
            status: status || undefined,
            date: date || undefined,
            search: newSearch || undefined,
        });
    };

    const clearFilters = () => {
        setStatus('');
        setDate('');
        setSearch('');
        onFilterChange({});
    };

    const hasActiveFilters = status || date || search;

    return (
        <div className="bg-white rounded-lg border shadow-sm p-4">
            {/* Search Bar */}
            <div className="flex gap-2">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name, phone, or code..."
                        value={search}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`px-4 py-2 rounded-lg border font-medium transition-colors ${showFilters || hasActiveFilters
                            ? 'bg-blue-50 border-blue-200 text-blue-700'
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                >
                    <Filter className="w-4 h-4" />
                </button>
                {hasActiveFilters && (
                    <button
                        onClick={clearFilters}
                        className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Filter Panel */}
            {showFilters && (
                <div className="mt-4 pt-4 border-t space-y-4">
                    {/* Status Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Status
                        </label>
                        <select
                            value={status}
                            onChange={(e) => handleStatusChange(e.target.value as ReservationStatus | '')}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="seated">Seated</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="no_show">No Show</option>
                        </select>
                    </div>

                    {/* Date Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Date
                        </label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => handleDateChange(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
