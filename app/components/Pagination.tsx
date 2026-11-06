import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type PaginationProps = {
  page: number;
  totalPages: number;
  hrefFor: (page: number) => string;
};

// Up to 4 consecutive pages around the current one, plus first/last with ellipses (e.g. 1 2 3 4 … 25)
function pageWindow(page: number, total: number): (number | '…')[] {
  let start = Math.max(1, page - 1);
  const end = Math.min(total, start + 3);
  start = Math.max(1, end - 3);
  const items: (number | '…')[] = [];
  if (start > 1) items.push(1);
  if (start > 2) items.push('…');
  for (let i = start; i <= end; i++) items.push(i);
  if (end < total - 1) items.push('…');
  if (end < total) items.push(total);
  return items;
}

const base =
  'h-9 min-w-9 px-2.5 sm:px-3 inline-flex items-center justify-center gap-1 rounded-md border text-xs sm:text-sm transition-colors';
const idle = `${base} border-gray-200 bg-white text-gray-700 hover:border-[#47A15E] hover:text-[#47A15E]`;
const disabled = `${base} border-gray-100 bg-white text-gray-300 pointer-events-none`;

export default function Pagination({ page, totalPages, hrefFor }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav aria-label="Pagination" className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} className={idle} aria-label="Previous page">
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Previous</span>
        </Link>
      ) : (
        <span className={disabled} aria-disabled="true" aria-label="Previous page">
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Previous</span>
        </span>
      )}
      {pageWindow(page, totalPages).map((item, i) =>
        item === '…' ? (
          <span key={`gap-${i}`} className="h-9 min-w-9 inline-flex items-center justify-center text-gray-400">
            …
          </span>
        ) : item === page ? (
          <span
            key={item}
            aria-current="page"
            className={`${base} border-[#1a1a1a] bg-[#1a1a1a] text-white font-semibold`}
          >
            {item}
          </span>
        ) : (
          <Link key={item} href={hrefFor(item)} className={idle} aria-label={`Page ${item}`}>
            {item}
          </Link>
        ),
      )}
      {page < totalPages ? (
        <Link href={hrefFor(page + 1)} className={idle} aria-label="Next page">
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      ) : (
        <span className={disabled} aria-disabled="true" aria-label="Next page">
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-4 h-4" />
        </span>
      )}
    </nav>
  );
}
