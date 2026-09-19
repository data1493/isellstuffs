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
        <p className="text-xs text-muted-foreground">
          A marketplace in progress. Browse the floor — checkout comes later.
        </p>
      </div>
    </footer>
  );
}
