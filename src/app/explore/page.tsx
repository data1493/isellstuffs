import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";

import { ListingGrid } from "@/components/browse/cards";
import { FeaturedBooth } from "@/components/browse/paid";
import { BrowseEmpty } from "@/components/browse/states";
import { Badge } from "@/components/ui/badge";
import { featuredStallSlots, mallHubs } from "@/lib/commerce";
import {
  exploreHref,
  filterListings,
  firstSearchParam,
  isHubId,
  isListingType,
} from "@/lib/browse";
import { exploreMetadata } from "@/lib/seo";

type ExplorePageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({
  searchParams,
}: ExplorePageProps): Promise<Metadata> {
  const params = await searchParams;
  const hubParam = firstSearchParam(params.hub);
  const typeParam = firstSearchParam(params.type);
  const hubId = isHubId(hubParam) ? hubParam : undefined;
  const type = isListingType(typeParam) ? typeParam : undefined;
  const unknown = Boolean((hubParam && !hubId) || (typeParam && !type));

  return exploreMetadata({ hubId, type, unknown });
}

const typeFilters = [
  { id: "physical" as const, label: "Physical" },
  { id: "digital" as const, label: "Digital" },
];

export default async function ExplorePage({
  searchParams,
}: ExplorePageProps) {
  const params = await searchParams;
  const hubParam = firstSearchParam(params.hub);
  const typeParam = firstSearchParam(params.type);
  const hubId = isHubId(hubParam) ? hubParam : undefined;
  const type = isListingType(typeParam) ? typeParam : undefined;
  const unknownFilter = Boolean(
    (hubParam && !hubId) || (typeParam && !type),
  );
  const filtered = unknownFilter ? [] : filterListings({ hubId, type });
  const activeHub = hubId
    ? mallHubs.find((hub) => hub.id === hubId)
    : undefined;
  const featuredStallSlot = featuredStallSlots()[0];
  const showFeatured = !hubId && !type && !unknownFilter && featuredStallSlot;

  return (
    <div>
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          General concourse
        </p>
        <h1 className="mt-2 font-heading text-4xl tracking-tight text-balance sm:text-5xl">
          Explore the mall
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground text-pretty">
          Every listing on the floor, including sold and file-gone. The good
          corner is paid and labeled. Duck into a hub when you want an aisle
          with rules.
        </p>

        <div className="mt-8 space-y-4 rounded-2xl border border-border bg-card px-4 py-4 sm:px-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="w-12 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Hub
            </span>
            <FilterChip href={exploreHref({ type })} active={!hubId}>
              All hubs
            </FilterChip>
            {mallHubs.map((hub) => (
              <FilterChip
                key={hub.id}
                href={exploreHref({ hubId: hub.id, type })}
                active={hubId === hub.id}
              >
                {hub.name}
              </FilterChip>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="w-12 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Kind
            </span>
            <FilterChip href={exploreHref({ hubId })} active={!type}>
              Both
            </FilterChip>
            {typeFilters.map((item) => (
              <FilterChip
                key={item.id}
                href={exploreHref({ hubId, type: item.id })}
                active={type === item.id}
              >
                {item.label}
              </FilterChip>
            ))}
          </div>
        </div>

        <p className="mt-8 text-sm text-muted-foreground">
          {filtered.length} {filtered.length === 1 ? "thing" : "things"}
          {activeHub ? ` in ${activeHub.name}` : " on the floor"}
          {type ? ` · ${type}` : null}
        </p>
      </div>

      {showFeatured ? (
        <FeaturedBooth
          slot={featuredStallSlot}
          eyebrow="Paid booth on the concourse"
        />
      ) : null}

      <div className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
        {showFeatured ? (
          <p className="mb-4 pt-12 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            The rest of the floor
          </p>
        ) : null}
        {filtered.length === 0 ? (
          <BrowseEmpty
            title={
              unknownFilter
                ? "That filter is not on the map."
                : "This combination is picked over."
            }
            body={
              unknownFilter
                ? "Hubs are Yard Sale, Closet Overflow, Garage Tech, and Download Stall. Kind is physical or digital."
                : activeHub
                  ? `${activeHub.name} does not have ${type ?? "those"} listings right now. Digital lives in Download Stall. Clothes do not come as a zip.`
                  : "Nothing matches. Clear the filters and walk the concourse again."
            }
            actionHref={exploreHref()}
            actionLabel="Clear filters"
          />
        ) : (
          <ListingGrid
            listings={
              showFeatured
                ? filtered.filter(
                    (listing) => listing.stallId !== featuredStallSlot.stallId,
                  )
                : filtered
            }
          />
        )}
      </div>
    </div>
  );
}

function FilterChip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <Link href={href}>
      <Badge variant={active ? "default" : "outline"}>{children}</Badge>
    </Link>
  );
}
