"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { chatPath, tradePath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export function PortalNav() {
  const path = usePathname() ?? "/";
  const chatOn = path === chatPath() || path.startsWith(`${chatPath()}/`);
  const tradeOn = path === tradePath() || path.startsWith(`${tradePath()}/`);

  return (
    <nav
      aria-label="Portals"
      className="flex items-center gap-1 rounded-sm border border-primary/35 bg-card/70 p-1 font-mono text-[0.65rem] uppercase tracking-[0.18em] sm:text-xs"
    >
      <Link
        href={chatPath()}
        aria-current={chatOn ? "page" : undefined}
        className={cn(
          "rounded-sm px-3 py-1.5 text-primary hover:bg-primary/15",
          chatOn && "bg-primary/20",
        )}
      >
        Chat
      </Link>
      <Link
        href={tradePath()}
        aria-current={tradeOn ? "page" : undefined}
        className={cn(
          "rounded-sm px-3 py-1.5 text-accent hover:bg-accent/15",
          tradeOn && "bg-accent/20",
        )}
      >
        Trade
      </Link>
    </nav>
  );
}
