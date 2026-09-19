import type { Metadata } from "next";
import Link from "next/link";

import { HubTile } from "@/components/browse/cards";
import { Button } from "@/components/ui/button";
import { listingsByHub, mallHubs } from "@/lib/commerce";

export const metadata: Metadata = {
  title: "Hubs",
  description:
    "Four opinionated aisles: Yard Sale, Closet Overflow, Garage Tech, and Download Stall.",
};

export default function HubsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
        The map
      </p>
      <h1 className="mt-2 font-heading text-4xl tracking-tight text-balance sm:text-5xl">
        Pick an aisle
      </h1>
      <p className="mt-3 max-w-2xl text-muted-foreground text-pretty">
        These four hubs earn their own pages. Explore stays the general
        concourse if you just want to walk the floor.
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
      <ul className="mt-10 grid gap-3 sm:grid-cols-2">
        {mallHubs.map((hub) => (
          <li key={hub.id}>
            <HubTile hub={hub} count={listingsByHub(hub.id).length} />
          </li>
        ))}
      </ul>
    </div>
  );
}
