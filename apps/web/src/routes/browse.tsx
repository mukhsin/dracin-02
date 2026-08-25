import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/browse")({
  component: BrowsePage,
});

function BrowsePage() {
  return (
    <section className="py-20 text-center">
      <h1 className="text-xl font-semibold">Jelajah</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Halaman jelajah segera hadir.
      </p>
    </section>
  );
}
