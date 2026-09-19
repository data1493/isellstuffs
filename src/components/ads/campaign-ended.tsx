import Link from "next/link";

import { Button } from "@/components/ui/button";
import { advertisePath } from "@/lib/paths";

export function CampaignEnded() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
      <div className="rounded-2xl border border-dashed border-border bg-[oklch(0.97_0.015_85)] px-5 py-14 text-center sm:px-8">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Window closed
        </p>
        <h1 className="mt-3 font-heading text-3xl tracking-tight text-balance sm:text-4xl">
          This campaign is off the floor.
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground text-pretty">
          The takeover that paid for this URL is not in the stand-in catalog.
          The rate card still lists what a corner costs.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button
            className="rounded-full px-5"
            render={<Link href={advertisePath()} />}
          >
            See the rate card
          </Button>
          <Button
            variant="outline"
            className="rounded-full px-5"
            render={<Link href="/" />}
          >
            Walk the concourse
          </Button>
        </div>
      </div>
    </div>
  );
}
