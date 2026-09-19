"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ToteNavLink } from "@/components/tote-nav-link";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/explore", label: "Explore" },
  { href: "/hubs", label: "Hubs" },
  { href: "/sell", label: "Sell" },
  { href: "/advertise", label: "Advertise" },
  { href: "/#how-it-works", label: "How it works" },
];

function navActive(pathname: string, href: string) {
  if (href === "/explore") {
    return pathname === "/explore" || pathname === "/browse";
  }
  if (href === "/hubs") {
    return pathname === "/hubs" || pathname.startsWith("/hubs/");
  }
  if (href === "/advertise") {
    return pathname === "/advertise" || pathname.startsWith("/campaigns/");
  }
  if (href === "/sell") {
    return pathname === "/sell" || pathname.startsWith("/sell/");
  }
  return false;
}

export function SiteNav() {
  const pathname = usePathname();
  const toteActive = pathname === "/cart" || pathname.startsWith("/checkout");

  return (
    <nav
      aria-label="Mall sections"
      className="-mx-4 flex items-center gap-x-1 overflow-x-auto px-4 pb-0.5 text-sm [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:gap-x-4 sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden"
    >
      {nav.map((item) => {
        const active = navActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "shrink-0 rounded-full px-2.5 py-1 underline-offset-4 sm:px-0 sm:py-0",
              active
                ? "bg-secondary text-foreground sm:bg-transparent sm:font-medium sm:underline"
                : "text-muted-foreground hover:text-foreground hover:underline",
            )}
          >
            {item.label}
          </Link>
        );
      })}
      <ToteNavLink
        className={cn(
          "hidden rounded-full px-2.5 py-1 sm:inline sm:px-0 sm:py-0",
          toteActive && "font-medium text-foreground underline",
        )}
      />
    </nav>
  );
}
