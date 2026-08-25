import { Button } from "@/components/ui/button";

interface BrowsePaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

/** Paginasi tombol Sebelumnya/Berikutnya + indikator posisi halaman. */
export function BrowsePagination({
  page,
  totalPages,
  onPageChange,
  disabled = false,
}: BrowsePaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label="Navigasi halaman"
      className="mt-8 flex items-center justify-center gap-3"
    >
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(page - 1)}
        disabled={disabled || page <= 1}
      >
        Sebelumnya
      </Button>
      <span
        aria-live="polite"
        className="text-sm text-muted-foreground"
      >
        Halaman {page} dari {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(page + 1)}
        disabled={disabled || page >= totalPages}
      >
        Berikutnya
      </Button>
    </nav>
  );
}
