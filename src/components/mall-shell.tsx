import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function MallWidth({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-6xl px-4 sm:px-6", className)}>
      {children}
    </div>
  );
}

export function MallSection({
  children,
  className,
  innerClassName,
  id,
}: {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
  id?: string;
}) {
  return (
    <section id={id} className={cn("scroll-mt-6", className)}>
      <MallWidth className={cn("py-12 sm:py-16", innerClassName)}>
        {children}
      </MallWidth>
    </section>
  );
}

export function MallEyebrow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground",
        className,
      )}
    >
      {children}
    </p>
  );
}

export function MallHero({
  children,
  className,
  innerClassName,
}: {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
}) {
  return (
    <section
      className={cn(
        "border-b border-border bg-[linear-gradient(180deg,var(--card),var(--background))]",
        className,
      )}
    >
      <MallWidth
        className={cn(
          "flex flex-col gap-6 py-12 sm:py-16",
          innerClassName,
        )}
      >
        {children}
      </MallWidth>
    </section>
  );
}
