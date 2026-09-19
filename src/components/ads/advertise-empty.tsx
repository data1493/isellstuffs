import Link from "next/link";

import { Button } from "@/components/ui/button";

export function AdvertiseEmpty() {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-[oklch(0.97_0.015_85)] px-5 py-14 text-center sm:px-8">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
        No windows
      </p>
      <h2 className="mt-3 font-heading text-2xl tracking-tight text-balance sm:text-3xl">
        No corners are for sale this weekend.
      </h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground text-pretty">
        Featured stalls and takeovers are campaign fixtures. When the catalog
        has none, the mall floor stays unlabeled.
      </p>
      <Button
        className="mt-6 rounded-full px-5"
        render={<Link href="/" />}
      >
        Walk the concourse
      </Button>
    </div>
  );
}
