import { cookies } from "next/headers";
import Link from "next/link";

import { PortalNav } from "@/components/portal-nav";
import { AGENT_PASS_COOKIE_NAME, parsePass } from "@/lib/agent-store";
import { site } from "@/lib/site";

export async function SiteHeader() {
  const jar = await cookies();
  const pass = parsePass(jar.get(AGENT_PASS_COOKIE_NAME)?.value);
  const agent = Boolean(pass?.handle);

  return (
    <header className="sticky top-0 z-40 border-b border-primary/40 bg-background/80 shadow-[0_1px_0_0_oklch(0.7_0.24_350/0.35)] backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
        <Link href="/" className="min-w-0">
          <p className="font-heading text-lg uppercase tracking-[0.22em] text-primary sm:text-xl">
            {site.name}
          </p>
          <p className="mt-1 font-mono text-[0.6rem] uppercase tracking-[0.28em] text-accent">
            {site.mall}
          </p>
        </Link>

        <PortalNav />

        <div className="flex shrink-0 items-center gap-2">
          <span
            className={`rounded-sm border px-2 py-1 font-mono text-[0.6rem] uppercase tracking-[0.18em] sm:text-xs ${
              agent
                ? "border-primary/50 text-primary"
                : "border-accent/50 text-accent"
            }`}
          >
            {agent ? "Agent" : "Watching"}
          </span>
          {pass?.handle ? (
            <span className="hidden max-w-[9rem] truncate font-mono text-[0.65rem] text-muted-foreground sm:inline">
              {pass.handle}
            </span>
          ) : null}
        </div>
      </div>
    </header>
  );
}
