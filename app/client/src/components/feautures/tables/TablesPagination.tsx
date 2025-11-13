import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface TablesPaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    onItemsPerPageChange?: (itemsPerPage: number) => void;
}

export function TablesPagination({
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    onPageChange,
    onItemsPerPageChange,
}: TablesPaginationProps) {
    const { t } = useTranslation();

    if (totalPages <= 1) {
        return null;
    }

    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    const renderPageNumbers = () => {
        const pages = [];
        const visiblePages = 3;
        let startPage = Math.max(1, currentPage - Math.floor(visiblePages / 2));
        let endPage = Math.min(totalPages, startPage + visiblePages - 1);

        if (endPage - startPage + 1 < visiblePages) {
            startPage = Math.max(1, endPage - visiblePages + 1);
        }

        for (let page = startPage; page <= endPage; page += 1) {
            pages.push(
                <Button
                    key={page}
                    variant={currentPage === page ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onPageChange(page)}
                    className="px-3"
                >
                    {page}
                </Button>
            );
        }

        return pages;
    };

    return (
        <div className="mt-6 flex flex-col items-center justify-between gap-4 border-t pt-4 sm:flex-row">
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span>
                    {t('tables.pagination.showing', 'Showing')} <span className="font-medium">{startItem}</span> -{' '}
                    <span className="font-medium">{endItem}</span> {t('tables.pagination.of', 'of')}{' '}
                    <span className="font-medium">{totalItems}</span> {t('tables.pagination.tables', 'tables')}
                </span>
                {onItemsPerPageChange && (
                    <div className="flex items-center gap-2">
                        <span>{t('tables.pagination.perPage', 'Per page')}:</span>
                        <Select value={itemsPerPage.toString()} onValueChange={(value) => onItemsPerPageChange(parseInt(value, 10))}>
                            <SelectTrigger className="h-9 w-20">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="20">20</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                                <SelectItem value="100">100</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                )}
            </div>
            <div className="flex items-center gap-1">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(1)}
                    disabled={currentPage === 1}
                    className="hidden sm:flex"
                >
                    <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="ml-1 hidden sm:inline">{t('common.previous', 'Previous')}</span>
                </Button>
                <div className="hidden gap-1 sm:flex">{renderPageNumbers()}</div>
                <div className="px-3 py-1 text-sm sm:hidden">
                    {currentPage} / {totalPages}
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                >
                    <span className="mr-1 hidden sm:inline">{t('common.next', 'Next')}</span>
                    <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className="hidden sm:flex"
                >
                    <ChevronsRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
