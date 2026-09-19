import type { Metadata } from "next";
import Link from "next/link";

import { HubTile } from "@/components/browse/cards";
import { MallEyebrow, MallWidth } from "@/components/mall-shell";
import { Button } from "@/components/ui/button";
import { listingsByHub, mallHubs } from "@/lib/commerce";
import { hubsIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = hubsIndexMetadata();

export default function HubsPage() {
  return (
    <MallWidth className="py-12 sm:py-16">
      <MallEyebrow>The map</MallEyebrow>
      <h1 className="mt-2 font-heading text-4xl tracking-tight text-balance sm:text-5xl">
        The aisles. Pick one with a rule.
      </h1>
      <p className="mt-3 max-w-2xl text-muted-foreground text-pretty">
        These hubs earn their own pages because they refuse the wrong inventory.
        Explore stays the general concourse if you just want to walk the floor.
      </p>
      <div className="mt-6">
        <Button
          variant="outline"
          className="rounded-full px-5"
          render={<Link href="/explore" />}
        >
          Explore everything
        </Button>
      </div>
      <ul className="mt-10 grid gap-4 sm:grid-cols-2">
        {mallHubs.map((hub) => (
          <li key={hub.id} className="min-w-0">
            <HubTile hub={hub} count={listingsByHub(hub.id).length} />
          </li>
        ))}
      </ul>
    </MallWidth>
  );
}
