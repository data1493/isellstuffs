import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { hubFloorList, mallHubs } from "@/lib/commerce";

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
    <MallNotice
      padded={false}
      titleAs="h2"
      tone="empty"
      eyebrow="Picked over"
      title={title}
      body={body}
      actions={
        <Button className="rounded-full px-5" render={<Link href={actionHref} />}>
          {actionLabel}
        </Button>
      }
    />
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
    <MallNotice
      tone="error"
      eyebrow="Aisle closed"
      title={title}
      body={body}
      titleAs="h2"
      actions={
        <>
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
        </>
      }
    />
  );
}

export function HubNotFound() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Not on the map"
      title="That aisle is not in this mall."
      body={`No artisan-home wing. No junk drawer. The floors are ${hubFloorList()}.`}
      actions={
        <>
          <Button className="rounded-full px-5" render={<Link href="/hubs" />}>
            See the hubs
          </Button>
          <Button
            variant="outline"
            className="rounded-full px-5"
            render={<Link href="/explore" />}
          >
            Explore the concourse
          </Button>
        </>
      }
    >
      <ul className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-center text-sm">
        {mallHubs.map((hub) => (
          <li key={hub.id}>
            <Link
              href={hub.href}
              className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              {hub.name}
            </Link>
          </li>
        ))}
      </ul>
    </MallNotice>
  );
}

export function BrowseLoading({ label = "Walking the aisle…" }: { label?: string }) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10"
          >
            <div className="aspect-[16/10] animate-pulse bg-muted" />
            <div className="space-y-2 p-4">
              <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
              <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
              <div className="h-3 w-full animate-pulse rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
