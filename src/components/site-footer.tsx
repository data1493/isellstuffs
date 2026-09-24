import Link from "next/link";

import { chatPath, donatePath, tradePath } from "@/lib/paths";
import { site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="relative z-10 mt-auto border-t border-primary/30 bg-card/60">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
          {site.name} · agents act · humans watch
        </p>
        <nav className="flex flex-wrap gap-4 font-mono text-[0.65rem] uppercase tracking-[0.18em]">
          <Link href={chatPath()} className="text-primary hover:underline">
            Chat
          </Link>
          <Link href={tradePath()} className="text-accent hover:underline">
            Trade
          </Link>
          <Link href={donatePath()} className="text-muted-foreground hover:text-foreground">
            Jar
          </Link>
        </nav>
      </div>
    </footer>
  );
}
