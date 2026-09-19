import { Suspense } from "react";
import Link from "next/link";

import { HeaderSearch } from "@/components/header-search";
import { SiteNav } from "@/components/site-nav";
import { ToteHeaderButton } from "@/components/tote-nav-link";
import { Button } from "@/components/ui/button";
import { sellPath } from "@/lib/paths";
import { site } from "@/lib/site";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card/90 shadow-[0_1px_0_0_oklch(0.48_0.14_38/0.18)] backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-2.5 px-4 py-3 sm:gap-3 sm:px-6 sm:py-4">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="group min-w-0">
            <p className="font-heading text-xl leading-none tracking-tight text-foreground lowercase sm:text-[1.7rem]">
              {site.name}
            </p>
            <p className="mt-1 truncate text-[0.65rem] font-medium uppercase tracking-[0.18em] text-muted-foreground sm:text-[0.7rem] sm:tracking-[0.22em]">
              {site.mall}
            </p>
          </Link>
          <div className="flex shrink-0 items-center gap-2">
            <ToteHeaderButton className="sm:hidden" />
            <Button
              size="sm"
              className="h-8 rounded-full px-3 text-sm font-medium sm:h-9 sm:px-4"
              render={<Link href={sellPath()} />}
            >
              Open a stall
            </Button>
          </div>
        </div>
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <SiteNav />
          <Suspense
            fallback={
              <div className="h-8 w-full rounded-full bg-muted/60 sm:max-w-[16rem]" />
            }
          >
            <HeaderSearch className="w-full sm:max-w-[16rem] sm:shrink-0" />
          </Suspense>
        </div>
      </div>
    </header>
  );
}
