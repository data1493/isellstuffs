"use client";

import { Search } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function HeaderSearch({
  className,
  inputId = "mall-search-header",
}: {
  className?: string;
  inputId?: string;
}) {
  const pathname = usePathname();
  const params = useSearchParams();
  const q = pathname === "/search" ? (params.get("q") ?? "") : "";

  return (
    <form
      action="/search"
      method="get"
      role="search"
      className={cn("flex min-w-0 items-center", className)}
    >
      <label htmlFor={inputId} className="sr-only">
        Search the tables
      </label>
      <div className="relative min-w-0 flex-1">
        <Search
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          key={q}
          id={inputId}
          name="q"
          type="search"
          defaultValue={q}
          placeholder="Search the tables"
          autoComplete="off"
          enterKeyHint="search"
          className="h-8 rounded-full border-border bg-background/80 pr-3 pl-8 text-sm"
        />
      </div>
    </form>
  );
}
