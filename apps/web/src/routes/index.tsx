import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <section>
      <h1>Dracin</h1>
      <p>Nonton drama favoritmu. Katalog akan tampil di sini.</p>
    </section>
  );
}
