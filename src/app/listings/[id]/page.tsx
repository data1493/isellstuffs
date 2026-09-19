import type { Metadata } from "next";
import Link from "next/link";

import { JsonLd } from "@/components/json-ld";
import { ListingMissing } from "@/components/mall-missing";
import { ListingBuyBox } from "@/components/listing-buy-box";
import { ListingMediaPlaceholder } from "@/components/listing-media-placeholder";
import { ListingTypeBadge } from "@/components/listing-type-badge";
import { ListingAskNotice } from "@/components/listing-ask-notice";
import { ListingFirmNotice } from "@/components/listing-firm-notice";
import { ListingHandsNotice } from "@/components/listing-hands-notice";
import { ListingHeavyNotice } from "@/components/listing-heavy-notice";
import { ListingCellsNotice } from "@/components/listing-cells-notice";
import { ListingPartsNotice } from "@/components/listing-parts-notice";
import { ListingPocketsNotice } from "@/components/listing-pockets-notice";
import { ListingPressNotice } from "@/components/listing-press-notice";
import { ListingSmokeNotice } from "@/components/listing-smoke-notice";
import { ListingFitsNotice } from "@/components/listing-fits-notice";
import { ListingPlaysNotice } from "@/components/listing-plays-notice";
import { ListingSizeNotice } from "@/components/listing-size-notice";
import { ListingLacesNotice } from "@/components/listing-laces-notice";
import { ListingCasesNotice } from "@/components/listing-cases-notice";
import { ListingHeatNotice } from "@/components/listing-heat-notice";
import { ListingBentNotice } from "@/components/listing-bent-notice";
import { ListingCordNotice } from "@/components/listing-cord-notice";
import { ListingWashNotice } from "@/components/listing-wash-notice";
import { ListingRemoteNotice } from "@/components/listing-remote-notice";
import { ListingSkipNotice } from "@/components/listing-skip-notice";
import { ListingGradeNotice } from "@/components/listing-grade-notice";
import { ListingWorkbookNotice } from "@/components/listing-workbook-notice";
import { ListingStemsNotice } from "@/components/listing-stems-notice";
import { ListingPileNotice } from "@/components/listing-pile-notice";
import { ListingStrapNotice } from "@/components/listing-strap-notice";
import { ListingRingNotice } from "@/components/listing-ring-notice";
import { ListingNeedleNotice } from "@/components/listing-needle-notice";
import { ListingBookNotice } from "@/components/listing-book-notice";
import { ListingHissNotice } from "@/components/listing-hiss-notice";
import { ListingToeNotice } from "@/components/listing-toe-notice";
import { ListingKeyNotice } from "@/components/listing-key-notice";
import { ListingHingeNotice } from "@/components/listing-hinge-notice";
import { ListingChipNotice } from "@/components/listing-chip-notice";
import { ListingKnobNotice } from "@/components/listing-knob-notice";
import { ListingBoxNotice } from "@/components/listing-box-notice";
import { ListingHairNotice } from "@/components/listing-hair-notice";
import { ListingLineNotice } from "@/components/listing-line-notice";
import { ListingSongsNotice } from "@/components/listing-songs-notice";
import { ListingVibeNotice } from "@/components/listing-vibe-notice";
import { ListingClipNotice } from "@/components/listing-clip-notice";
import { ListingWrongNotice } from "@/components/listing-wrong-notice";
import { ListingFoundryNotice } from "@/components/listing-foundry-notice";
import { ListingConvertNotice } from "@/components/listing-convert-notice";
import { ListingBpmNotice } from "@/components/listing-bpm-notice";
import { ListingManualNotice } from "@/components/listing-manual-notice";
import { ListingOilNotice } from "@/components/listing-oil-notice";
import { ListingSleeveNotice } from "@/components/listing-sleeve-notice";
import { ListingDustNotice } from "@/components/listing-dust-notice";
import { ListingCrackNotice } from "@/components/listing-crack-notice";
import { ListingInkNotice } from "@/components/listing-ink-notice";
import { ListingSoleNotice } from "@/components/listing-sole-notice";
import { ListingDumpNotice } from "@/components/listing-dump-notice";
import { ListingPhoneNotice } from "@/components/listing-phone-notice";
import { ListingRipNotice } from "@/components/listing-rip-notice";
import { ListingCardsNotice } from "@/components/listing-cards-notice";
import { ListingZipNotice } from "@/components/listing-zip-notice";
import { ListingScanNotice } from "@/components/listing-scan-notice";
import { ListingVanNotice } from "@/components/listing-van-notice";
import { ListingWithNotice } from "@/components/listing-with-notice";
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
import {
  listingAskPath,
  listingCellsPath,
  listingFitsPath,
  listingFirmPath,
  listingHandsPath,
  listingHeavyPath,
  listingLookPath,
  listingOfferPath,
  listingPath,
  listingPartsPath,
  listingPlaysPath,
  listingPocketsPath,
  listingPressPath,
  listingScanPath,
  listingLacesPath,
  listingCasesPath,
  listingHeatPath,
  listingBentPath,
  listingCordPath,
  listingWashPath,
  listingRemotePath,
  listingSkipPath,
  listingGradePath,
  listingWorkbookPath,
  listingStemsPath,
  listingPilePath,
  listingStrapPath,
  listingRingPath,
  listingNeedlePath,
  listingBookPath,
  listingHissPath,
  listingToePath,
  listingKeyPath,
  listingHingePath,
  listingChipPath,
  listingKnobPath,
  listingBoxPath,
  listingHairPath,
  listingLinePath,
  listingSongsPath,
  listingVibePath,
  listingClipPath,
  listingWrongPath,
  listingFoundryPath,
  listingConvertPath,
  listingBpmPath,
  listingManualPath,
  listingOilPath,
  listingSleevePath,
  listingDustPath,
  listingCrackPath,
  listingInkPath,
  listingSolePath,
  listingDumpPath,
  listingPhonePath,
  listingRipPath,
  listingCardsPath,
  listingZipPath,
  listingSizePath,
  listingSmokePath,
  listingTagPath,
  listingVanPath,
  listingWithPath,
  stallPath,
} from "@/lib/paths";
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

              {physical ? <ListingVanNotice listingId={listing.id} /> : null}
              {physical ? <ListingFirmNotice listingId={listing.id} /> : null}
              {physical ? <ListingHandsNotice listingId={listing.id} /> : null}
              {physical ? <ListingWithNotice listingId={listing.id} /> : null}
              {physical ? <ListingAskNotice listingId={listing.id} /> : null}
              <ListingScanNotice listingId={listing.id} />
              {physical ? <ListingHeavyNotice listingId={listing.id} /> : null}
              {physical ? <ListingPocketsNotice listingId={listing.id} /> : null}
              {physical ? <ListingPressNotice listingId={listing.id} /> : null}
              {physical ? <ListingPartsNotice listingId={listing.id} /> : null}
              {physical ? <ListingCellsNotice listingId={listing.id} /> : null}
              {physical ? <ListingSmokeNotice listingId={listing.id} /> : null}
              {physical ? <ListingSizeNotice listingId={listing.id} /> : null}
              {physical ? <ListingFitsNotice listingId={listing.id} /> : null}
              {physical ? <ListingPlaysNotice listingId={listing.id} /> : null}
              {physical ? <ListingLacesNotice listingId={listing.id} /> : null}
              {physical ? <ListingCasesNotice listingId={listing.id} /> : null}
              {physical ? <ListingHeatNotice listingId={listing.id} /> : null}
              {physical ? <ListingBentNotice listingId={listing.id} /> : null}
              {physical ? <ListingCordNotice listingId={listing.id} /> : null}
              {physical ? <ListingWashNotice listingId={listing.id} /> : null}
              {physical ? <ListingRemoteNotice listingId={listing.id} /> : null}
              {physical ? <ListingSkipNotice listingId={listing.id} /> : null}
              {!physical ? <ListingGradeNotice listingId={listing.id} /> : null}
              {!physical ? (
                <ListingWorkbookNotice listingId={listing.id} />
              ) : null}
              {!physical ? <ListingStemsNotice listingId={listing.id} /> : null}
              {!physical ? <ListingVibeNotice listingId={listing.id} /> : null}
              {!physical ? <ListingClipNotice listingId={listing.id} /> : null}
              {!physical ? <ListingCardsNotice listingId={listing.id} /> : null}
              {!physical ? <ListingWrongNotice listingId={listing.id} /> : null}
              {!physical ? (
                <ListingFoundryNotice listingId={listing.id} />
              ) : null}
              {!physical ? (
                <ListingConvertNotice listingId={listing.id} />
              ) : null}
              {!physical ? <ListingBpmNotice listingId={listing.id} /> : null}
              {physical ? <ListingPileNotice listingId={listing.id} /> : null}
              {physical ? <ListingStrapNotice listingId={listing.id} /> : null}
              {physical ? <ListingRingNotice listingId={listing.id} /> : null}
              {physical ? <ListingNeedleNotice listingId={listing.id} /> : null}
              {physical ? <ListingBookNotice listingId={listing.id} /> : null}
              {physical ? <ListingHissNotice listingId={listing.id} /> : null}
              {physical ? <ListingToeNotice listingId={listing.id} /> : null}
              {physical ? <ListingKeyNotice listingId={listing.id} /> : null}
              {physical ? <ListingHingeNotice listingId={listing.id} /> : null}
              {physical ? <ListingChipNotice listingId={listing.id} /> : null}
              {physical ? <ListingKnobNotice listingId={listing.id} /> : null}
              {physical ? <ListingManualNotice listingId={listing.id} /> : null}
              {physical ? <ListingBoxNotice listingId={listing.id} /> : null}
              {physical ? <ListingOilNotice listingId={listing.id} /> : null}
              {physical ? <ListingHairNotice listingId={listing.id} /> : null}
              {physical ? <ListingLineNotice listingId={listing.id} /> : null}
              {physical ? <ListingSongsNotice listingId={listing.id} /> : null}
              {physical ? <ListingSleeveNotice listingId={listing.id} /> : null}
              {physical ? <ListingDustNotice listingId={listing.id} /> : null}
              {physical ? <ListingCrackNotice listingId={listing.id} /> : null}
              {physical ? <ListingInkNotice listingId={listing.id} /> : null}
              {physical ? <ListingSoleNotice listingId={listing.id} /> : null}
              {physical ? <ListingDumpNotice listingId={listing.id} /> : null}
              {physical ? <ListingPhoneNotice listingId={listing.id} /> : null}
              {physical ? <ListingRipNotice listingId={listing.id} /> : null}
              {physical ? <ListingZipNotice listingId={listing.id} /> : null}

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
                  <Link
                    href={listingLookPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    Look, don't bag
                  </Link>
                  <Link
                    href={listingVanPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    More in the van
                  </Link>
                  <Link
                    href={listingFirmPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    That&apos;s the price
                  </Link>
                  <Link
                    href={listingHandsPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    In someone&apos;s hands
                  </Link>
                  <Link
                    href={listingWithPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    These two go together
                  </Link>
                  <Link
                    href={listingAskPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    Ask before you flip it
                  </Link>
                  <Link
                    href={listingScanPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    Scan the liner
                  </Link>
                  <Link
                    href={listingHeavyPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    Needs two people
                  </Link>
                  <Link
                    href={listingPocketsPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    Pockets are empty
                  </Link>
                  <Link
                    href={listingPressPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    Which press
                  </Link>
                  <Link
                    href={listingPartsPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    Sold for parts
                  </Link>
                  <Link
                    href={listingCellsPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    Batteries not included
                  </Link>
                  <Link
                    href={listingSmokePath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    Smells like smoke
                  </Link>
                  <Link
                    href={listingSizePath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    Tag says L
                  </Link>
                  <Link
                    href={listingFitsPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    Fits a 3-quart
                  </Link>
                  <Link
                    href={listingPlaysPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I played it once
                  </Link>
                  <Link
                    href={listingLacesPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I kept the good laces
                  </Link>
                  <Link
                    href={listingCasesPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    The discs walked
                  </Link>
                  <Link
                    href={listingHeatPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    Not for the microwave
                  </Link>
                  <Link
                    href={listingBentPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    Leave it bent
                  </Link>
                  <Link
                    href={listingCordPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    Rewired
                  </Link>
                  <Link
                    href={listingWashPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I washed it
                  </Link>
                  <Link
                    href={listingRemotePath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    The remote walked
                  </Link>
                  <Link
                    href={listingSkipPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    The skip stays
                  </Link>
                  <Link
                    href={listingPilePath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    Won&apos;t split the pile
                  </Link>
                  <Link
                    href={listingStrapPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    The strap walked
                  </Link>
                  <Link
                    href={listingRingPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    The water ring stays
                  </Link>
                  <Link
                    href={listingNeedlePath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    The needle walked
                  </Link>
                  <Link
                    href={listingBookPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    The booklet walked
                  </Link>
                  <Link
                    href={listingHissPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    The hiss stays
                  </Link>
                  <Link
                    href={listingToePath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    The peel stays
                  </Link>
                  <Link
                    href={listingKeyPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    The key walked
                  </Link>
                  <Link
                    href={listingHingePath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    The hinge stays gone
                  </Link>
                  <Link
                    href={listingChipPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    The chip stays
                  </Link>
                  <Link
                    href={listingKnobPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    The knob stays loose
                  </Link>
                  <Link
                    href={listingManualPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    There is no manual
                  </Link>
                  <Link
                    href={listingBoxPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    The shade stays in the box
                  </Link>
                  <Link
                    href={listingOilPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    Needs a drop of oil
                  </Link>
                  <Link
                    href={listingHairPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    Pet hair stays
                  </Link>
                  <Link
                    href={listingLinePath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    The line stays
                  </Link>
                  <Link
                    href={listingSongsPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I will not title the songs
                  </Link>
                  <Link
                    href={listingSleevePath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    The grocery bag is the sleeve
                  </Link>
                  <Link
                    href={listingDustPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    The dust stays
                  </Link>
                  <Link
                    href={listingCrackPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    The crack stays
                  </Link>
                  <Link
                    href={listingInkPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    The Sharpie stays
                  </Link>
                  <Link
                    href={listingSolePath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I will not resole
                  </Link>
                  <Link
                    href={listingDumpPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I don't dump
                  </Link>
                  <Link
                    href={listingPhonePath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I don't know the phone
                  </Link>
                  <Link
                    href={listingRipPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I don't rip
                  </Link>
                  <Link
                    href={listingZipPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I don't have the zip
                  </Link>
                </p>
              ) : listing.fileFormat.toUpperCase().includes("GIFT") ? null : (
                <p className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-x-4">
                  <Link
                    href={listingScanPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    Scan the liner
                  </Link>
                  <Link
                    href={listingGradePath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I don't grade your lot
                  </Link>
                  <Link
                    href={listingWorkbookPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    There is no workbook
                  </Link>
                  <Link
                    href={listingStemsPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    These twelve shots
                  </Link>
                  <Link
                    href={listingVibePath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    Measurements are vibes
                  </Link>
                  <Link
                    href={listingClipPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    The clip walked
                  </Link>
                  <Link
                    href={listingCardsPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I will not type the cards
                  </Link>
                  <Link
                    href={listingWrongPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    Wrong on purpose
                  </Link>
                  <Link
                    href={listingFoundryPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    Not a foundry seat
                  </Link>
                  <Link
                    href={listingConvertPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    I don't convert
                  </Link>
                  <Link
                    href={listingBpmPath(listing.id)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    BPM is a guess
                  </Link>
                </p>
              )}

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
