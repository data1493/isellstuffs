"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { advertisePath } from "@/lib/paths";

export default function CampaignError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
      <div className="rounded-2xl border border-destructive/30 bg-[oklch(0.97_0.02_25)] px-5 py-14 text-center sm:px-8">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-destructive">
          Campaign jammed
        </p>
        <h1 className="mt-3 font-heading text-2xl tracking-tight text-balance sm:text-3xl">
          This paid page did not load.
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground text-pretty">
          The takeover may still be on the concourse. Try again, or read
          the rate card.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button className="rounded-full px-5" onClick={reset}>
            Try the campaign again
          </Button>
          <Button
            variant="outline"
            className="rounded-full px-5"
            render={<Link href={advertisePath()} />}
          >
            Mall rate card
          </Button>
        </div>
      </div>
    </div>
  );
}
