'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  totalCount,
  limit,
  onPageChange,
}: PaginationProps) {
  const startItem = (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, totalCount);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const showPages = 5;

    if (totalPages <= showPages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (totalPages <= 1) {
    return (
      <div className="text-sm text-muted-300 text-center py-3 font-medium">
        Mostrando {totalCount} {totalCount === 1 ? 'lead' : 'leads'}
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 bg-surface-400 rounded-2xl px-5 shadow-card border border-[#262626]">
      {/* Info */}
      <div className="text-sm text-muted-200">
        Mostrando <span className="font-semibold text-white">{startItem}-{endItem}</span> de <span className="font-semibold text-white">{totalCount}</span> leads
      </div>

      {/* Page navigation */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={clsx(
            'p-2 rounded-xl transition-all duration-200',
            currentPage === 1
              ? 'text-muted-500 cursor-not-allowed'
              : 'text-muted-200 hover:bg-surface-50 hover:text-white'
          )}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {getPageNumbers().map((page, index) =>
          typeof page === 'number' ? (
            <button
              key={index}
              onClick={() => onPageChange(page)}
              className={clsx(
                'min-w-[38px] h-10 rounded-xl text-sm font-semibold transition-all duration-200',
                page === currentPage
                  ? 'bg-gradient-to-r from-brand-500 to-brand-400 text-white shadow-glow'
                  : 'text-muted-200 hover:bg-surface-50 hover:text-white'
              )}
            >
              {page}
            </button>
          ) : (
            <span key={index} className="px-1 text-muted-500 select-none">
              ···
            </span>
          )
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={clsx(
            'p-2 rounded-xl transition-all duration-200',
            currentPage === totalPages
              ? 'text-muted-500 cursor-not-allowed'
              : 'text-muted-200 hover:bg-surface-50 hover:text-white'
          )}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
