'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  className?: string;
  onPageChange?: (page: number) => void;
  showInfo?: boolean;
  maxVisiblePages?: number;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  className,
  onPageChange,
  showInfo = true,
  maxVisiblePages = 7,
}: PaginationProps) {
  const t = useTranslations('navigation.pagination');
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;

    if (onPageChange) {
      onPageChange(page);
    } else {
      // Update URL with new page
      const params = new URLSearchParams(searchParams.toString());
      const offset = (page - 1) * itemsPerPage;

      if (offset > 0) {
        params.set('offset', offset.toString());
      } else {
        params.delete('offset');
      }

      router.push(`${window.location.pathname}?${params.toString()}`);
    }
  };

  // Generate page numbers to display
  const generatePageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      const startPage = Math.max(2, currentPage - Math.floor((maxVisiblePages - 3) / 2));
      const endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 4);

      // Add ellipsis after first page if needed
      if (startPage > 2) {
        pages.push('ellipsis');
      }

      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      // Add ellipsis before last page if needed
      if (endPage < totalPages - 1) {
        pages.push('ellipsis');
      }

      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = generatePageNumbers();
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  if (totalPages <= 1) {
    return showInfo ? (
      <div className={cn('flex justify-center text-sm text-muted-foreground', className)}>
        {t('showing')} {totalItems} {totalItems !== 1 ? t('items') : t('item')}
      </div>
    ) : null;
  }

  return (
    <div
      className={cn(
        'flex flex-col items-center space-y-4 sm:flex-row sm:justify-between sm:space-y-0',
        className
      )}
    >
      {/* Pagination Info */}
      {showInfo && (
        <div className="text-sm text-muted-foreground">
          {t('showing')} {startItem} {t('to')} {endItem} {t('of')} {totalItems} {t('results')}
        </div>
      )}

      {/* Pagination Controls */}
      <div className="flex items-center space-x-1">
        {/* Previous Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="flex items-center space-x-1"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">{t('previous')}</span>
        </Button>

        {/* Page Numbers */}
        <div className="flex items-center space-x-1">
          {pageNumbers.map((page, index) =>
            page === 'ellipsis' ? (
              <div key={`ellipsis-${index}`} className="px-2">
                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
              </div>
            ) : (
              <Button
                key={page}
                variant={page === currentPage ? 'default' : 'outline'}
                size="sm"
                onClick={() => handlePageChange(page)}
                className={cn('min-w-[2.5rem]', page === currentPage && 'pointer-events-none')}
              >
                {page}
              </Button>
            )
          )}
        </div>

        {/* Next Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="flex items-center space-x-1"
        >
          <span className="hidden sm:inline">{t('next')}</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// Utility function to calculate pagination from offset/limit
export function calculatePagination(offset: number, limit: number, total: number) {
  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(total / limit);

  return {
    currentPage,
    totalPages,
    totalItems: total,
    itemsPerPage: limit,
  };
}
