import Link from "next/link";
import type { ReactNode } from "react";

export function MallCrumb({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <nav
      aria-label={label}
      className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground"
    >
      <Link href="/" className="hover:text-foreground hover:underline">
        The mall
      </Link>
      {children}
    </nav>
  );
}

export function CrumbSep() {
  return <span aria-hidden="true">/</span>;
}
