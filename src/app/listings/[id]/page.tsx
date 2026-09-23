import type { Metadata } from "next";
import Link from "next/link";

import { JsonLd } from "@/components/json-ld";
import { ListingMissing } from "@/components/mall-missing";
import { ListingBuyBox } from "@/components/listing-buy-box";
import { ListingMediaPlaceholder } from "@/components/listing-media-placeholder";
import { ListingTypeBadge } from "@/components/listing-type-badge";
import { TestedKindaChip } from "@/components/sell/tested-kinda-chip";
import { PickupNote } from "@/components/pickup-note";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { Badge } from "@/components/ui/badge";
import {
  formatMoney,
  isDigitalListing,
  isPhysicalListing,
  listingById,
  listings,
  listingsByStall,
  stallById,
  type Listing,
} from "@/lib/commerce";
import {
  listingFact,
  listingHeroEyebrow,
  listingHub,
  listingSiblingKicker,
  listingStatusLabel,
} from "@/lib/listing-display";
import { listingOfferPath, listingPath, listingTagPath, stallPath } from "@/lib/paths";
import { listingMetadata, listingProductJsonLd, missingListingMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type ListingPageProps = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return listings.map((listing) => ({ id: listing.id }));
}

export async function generateMetadata({
  params,
}: ListingPageProps): Promise<Metadata> {
  const { id } = await params;
  const listing = listingById(id);

  if (!listing) {
    return missingListingMetadata();
  }

  return listingMetadata(listing);
}

function SiblingRow({
  title,
  items,
}: {
  title: string;
  items: Listing[];
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div>
      <h3 className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
        {title}
      </h3>
      <ul className="mt-3 grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <li key={item.id}>
            <Link
              href={listingPath(item.id)}
              className={cn(
                "flex h-full flex-col overflow-hidden rounded-xl bg-card ring-1 transition-shadow hover:ring-foreground/20",
                isPhysicalListing(item)
                  ? "ring-primary/12"
                  : "ring-accent-foreground/12",
              )}
            >
              <ListingMediaPlaceholder
                listing={item}
                compact
                className="rounded-none rounded-t-xl border-0 border-b border-dashed"
              />
              <div className="flex flex-col gap-2 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <ListingTypeBadge listing={item} />
                  <span className="text-xs text-muted-foreground">
                    {listingStatusLabel(item)}
                  </span>
                </div>
                <p className="font-heading text-lg leading-snug">{item.title}</p>
                <p className="text-sm text-muted-foreground">
                  {formatMoney(item.price)} · {listingFact(item)}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default async function ListingPage({ params }: ListingPageProps) {
  const { id } = await params;
  const listing = listingById(id);

  if (!listing) {
    return <ListingMissing />;
  }

  const stall = stallById(listing.stallId);
  const hub = listingHub(listing);
  const physical = isPhysicalListing(listing);
  const siblings = listingsByStall(listing.stallId).filter(
    (item) => item.id !== listing.id,
  );
  const siblingPhysical = siblings.filter(isPhysicalListing);
  const siblingDigital = siblings.filter(isDigitalListing);

  return (
    <div data-listing-type={listing.type}>
      <JsonLd data={listingProductJsonLd(listing)} />
      <section
        className={cn(
          "border-b border-border",
          physical
            ? "bg-[linear-gradient(180deg,var(--card),var(--background))]"
            : "bg-[linear-gradient(180deg,color-mix(in_oklch,var(--accent)_40%,var(--card)),var(--background))]",
        )}
      >
        <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <MallCrumb label="Listing location">
            <CrumbSep />
            {stall ? (
              <Link
                href={stallPath(stall.slug)}
                className="hover:text-foreground hover:underline"
              >
                {stall.boothName}
              </Link>
            ) : (
              <span>Unknown stall</span>
            )}
            <CrumbSep />
            <span className="text-foreground">{listing.title}</span>
          </MallCrumb>

          <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-start">
            <ListingMediaPlaceholder listing={listing} />

            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-2">
                <ListingTypeBadge listing={listing} />
                <Badge
                  variant={
                    listing.status === "available" ? "ghost" : "destructive"
                  }
                >
                  {listingStatusLabel(listing)}
                </Badge>
                <Badge variant="outline">{hub.name}</Badge>
                <TestedKindaChip listingId={listing.id} />
              </div>

              <div className="space-y-3">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  {listingHeroEyebrow(listing)}
                </p>
                <h1 className="font-heading text-4xl leading-[1.1] tracking-tight text-balance sm:text-5xl">
                  {listing.title}
                </h1>
                <p className="text-base leading-7 text-muted-foreground sm:text-lg">
                  {listing.summary}
                </p>
              </div>

              <ListingBuyBox listing={listing} />

              {physical ? (
                <p className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-x-4">
                  <Link
                    href={listingTagPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    Print a driveway tag
                  </Link>
                  <Link
                    href={listingOfferPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    Tape an offer
                  </Link>
                </p>
              ) : null}

              {physical && stall ? <PickupNote stall={stall} /> : null}

              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <div className="rounded-xl bg-card/80 p-4 ring-1 ring-foreground/10">
                  <dt className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    Stall
                  </dt>
                  <dd className="mt-1 text-base text-foreground">
                    {stall ? (
                      <Link
                        href={stallPath(stall.slug)}
                        className="underline-offset-4 hover:underline"
                      >
                        {stall.boothName}
                      </Link>
                    ) : (
                      listing.stallId
                    )}
                  </dd>
                  {stall ? (
                    <dd className="mt-2 text-sm leading-6 text-muted-foreground">
                      {stall.blurb}
                    </dd>
                  ) : null}
                </div>
                <div className="rounded-xl bg-card/80 p-4 ring-1 ring-foreground/10">
                  <dt className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    Aisle rule
                  </dt>
                  <dd className="mt-1 font-heading text-lg tracking-tight">
                    {hub.name}
                  </dd>
                  <dd className="mt-2 text-sm leading-6 text-muted-foreground">
                    {hub.rule}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </section>

      {stall ? (
        <section>
          <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-12 sm:px-6 sm:py-16">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  Same stall · {listingSiblingKicker(listing)}
                </p>
                <h2 className="mt-2 font-heading text-3xl tracking-tight">
                  Also on {stall.boothName}
                </h2>
              </div>
              <Link
                href={stallPath(stall.slug)}
                className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                Open the whole stall
              </Link>
            </div>

            {siblings.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                This is the only SKU on the table right now.
              </p>
            ) : (
              <div className="space-y-8">
                <SiblingRow
                  title="Things you can hold"
                  items={siblingPhysical}
                />
                <SiblingRow
                  title="Files from the same stall"
                  items={siblingDigital}
                />
              </div>
            )}
          </div>
        </section>
      ) : null}
    </div>
  );
}
