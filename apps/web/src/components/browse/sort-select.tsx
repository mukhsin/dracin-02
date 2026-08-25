import type * as React from "react";

import { BROWSE_SORT_OPTIONS, type BrowseSort } from "@/hooks/use-browse";
import { cn } from "@/lib/utils";

interface SortSelectProps {
  value: BrowseSort;
  onChange: (sort: BrowseSort) => void;
  className?: string;
}

/** Select sortir native bergaya shadcn (Terbaru | Terpopuler | Judul A-Z). */
export function SortSelect({ value, onChange, className }: SortSelectProps) {
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const option = BROWSE_SORT_OPTIONS.find(
      (candidate) => candidate.value === event.target.value,
    );
    if (option) onChange(option.value);
  };

  return (
    <label className={cn("relative inline-flex items-center", className)}>
      <span className="sr-only">Urutkan</span>
      <select
        value={value}
        onChange={handleChange}
        className="h-9 w-full appearance-none rounded-md border border-input bg-background py-1 pl-3 pr-8 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
      >
        {BROWSE_SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </label>
  );
}
