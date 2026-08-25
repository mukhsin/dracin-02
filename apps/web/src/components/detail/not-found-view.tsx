import { Link } from "@tanstack/react-router";

import { buttonVariants } from "@/components/ui/button";

interface DramaNotFoundViewProps {
  slug: string;
}

export function DramaNotFoundView({ slug }: DramaNotFoundViewProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 rounded-xl border bg-card px-6 py-16 text-center"
    >
      <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
        404
      </p>
      <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
        Drama tidak ditemukan
      </h1>
      <p className="max-w-md text-sm text-muted-foreground">
        Drama dengan slug &quot;{slug}&quot; tidak ada atau sudah dihapus.
      </p>
      <Link to="/" className={buttonVariants({ variant: "outline" })}>
        Kembali ke Beranda
      </Link>
    </div>
  );
}
