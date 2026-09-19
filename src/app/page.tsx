import type { Metadata } from "next";
import Link from "next/link";

import { HubTile, ListingGrid } from "@/components/browse/cards";
import { FeaturedBooth, HomepageTakeover } from "@/components/browse/paid";
import { JsonLd } from "@/components/json-ld";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  adSlotsByKind,
  featuredStallSlots,
  listings,
  listingsByHub,
  listingsByStall,
  listingsByType,
  mallHubs,
} from "@/lib/commerce";
import { homeMetadata, websiteJsonLd } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata: Metadata = homeMetadata();

export default function Home() {
  const homepageTakeover = adSlotsByKind("homepage-takeover")[0];
  const featuredStallSlot = featuredStallSlots()[0];
  const featuredGoods = featuredStallSlot
    ? listingsByStall(featuredStallSlot.stallId)
    : [];
  const featuredIds = new Set(featuredGoods.map((listing) => listing.id));
  const takeoverIds = new Set(
    homepageTakeover
      ? listingsByStall(homepageTakeover.stallId).map((listing) => listing.id)
      : [],
  );
  const elsewhere = listings
    .filter((listing) => !featuredIds.has(listing.id) && !takeoverIds.has(listing.id))
    .slice(0, 6);
  const physicalCount = listingsByType("physical").length;
  const digitalCount = listingsByType("digital").length;

  return (
    <div>
      <JsonLd data={websiteJsonLd()} />
      <section className="border-b border-border bg-[linear-gradient(180deg,var(--card),var(--background))]">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-12 sm:px-6 sm:py-16">
          <Badge variant="secondary" className="w-fit rounded-full">
            Many sellers. One mall.
          </Badge>
          <div className="max-w-2xl space-y-4">
            <h1 className="font-heading text-4xl leading-[1.1] tracking-tight text-balance sm:text-6xl">
              Walk the aisles. Buy from stalls, not a storefront.
            </h1>
            <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
              {site.name} is a flea-market mall. Independent sellers keep their
              own stalls. A jacket and a download can sit on the same table.
              Paid corners are labeled. Always.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              size="lg"
              className="rounded-full px-5"
              render={<Link href="/explore" />}
            >
              Explore the concourse
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full px-5"
              render={<Link href="/hubs" />}
            >
              Pick a hub
            </Button>
          </div>
        </div>
      </section>

      {homepageTakeover ? <HomepageTakeover slot={homepageTakeover} /> : null}

      <section id="hubs" className="scroll-mt-6">
        <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="max-w-2xl">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Opinionated hubs
            </p>
            <h2 className="mt-2 font-heading text-3xl tracking-tight sm:text-4xl">
              Four floors. Not a junk drawer.
            </h2>
            <p className="mt-3 text-muted-foreground">
              The concourse is general. These aisles have rules — what belongs,
              and what gets walked back to the door.
            </p>
          </div>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {mallHubs.map((hub) => (
              <li key={hub.id}>
                <HubTile hub={hub} count={listingsByHub(hub.id).length} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      {featuredStallSlot ? (
        <FeaturedBooth slot={featuredStallSlot} eyebrow="Paid the good corner" />
      ) : null}

      <section className="scroll-mt-6">
        <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                Elsewhere on the floor
              </p>
              <h2 className="mt-2 font-heading text-3xl tracking-tight sm:text-4xl">
                The rest of the tables.
              </h2>
              <p className="mt-3 text-muted-foreground">
                Sold and file-gone stay on the floor. A picked-over table is
                still a table.
              </p>
            </div>
            <Button
              variant="outline"
              className="rounded-full px-5"
              render={<Link href="/explore" />}
            >
              See every listing
            </Button>
          </div>
          <div className="mt-8">
            <ListingGrid listings={elsewhere} />
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        className="scroll-mt-6 border-y border-border bg-card/60"
      >
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-12 sm:px-6 sm:py-16 md:grid-cols-3">
          <article>
            <p className="font-heading text-4xl text-primary">01</p>
            <h2 className="mt-2 font-heading text-2xl tracking-tight">
              Stalls, not a shop
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Each seller runs their own stall. The mall is the building — it
              is not one vendor with a catalog.
            </p>
          </article>
          <article>
            <p className="font-heading text-4xl text-primary">02</p>
            <h2 className="mt-2 font-heading text-2xl tracking-tight">
              Hubs you can roam
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Yard Sale, Closet Overflow, Garage Tech, Download Stall. Browse
              the floor, then duck into an aisle that has a rule.
            </p>
          </article>
          <article>
            <p className="font-heading text-4xl text-primary">03</p>
            <h2 className="mt-2 font-heading text-2xl tracking-tight">
              Same table, two kinds
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              A cracked Game Boy and a parking-lot LUT pack can share a stall.
              Physical and digital are listing types, not two websites.
            </p>
          </article>
        </div>
      </section>

      <section id="same-stall" className="scroll-mt-6">
        <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-12 sm:px-6 sm:py-16 md:grid-cols-2">
          <Card className="bg-card">
            <CardHeader>
              <Badge variant="outline" className="w-fit">
                Physical · {physicalCount}
              </Badge>
              <CardTitle className="font-heading text-2xl">
                Things you can hold
              </CardTitle>
              <CardDescription className="text-base leading-6">
                Lamps, windbreakers, cracked Game Boys. Condition is a
                first-class field — “tested, kinda” is valid copy.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="bg-card">
            <CardHeader>
              <Badge variant="outline" className="w-fit">
                Digital · {digitalCount}
              </Badge>
              <CardTitle className="font-heading text-2xl">
                Things you can download
              </CardTitle>
              <CardDescription className="text-base leading-6">
                PDFs, LUTs, sample packs, a mall-directory font. Same stall as
                the junk — not a second storefront.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      <section id="open-a-stall" className="scroll-mt-6 border-t border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-12 sm:px-6 sm:py-16">
          <h2 className="font-heading text-3xl tracking-tight sm:text-4xl">
            Want a stall?
          </h2>
          <p className="max-w-xl text-muted-foreground">
            Booth applications are not open. Walk the floor first — the hubs,
            the paid corners, the sold stickers still on the tables.
          </p>
        </div>
      </section>
    </div>
  );
}
