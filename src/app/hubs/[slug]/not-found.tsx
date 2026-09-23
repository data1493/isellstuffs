import type { Metadata } from "next";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { hubFloorList, mallHubs } from "@/lib/commerce";
import { missingHubMetadata } from "@/lib/seo";

export const metadata: Metadata = missingHubMetadata();

export default function HubSlugNotFound() {
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
