import Link from "next/link";

import { ToteHeaderButton, ToteNavLink } from "@/components/tote-nav-link";
import { Button } from "@/components/ui/button";
import { site } from "@/lib/site";

const nav = [
  { href: "/explore", label: "Explore" },
  { href: "/hubs", label: "Hubs" },
  { href: "/advertise", label: "Advertise" },
  { href: "/#how-it-works", label: "How it works" },
];

export function SiteHeader() {
  return (
    <header className="border-b border-border bg-card/80 backdrop-blur-sm">
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
              render={<Link href="/#open-a-stall" />}
            >
              Open a stall
            </Button>
          </div>
        </div>
        <nav
          aria-label="Mall sections"
          className="-mx-4 flex items-center gap-x-1 overflow-x-auto px-4 pb-0.5 text-sm [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:gap-x-4 sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden"
        >
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="shrink-0 rounded-full px-2.5 py-1 text-muted-foreground underline-offset-4 hover:text-foreground hover:underline sm:px-0 sm:py-0"
            >
              {item.label}
            </Link>
          ))}
          <ToteNavLink className="hidden rounded-full px-2.5 py-1 sm:inline sm:px-0 sm:py-0" />
        </nav>
      </div>
    </header>
  );
}
