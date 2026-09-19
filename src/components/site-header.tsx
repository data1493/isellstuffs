import Link from "next/link";

import { Button } from "@/components/ui/button";
import { site } from "@/lib/site";

const nav = [
  { href: "/explore", label: "Explore" },
  { href: "/hubs", label: "Hubs" },
  { href: "/#how-it-works", label: "How it works" },
];

export function SiteHeader() {
  return (
    <header className="border-b border-border bg-card/80 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="group min-w-0">
            <p className="font-heading text-2xl leading-none tracking-tight text-foreground lowercase sm:text-[1.7rem]">
              {site.name}
            </p>
            <p className="mt-1 text-[0.7rem] font-medium uppercase tracking-[0.22em] text-muted-foreground">
              {site.mall}
            </p>
          </Link>
          <Button
            size="lg"
            className="rounded-full px-4 font-medium"
            render={<Link href="/#open-a-stall" />}
          >
            Open a stall
          </Button>
        </div>
        <nav
          aria-label="Mall sections"
          className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm"
        >
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
