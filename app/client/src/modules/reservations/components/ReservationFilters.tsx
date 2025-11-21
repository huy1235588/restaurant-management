import { useState, useEffect } from 'react';
import { ReservationStatus } from '../types';
import { Search, Filter, X, ChevronDown, Calendar } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

interface ReservationFiltersProps {
    onFilterChange: (filters: {
        status?: ReservationStatus;
        date?: string;
        search?: string;
    }) => void;
}

export function ReservationFilters({ onFilterChange }: ReservationFiltersProps) {
    const searchParams = useSearchParams();
    
    const [status, setStatus] = useState<ReservationStatus | ''>(() => 
        (searchParams.get('status') as ReservationStatus) || ''
    );
    const [date, setDate] = useState(() => searchParams.get('date') || '');
    const [search, setSearch] = useState(() => searchParams.get('search') || '');
    // Local input state used for debouncing before committing to filters
    const [searchInput, setSearchInput] = useState(() => searchParams.get('search') || '');
    const [showFilters, setShowFilters] = useState(false);

    // Debounce committing the search value to filters to avoid rapid refetches
    useEffect(() => {
        // Only commit if changed
        if (searchInput === search) return;
        const timeout = setTimeout(() => {
            setSearch(searchInput);
            onFilterChange({
                status: status || undefined,
                date: date || undefined,
                search: searchInput || undefined,
            });
        }, 1000); // 1000 debounce window
        return () => clearTimeout(timeout);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchInput]);

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
        setSearchInput(newSearch);
    };

    const clearFilters = () => {
        setStatus('');
        setDate('');
        setSearch('');
        onFilterChange({});
    };

    const hasActiveFilters = status || date || search;
    const activeFilterCount = [status, date, search].filter(Boolean).length;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="p-4">
                {/* Search Bar */}
                <div className="flex gap-3">
                    {/* Search Input */}
                    <div className="flex-1 relative group">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search by name, phone, or code..."
                            value={searchInput}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all text-sm font-medium placeholder:text-gray-400 dark:placeholder:text-gray-500 hover:border-gray-400 dark:hover:border-gray-500"
                        />
                        {searchInput && (
                            <button
                                onClick={() => {
                                    setSearchInput('');
                                    setSearch('');
                                    onFilterChange({
                                        status: status || undefined,
                                        date: date || undefined,
                                        search: undefined,
                                    });
                                }}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                            >
                                <X className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                            </button>
                        )}
                    </div>

                    {/* Filter Toggle Button */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`relative px-5 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${showFilters || hasActiveFilters
                                ? 'bg-linear-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 text-white shadow-lg shadow-blue-500/30 dark:shadow-blue-400/20 hover:shadow-xl hover:shadow-blue-500/40 dark:hover:shadow-blue-400/30'
                                : 'bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500'
                            }`}
                    >
                        <Filter className="w-5 h-5" />
                        <span className="hidden sm:inline">Filters</span>
                        {activeFilterCount > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-red-500 dark:bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg ring-2 ring-white dark:ring-gray-800">
                                {activeFilterCount}
                            </span>
                        )}
                        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Clear Filters Button */}
                    {hasActiveFilters && (
                        <button
                            onClick={clearFilters}
                            className="px-5 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-red-300 dark:hover:border-red-600 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-700 dark:hover:text-red-300 transition-all duration-300 font-semibold flex items-center gap-2 group"
                        >
                            <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                            <span className="hidden sm:inline">Clear</span>
                        </button>
                    )}
                </div>

                {/* Filter Panel */}
                <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${showFilters ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'
                        }`}
                >
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Status Filter */}
                            <div>
                                <label className="flex text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 items-center gap-2">
                                    <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                                    Status
                                </label>
                                <div className="relative">
                                    <select
                                        value={status}
                                        onChange={(e) => handleStatusChange(e.target.value as ReservationStatus | '')}
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all text-sm font-medium appearance-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 hover:border-gray-400 dark:hover:border-gray-500 cursor-pointer"
                                    >
                                        <option value="">All Statuses</option>
                                        <option value="pending">⏳ Pending</option>
                                        <option value="confirmed">✅ Confirmed</option>
                                        <option value="seated">👥 Seated</option>
                                        <option value="completed">✔️ Completed</option>
                                        <option value="cancelled">❌ Cancelled</option>
                                        <option value="no_show">⚠️ No Show</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 pointer-events-none" />
                                </div>
                            </div>

                            {/* Date Filter */}
                            <div>
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                    <div className="w-2 h-2 bg-purple-600 dark:bg-purple-400 rounded-full"></div>
                                    Date
                                </label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 pointer-events-none" />
                                    <input
                                        type="date"
                                        value={date}
                                        onChange={(e) => handleDateChange(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all text-sm font-medium bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 hover:border-gray-400 dark:hover:border-gray-500 cursor-pointer"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Active Filters Summary */}
                        {hasActiveFilters && (
                            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-xl">
                                <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">Active Filters:</p>
                                <div className="flex flex-wrap gap-2">
                                    {status && (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-gray-900 text-blue-700 dark:text-blue-300 rounded-full text-xs font-semibold border border-blue-200 dark:border-blue-700 shadow-sm">
                                            Status: {status}
                                            <button
                                                onClick={() => handleStatusChange('')}
                                                className="hover:bg-blue-100 dark:hover:bg-blue-900 rounded-full p-0.5 transition-colors"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    )}
                                    {date && (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-gray-900 text-purple-700 dark:text-purple-300 rounded-full text-xs font-semibold border border-purple-200 dark:border-purple-700 shadow-sm">
                                            Date: {date}
                                            <button
                                                onClick={() => handleDateChange('')}
                                                className="hover:bg-purple-100 dark:hover:bg-purple-900 rounded-full p-0.5 transition-colors"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    )}
                                    {search && (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-gray-900 text-green-700 dark:text-green-300 rounded-full text-xs font-semibold border border-green-200 dark:border-green-700 shadow-sm">
                                            Search: &quot;{search}&quot;
                                            <button
                                                onClick={() => handleSearchChange('')}
                                                className="hover:bg-green-100 dark:hover:bg-green-900 rounded-full p-0.5 transition-colors"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}