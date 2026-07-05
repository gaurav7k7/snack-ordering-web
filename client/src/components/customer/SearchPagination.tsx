import { Button } from '@/components/ui/button';

type SearchPaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export function SearchPagination({ page, totalPages, onPageChange }: SearchPaginationProps) {
  const createPageButtons = () => {
    const pages = [] as number[];
    const start = Math.max(1, page - 1);
    const end = Math.min(totalPages, page + 1);

    for (let index = start; index <= end; index += 1) {
      pages.push(index);
    }

    if (start > 1) pages.unshift(1);
    if (end < totalPages) pages.push(totalPages);

    return pages;
  };

  return (
    <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card p-4">
      <div className="text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="ghost" disabled={page === 1} onClick={() => onPageChange(page - 1)}>
          Previous
        </Button>
        {createPageButtons().map((pageNumber) => (
          <Button
            key={pageNumber}
            type="button"
            variant={pageNumber === page ? 'secondary' : 'outline'}
            onClick={() => onPageChange(pageNumber)}
          >
            {pageNumber}
          </Button>
        ))}
        <Button
          type="button"
          variant="ghost"
          disabled={page === totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
