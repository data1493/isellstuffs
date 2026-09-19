import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { cookies } from "next/headers";

import { ListingGrid } from "@/components/browse/cards";
import { FeaturedBooth } from "@/components/browse/paid";
import { BrowseEmpty } from "@/components/browse/states";
import { MallEyebrow, MallWidth } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { AD_BOOKINGS_COOKIE } from "@/lib/ad-booking";
import { mallHubs } from "@/lib/commerce";
import {
  browseListings,
  exploreCountLine,
  exploreEmptyCopy,
  exploreHref,
  exploreShowsFeatured,
  parseExploreFilters,
  type ExploreFilters,
} from "@/lib/browse";
import {
  featuredBookingsFromCookie,
  resolveFeaturedStall,
} from "@/lib/featured-ads";
import { exploreMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type ExplorePageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({
  searchParams,
}: ExplorePageProps): Promise<Metadata> {
  const params = await searchParams;
  return exploreMetadata(parseExploreFilters(params));
}

const typeFilters = [
  { id: "physical" as const, label: "Physical" },
  { id: "digital" as const, label: "Digital" },
];

const availFilters = [
  { id: undefined, label: "All" },
  { id: "open" as const, label: "Still here" },
];

const priceFilters = [
  { id: undefined, label: "Any" },
  { id: "10" as const, label: "Under a ten" },
  { id: "25" as const, label: "Under $25" },
];

const sortFilters = [
  { id: undefined, label: "As listed" },
  { id: "price" as const, label: "Cheap first" },
  { id: "price-desc" as const, label: "Dear first" },
];

export default async function ExplorePage({
  searchParams,
}: ExplorePageProps) {
  const params = await searchParams;
  const query = parseExploreFilters(params);
  const { hubId, type, avail, max, sort, unknown } = query;
  const chips: ExploreFilters = { hubId, type, avail, max, sort };
  const filtered = unknown ? [] : browseListings(chips);
  const activeHub = hubId
    ? mallHubs.find((hub) => hub.id === hubId)
    : undefined;
  const jar = await cookies();
  const featured = resolveFeaturedStall(
    featuredBookingsFromCookie(jar.get(AD_BOOKINGS_COOKIE)?.value),
  );
  const showFeatured = exploreShowsFeatured(query) && Boolean(featured);
  const empty = exploreEmptyCopy(query, activeHub?.name);

  return (
    <div>
      <MallWidth className="py-12 sm:py-16">
        <MallEyebrow>General concourse</MallEyebrow>
        <h1 className="mt-2 font-heading text-4xl tracking-tight text-balance sm:text-5xl">
          Explore the mall
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground text-pretty">
          Every listing on the floor, including sold and file-gone — unless you
          ask for still here. The good corner is paid and labeled. Duck into a
          hub when you want an aisle with rules.
        </p>

        <div className="mt-8 space-y-4 rounded-2xl border border-border bg-card px-3 py-4 sm:px-5">
          <FilterRow label="Hub">
            <FilterChip href={exploreHref({ ...chips, hubId: undefined })} active={!hubId}>
              All hubs
            </FilterChip>
            {mallHubs.map((hub) => (
              <FilterChip
                key={hub.id}
                href={exploreHref({ ...chips, hubId: hub.id })}
                active={hubId === hub.id}
              >
                {hub.name}
              </FilterChip>
            ))}
          </FilterRow>
          <FilterRow label="Kind">
            <FilterChip href={exploreHref({ ...chips, type: undefined })} active={!type}>
              Both
            </FilterChip>
            {typeFilters.map((item) => (
              <FilterChip
                key={item.id}
                href={exploreHref({ ...chips, type: item.id })}
                active={type === item.id}
              >
                {item.label}
              </FilterChip>
            ))}
          </FilterRow>
          <FilterRow label="On the floor">
            {availFilters.map((item) => (
              <FilterChip
                key={item.label}
                href={exploreHref({ ...chips, avail: item.id })}
                active={item.id ? avail === item.id : !avail || avail === "all"}
              >
                {item.label}
              </FilterChip>
            ))}
          </FilterRow>
          <FilterRow label="Price">
            {priceFilters.map((item) => (
              <FilterChip
                key={item.label}
                href={exploreHref({ ...chips, max: item.id })}
                active={item.id ? max === item.id : !max}
              >
                {item.label}
              </FilterChip>
            ))}
          </FilterRow>
          <FilterRow label="Sort">
            {sortFilters.map((item) => (
              <FilterChip
                key={item.label}
                href={exploreHref({ ...chips, sort: item.id })}
                active={item.id ? sort === item.id : !sort}
              >
                {item.label}
              </FilterChip>
            ))}
          </FilterRow>
        </div>

        <p className="mt-8 text-sm text-muted-foreground">
          {exploreCountLine(filtered.length, chips, activeHub?.name)}
        </p>
      </MallWidth>

      {showFeatured && featured ? (
        <FeaturedBooth
          slot={featured.slot}
          stallName={featured.stallName}
          eyebrow="Paid booth on the concourse"
        />
      ) : null}

      <MallWidth className="pb-16">
        {showFeatured ? (
          <MallEyebrow className="mb-4 pt-12">The rest of the floor</MallEyebrow>
        ) : null}
        {filtered.length === 0 ? (
          <BrowseEmpty
            title={empty.title}
            body={empty.body}
            actionHref={exploreHref()}
            actionLabel="Clear filters"
          />
        ) : (
          <ListingGrid
            listings={
              showFeatured && featured?.slot.stallId
                ? filtered.filter(
                    (listing) => listing.stallId !== featured.slot.stallId,
                  )
                : filtered
            }
          />
        )}
      </MallWidth>
    </div>
  );
}

function FilterRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-wrap items-center gap-2">
      <span className="w-[7.25rem] shrink-0 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </span>
      {children}
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
