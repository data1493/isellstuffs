import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingBleedView,
  type BleedViewKind,
  type BleedViewSheet,
} from "@/components/listing-bleed-view";
import {
  formatMoney,
  isDigitalListing,
  isGiftListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import {
  BLEED_COOKIE_NAME,
  BLEED_REFUSE_COPY,
  canTapeBleed,
  isListingBleedOverlay,
  parseBleedListingIds,
} from "@/lib/listing-bleed";
import { listingHubName } from "@/lib/listing-display";
import { listingBleedPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type BleedPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): BleedViewKind {
  if (!listing) {
    return "missing";
  }
  if (isGiftListing(listing)) {
    return "gift";
  }
  if (isDigitalListing(listing)) {
    if (listing.status === "file-gone") {
      return "file-gone";
    }
    if (!canTapeBleed(listing)) {
      return "owned";
    }
    return "digital";
  }
  if (listing.status === "sold") {
    return "sold";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  return "physical";
}

function bleedSheetForId(id: string, bleedIds: string[]): BleedViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isBleed: listing ? isListingBleedOverlay(listing.id, bleedIds) : false,
    title: listing?.title ?? null,
    priceLabel: listing ? formatMoney(listing.price) : null,
    fact: listing
      ? isDigitalListing(listing)
        ? listing.fileFormat
        : listing.condition
      : null,
    stallName: stall?.boothName ?? listing?.stallId ?? null,
    stallSlug: stall?.slug ?? null,
    hubName: listing ? listingHubName(listing) : null,
    listing: listing ?? null,
  };
}

export async function generateMetadata({
  params,
}: BleedPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const bleedIds = parseBleedListingIds(jar.get(BLEED_COOKIE_NAME)?.value);
  const sheet = bleedSheetForId(id, bleedIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: BLEED_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a bleed note on.",
      path: listingBleedPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "digital") {
    return shareMetadata({
      title: BLEED_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a bleed note."
          : sheet.kind === "owned"
            ? "A bleed note is for the Side A liner. Another overlay already owns that listing."
            : "A jacket does not take a bleed note. A bleed note is for one liner page.",
      path: listingBleedPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not bleed it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not bleed it. Still one page. Still wrong. Still tote. Not typeset. Not errata. Not a shop. Not preflight.`,
    path: listingBleedPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingBleedPage({ params }: BleedPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const bleedIds = parseBleedListingIds(jar.get(BLEED_COOKIE_NAME)?.value);
  const sheet = bleedSheetForId(id, bleedIds);

  return <ListingBleedView sheet={sheet} bleedIds={bleedIds} />;
}
