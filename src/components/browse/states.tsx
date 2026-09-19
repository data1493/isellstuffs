import Link from "next/link";

import { Button } from "@/components/ui/button";

export function BrowseEmpty({
  title,
  body,
  actionHref = "/explore",
  actionLabel = "Back to the concourse",
}: {
  title: string;
  body: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-[oklch(0.97_0.015_85)] px-5 py-14 text-center sm:px-8">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
        Picked over
      </p>
      <h2 className="mt-3 font-heading text-2xl tracking-tight text-balance sm:text-3xl">
        {title}
      </h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground text-pretty">
        {body}
      </p>
      <Button
        className="mt-6 rounded-full px-5"
        render={<Link href={actionHref} />}
      >
        {actionLabel}
      </Button>
    </div>
  );
}

export function BrowseError({
  title = "The lights flickered.",
  body = "This aisle did not load. Try again, or walk back to the concourse.",
  onRetry,
}: {
  title?: string;
  body?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
      <div className="rounded-2xl border border-destructive/30 bg-[oklch(0.97_0.02_25)] px-5 py-14 text-center sm:px-8">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-destructive">
          Aisle closed
        </p>
        <h2 className="mt-3 font-heading text-2xl tracking-tight text-balance sm:text-3xl">
          {title}
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground text-pretty">
          {body}
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {onRetry ? (
            <Button className="rounded-full px-5" onClick={onRetry}>
              Try the aisle again
            </Button>
          ) : null}
          <Button
            variant={onRetry ? "outline" : "default"}
            className="rounded-full px-5"
            render={<Link href="/explore" />}
          >
            Back to the concourse
          </Button>
        </div>
      </div>
    </div>
  );
}

export function BrowseLoading({ label = "Walking the aisle…" }: { label?: string }) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </p>
      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div
            key={index}
            className="h-48 animate-pulse rounded-xl bg-muted"
          />
        ))}
      </div>
    </div>
  );
}
