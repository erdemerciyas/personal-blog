import Link from 'next/link';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    createPageUrl: (page: number) => string;
}

export default function Pagination({ currentPage, totalPages, createPageUrl }: PaginationProps) {
    if (totalPages <= 1) return null;

    // Logic to determine which page numbers to show
    const getPageNumbers = () => {
        const delta = 2; // Number of pages to show on each side of current page
        const range = [];
        const rangeWithDots = [];

        for (let i = 1; i <= totalPages; i++) {
            // Show first, last, current, and neighbors
            if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
                range.push(i);
            }
        }

        let l: number | null = null;
        for (const i of range) {
            if (l) {
                if (i - l === 2) {
                    rangeWithDots.push(l + 1);
                } else if (i - l !== 1) {
                    rangeWithDots.push('...');
                }
            }
            rangeWithDots.push(i);
            l = i;
        }

        return rangeWithDots;
    };

    const pages = getPageNumbers();

    return (
        <div className="flex justify-center items-center gap-2 select-none">
            {/* Previous Button */}
            {currentPage > 1 ? (
                <Link
                    href={createPageUrl(currentPage - 1)}
                    className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-emerald-600 transition-colors"
                    aria-label="Önceki Sayfa"
                >
                    <ChevronLeftIcon className="w-5 h-5" />
                </Link>
            ) : (
                <span className="p-2 rounded-lg border border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed">
                    <ChevronLeftIcon className="w-5 h-5" />
                </span>
            )}

            {/* Page Numbers */}
            <div className="flex items-center gap-1">
                {pages.map((p, index) => {
                    if (p === '...') {
                        return (
                            <span key={`dots-${index}`} className="px-2 text-slate-400">
                                ...
                            </span>
                        );
                    }

                    const pageNum = Number(p);
                    const isActive = pageNum === currentPage;

                    return (
                        <Link
                            key={pageNum}
                            href={createPageUrl(pageNum)}
                            className={`min-w-[40px] h-10 flex items-center justify-center rounded-lg border text-sm font-medium transition-colors
                ${isActive
                                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-emerald-200 hover:text-emerald-700'
                                }`}
                        >
                            {pageNum}
                        </Link>
                    );
                })}
            </div>

            {/* Next Button */}
            {currentPage < totalPages ? (
                <Link
                    href={createPageUrl(currentPage + 1)}
                    className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-emerald-600 transition-colors"
                    aria-label="Sonraki Sayfa"
                >
                    <ChevronRightIcon className="w-5 h-5" />
                </Link>
            ) : (
                <span className="p-2 rounded-lg border border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed">
                    <ChevronRightIcon className="w-5 h-5" />
                </span>
            )}
        </div>
    );
}
