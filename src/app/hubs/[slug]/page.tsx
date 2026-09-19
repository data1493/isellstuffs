import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";

import { ListingGrid } from "@/components/browse/cards";
import { HubTakeover } from "@/components/browse/paid";
import { BrowseEmpty, HubNotFound } from "@/components/browse/states";
import { MallEyebrow, MallWidth } from "@/components/mall-shell";
import { Button } from "@/components/ui/button";
import { AD_BOOKINGS_COOKIE } from "@/lib/ad-booking";
import { listingsByHub, mallHubs } from "@/lib/commerce";
import { exploreHref, hubAtmosphere, hubBySlug } from "@/lib/browse";
import {
  hubBookingsFromCookie,
  resolveHubTakeover,
} from "@/lib/hub-ads";
import { hubMetadata, missingHubMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const dynamicParams = false;

type HubPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return mallHubs.map((hub) => ({ slug: hub.slug }));
}

export async function generateMetadata({
  params,
}: HubPageProps): Promise<Metadata> {
  const { slug } = await params;
  const hub = hubBySlug(slug);
  if (!hub) {
    return missingHubMetadata();
  }
  return hubMetadata(hub);
}

export default async function HubPage({ params }: HubPageProps) {
  const { slug } = await params;
  const hub = hubBySlug(slug);
  if (!hub) {
    return <HubNotFound />;
  }

  const atmosphere = hubAtmosphere[hub.id];
  const hubListings = listingsByHub(hub.id);
  const jar = await cookies();
  const bookings = hubBookingsFromCookie(jar.get(AD_BOOKINGS_COOKIE)?.value);
  const takeover = resolveHubTakeover(bookings, hub.id);
  const otherHubs = mallHubs.filter((item) => item.id !== hub.id);

  return (
    <div>
      <section className={cn("border-b border-border", atmosphere.wash)}>
        <MallWidth className="py-12 sm:py-16">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-foreground/55">
            {atmosphere.floor}
          </p>
          <h1 className="mt-2 font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {hub.name}
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-foreground/80 text-pretty">
            {hub.blurb}
          </p>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-foreground/70 text-pretty">
            {hub.rule} {atmosphere.refuse}
          </p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <Button
              variant="outline"
              className="w-full rounded-full bg-card/70 px-5 sm:w-auto"
              render={<Link href={exploreHref({ hubId: hub.id })} />}
            >
              See {hub.name} on the concourse
            </Button>
            <Button
              variant="ghost"
              className="w-full rounded-full px-5 sm:w-auto"
              render={<Link href="/hubs" />}
            >
              All hubs
            </Button>
          </div>
        </MallWidth>
      </section>

      <MallWidth className="py-12 sm:py-16">
        {takeover ? (
          <div className="mb-10">
            <HubTakeover
              slot={takeover.slot}
              stallName={takeover.stallName}
            />
          </div>
        ) : null}

        <p className="text-sm text-muted-foreground">
          {hubListings.length} {hubListings.length === 1 ? "thing" : "things"} in
          this aisle
        </p>
        <div className="mt-4">
          {hubListings.length === 0 ? (
            <BrowseEmpty
              title="This aisle is empty."
              body={`${hub.name} has nothing on the tables right now. Walk the concourse, or try another floor.`}
              actionHref="/explore"
            />
          ) : (
            <ListingGrid listings={hubListings} />
          )}
        </div>

        <aside className="mt-14 border-t border-border pt-10">
          <MallEyebrow>Other floors</MallEyebrow>
          <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm">
            {otherHubs.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      </MallWidth>
    </div>
  );
}
