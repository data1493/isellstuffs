"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function AdvertiseError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
      <div className="rounded-2xl border border-destructive/30 bg-[oklch(0.97_0.02_25)] px-5 py-14 text-center sm:px-8">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-destructive">
          Rate card stuck
        </p>
        <h1 className="mt-3 font-heading text-2xl tracking-tight text-balance sm:text-3xl">
          The advertising desk did not load.
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground text-pretty">
          The corners are still on the floor. Try the desk again, or walk
          the concourse and read the stamps yourself.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button className="rounded-full px-5" onClick={reset}>
            Try the desk again
          </Button>
          <Button
            variant="outline"
            className="rounded-full px-5"
            render={<Link href="/" />}
          >
            Home concourse
          </Button>
        </div>
      </div>
    </div>
  );
}
