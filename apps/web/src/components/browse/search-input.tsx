import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

const DEBOUNCE_MS = 400;

interface SearchInputProps {
  /** Nilai terkomit saat ini (dari URL). */
  value: string;
  /** Dipanggil maksimal sekali per 400ms setelah pengguna berhenti mengetik. */
  onCommit: (next: string) => void;
  className?: string;
}

/**
 * Input pencarian dengan debounce: nilai dikontrol secara lokal,
 * lalu dikomit ke URL setelah pengguna berhenti mengetik.
 * `onCommit` diakses lewat ref agar timer tidak ikut ter-reset
 * ketika komponen induk me-render ulang.
 */
export function SearchInput({ value, onCommit, className }: SearchInputProps) {
  const [draft, setDraft] = useState(value);
  const onCommitRef = useRef(onCommit);

  useEffect(() => {
    onCommitRef.current = onCommit;
  });

  // Ikuti perubahan eksternal (tombol back/forward, "Hapus Filter").
  useEffect(() => {
    setDraft(value);
  }, [value]);

  useEffect(() => {
    if (draft === value) return;
    const timer = window.setTimeout(() => {
      onCommitRef.current(draft);
    }, DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [draft, value]);

  return (
    <div className={cn("relative w-full sm:max-w-xs", className)}>
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
      <input
        type="text"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        placeholder="Cari judul drama…"
        aria-label="Cari judul drama"
        className="h-9 w-full rounded-md border border-input bg-background py-1 pl-9 pr-8 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
      />
      {draft !== "" ? (
        <button
          type="button"
          onClick={() => {
            setDraft("");
            onCommitRef.current("");
          }}
          aria-label="Bersihkan pencarian"
          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-4"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      ) : null}
    </div>
  );
}
