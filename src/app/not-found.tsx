import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { mallHubs } from "@/lib/commerce";
import { notFoundMetadata } from "@/lib/seo";

export const metadata: Metadata = notFoundMetadata();

export default function NotFound() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
      <div className="rounded-2xl border border-dashed border-border bg-[oklch(0.97_0.015_85)] px-5 py-14 text-center sm:px-8">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Not on the map
        </p>
        <h1 className="mt-3 font-heading text-3xl tracking-tight text-balance sm:text-4xl">
          That path is not an aisle in this mall.
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground text-pretty">
          No leftover shop, no junk drawer, no page that walked off with a SKU.
          Walk the concourse or pick a hub that actually exists.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button className="rounded-full px-5" render={<Link href="/explore" />}>
            Explore the concourse
          </Button>
          <Button
            variant="outline"
            className="rounded-full px-5"
            render={<Link href="/hubs" />}
          >
            See the hubs
          </Button>
        </div>
        <ul className="mt-8 flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm">
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
      </div>
    </div>
  );
}
