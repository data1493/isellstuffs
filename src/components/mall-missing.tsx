import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { soldCampaigns } from "@/lib/ads-display";
import { adSlots, allStalls, mallHubs, stallById } from "@/lib/commerce";
import {
  advertiseBookPath,
  advertisePath,
  campaignPath,
  stallPath,
} from "@/lib/paths";

function MapLinks({
  items,
}: {
  items: readonly { href: string; name: string }[];
}) {
  return (
    <ul className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-center text-sm">
      {items.map((item) => (
        <li key={item.href}>
          <Link
            href={item.href}
            className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            {item.name}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function soldCampaignLinks() {
  return soldCampaigns.map((campaign) => {
    const slot = adSlots.find((item) => item.id === campaign.slotId);
    const stall = slot ? stallById(slot.stallId) : undefined;
    return {
      href: campaignPath(campaign.slug),
      name: stall?.boothName ?? campaign.slug,
    };
  });
}

export function ListingMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Not on the map"
      title="That listing packed up."
      body="No SKU with that id. It sold, the tag tore off, or it never sat on a table."
      actions={
        <>
          <Button className="rounded-full px-5" render={<Link href="/explore" />}>
            Walk the concourse
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
      <MapLinks
        items={mallHubs.map((hub) => ({ href: hub.href, name: hub.name }))}
      />
    </MallNotice>
  );
}

export function StallMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Not on the map"
      title="That stall packed up."
      body="No booth with that slug. The folding table is gone, or the name is wrong."
      actions={
        <>
          <Button className="rounded-full px-5" render={<Link href="/explore" />}>
            Walk the concourse
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
      <MapLinks
        items={allStalls().map((stall) => ({
          href: stallPath(stall.slug),
          name: stall.boothName,
        }))}
      />
    </MallNotice>
  );
}

export function CampaignMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Not on the map"
      title="That campaign packed up."
      body="Only two windows bought a URL. Beats Under the Table and Folding Table Tuesday. Anything else never paid for a souvenir page."
      actions={
        <>
          <Button
            className="rounded-full px-5"
            render={<Link href={advertisePath()} />}
          >
            Mall rate card
          </Button>
          <Button
            variant="outline"
            className="rounded-full px-5"
            render={<Link href={advertiseBookPath()} />}
          >
            Book next weekend
          </Button>
        </>
      }
    >
      <MapLinks items={soldCampaignLinks()} />
    </MallNotice>
  );
}
