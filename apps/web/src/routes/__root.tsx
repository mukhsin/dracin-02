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
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-4">
          <Link to="/" className="text-lg font-bold tracking-tight">
            Dracin
          </Link>
          <nav
            aria-label="Navigasi utama"
            className="flex items-center gap-5 sm:gap-6"
          >
            <Link
              to="/"
              activeProps={{ className: "text-foreground" }}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Beranda
            </Link>
            <Link
              to="/browse"
              activeProps={{ className: "text-foreground" }}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Jelajah
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6">
        <Outlet />
      </main>
      <footer className="border-t">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 text-center text-sm text-muted-foreground">
          © Dracin
        </div>
      </footer>
    </div>
  );
}
