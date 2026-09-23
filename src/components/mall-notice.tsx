import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type MallNoticeTone = "empty" | "missing" | "error" | "cancel";

const wash: Record<MallNoticeTone, string> = {
  empty: "border-dashed border-border bg-[oklch(0.97_0.015_85)]",
  missing: "border-dashed border-border bg-[oklch(0.97_0.015_85)]",
  cancel: "border-dashed border-border bg-[oklch(0.96_0.012_80)]",
  error: "border-destructive/30 bg-[oklch(0.97_0.02_25)]",
};

export function MallNotice({
  tone = "empty",
  eyebrow,
  title,
  body,
  actions,
  children,
  padded = true,
  titleAs = "h1",
  className,
}: {
  tone?: MallNoticeTone;
  eyebrow: string;
  title: string;
  body: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  padded?: boolean;
  titleAs?: "h1" | "h2";
  className?: string;
}) {
  const Title = titleAs;

  return (
    <div
      className={cn(
        padded && "mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-16",
        className,
      )}
    >
      <div
        className={cn(
          "rounded-2xl border px-5 py-12 text-center sm:px-8 sm:py-14",
          wash[tone],
        )}
      >
        <p
          className={cn(
            "text-xs font-medium uppercase tracking-[0.2em]",
            tone === "error" ? "text-destructive" : "text-muted-foreground",
          )}
        >
          {eyebrow}
        </p>
        <Title className="mt-3 font-heading text-3xl tracking-tight text-balance sm:text-4xl">
          {title}
        </Title>
        <div className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground text-pretty">
          {typeof body === "string" ? <p>{body}</p> : body}
        </div>
        {children ? (
          <div className="mx-auto mt-6 w-full max-w-md">{children}</div>
        ) : null}
        {actions ? (
          <div className="mt-6 flex flex-col items-stretch justify-center gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:[&_a]:w-auto sm:[&_button]:w-auto [&_a]:w-full [&_button]:w-full">
            {actions}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function MallLoading({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-16",
        className,
      )}
    >
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </p>
      <div className="mt-5 h-9 w-3/4 max-w-sm animate-pulse rounded-lg bg-muted" />
      <div className="mt-3 h-4 w-full max-w-md animate-pulse rounded-lg bg-muted" />
      <div className="mt-8 grid gap-3">
        <div className="h-40 animate-pulse rounded-xl bg-muted" />
        <div className="h-40 animate-pulse rounded-xl bg-muted sm:hidden" />
      </div>
    </div>
  );
}

export function MallPayError({
  title = "Did not go through",
  body,
}: {
  title?: string;
  body: string;
}) {
  return (
    <div
      role="alert"
      className="rounded-2xl border border-destructive/30 bg-[oklch(0.97_0.02_25)] px-4 py-4 text-left"
    >
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-destructive">
        {title}
      </p>
      <p className="mt-2 text-sm leading-6 text-foreground">{body}</p>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">
        Nothing was charged. The tote is still yours.
      </p>
    </div>
  );
}
