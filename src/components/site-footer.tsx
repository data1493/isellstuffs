import Link from "next/link";

import { site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-card">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-end sm:justify-between sm:px-6">
        <div>
          <Link
            href="/"
            className="font-heading text-xl lowercase tracking-tight"
          >
            {site.name}
          </Link>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Many stalls. One mall. Physical and digital from the same table.
          </p>
        </div>
        <nav
          aria-label="Browse"
          className="flex flex-wrap gap-x-4 gap-y-1 text-sm"
        >
          <Link
            href="/explore"
            className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Explore
          </Link>
          <Link
            href="/hubs"
            className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Hubs
          </Link>
          <Link
            href="/advertise"
            className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Advertise
          </Link>
          <Link
            href="/cart"
            className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Tote
          </Link>
        </nav>
      </div>
    </footer>
  );
}
