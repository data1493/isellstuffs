import type { Metadata } from "next";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { mallHubs } from "@/lib/commerce";
import { notFoundMetadata } from "@/lib/seo";

export const metadata: Metadata = notFoundMetadata();

export default function NotFound() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Not on the map"
      title="That path is not an aisle in this mall."
      body="No leftover shop, no junk drawer, no page that walked off with a SKU. Walk the concourse or pick a hub that actually exists."
      actions={
        <>
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
