import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, Link, Outlet } from "@tanstack/react-router";

interface RouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
});

function RootLayout() {
  return (
    <>
      <header>
        <nav aria-label="Navigasi utama">
          <Link to="/">Beranda</Link>
          {/* /browse menyusul di tiket halaman browse */}
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </>
  );
}
