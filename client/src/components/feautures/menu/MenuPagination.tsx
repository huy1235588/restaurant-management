import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface MenuPaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
}

export function MenuPagination({
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    onPageChange,
}: MenuPaginationProps) {
    const { t } = useTranslation();

    if (totalPages <= 1) return null;

    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    const renderPageNumbers = () => {
        const pages = [];
        const showPages = 3;
        let startPage = Math.max(1, currentPage - Math.floor(showPages / 2));
        let endPage = Math.min(totalPages, startPage + showPages - 1);

        if (endPage - startPage + 1 < showPages) {
            startPage = Math.max(1, endPage - showPages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <Button
                    key={i}
                    variant={currentPage === i ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onPageChange(i)}
                    className="min-w-10"
                >
                    {i}
                </Button>
            );
        }

        return pages;
    };

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t">
            <div className="text-sm text-muted-foreground">
                {t('menu.showing', 'Showing')} <span className="font-medium">{startItem}</span> -{' '}
                <span className="font-medium">{endItem}</span> {t('menu.of', 'of')}{' '}
                <span className="font-medium">{totalItems}</span> {t('menu.items', 'items')}
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
                <div className="hidden sm:flex gap-1">{renderPageNumbers()}</div>
                <div className="sm:hidden px-3 py-1 text-sm">
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
