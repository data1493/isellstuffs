import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingFellView,
  type FellViewKind,
  type FellViewSheet,
} from "@/components/listing-fell-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import {
  FELL_CHAIR_ID,
  FELL_COOKIE_NAME,
  FELL_LAMP_ID,
  FELL_REFUSE_COPY,
  FELL_SNEAKER_ID,
  canTapeFell,
  isListingFellOverlay,
  parseFellListingIds,
} from "@/lib/listing-fell";
import { listingHubName } from "@/lib/listing-display";
import { listingFellPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type FellPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): FellViewKind {
  if (!listing) {
    return "missing";
  }
  if (isGiftListing(listing)) {
    return "gift";
  }
  if (!isPhysicalListing(listing)) {
    return listing.status === "file-gone" ? "file-gone" : "digital";
  }
  if (listing.status === "sold") {
    return listing.id === FELL_CHAIR_ID ? "chair" : "sold";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.id === FELL_CHAIR_ID) {
    return "chair";
  }
  if (listing.id === FELL_SNEAKER_ID) {
    return "sneakers";
  }
  if (listing.id === FELL_LAMP_ID) {
    return "lamp";
  }
  if (!canTapeFell(listing)) {
    return "owned";
  }
  return "physical";
}

function fellSheetForId(id: string, fellIds: string[]): FellViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isFell: listing ? isListingFellOverlay(listing.id, fellIds) : false,
    title: listing?.title ?? null,
    priceLabel: listing ? formatMoney(listing.price) : null,
    fact: listing
      ? isPhysicalListing(listing)
        ? listing.condition
        : listing.fileFormat
      : null,
    stallName: stall?.boothName ?? listing?.stallId ?? null,
    stallSlug: stall?.slug ?? null,
    hubName: listing ? listingHubName(listing) : null,
    listing: listing ?? null,
  };
}

export async function generateMetadata({
  params,
}: FellPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const fellIds = parseFellListingIds(jar.get(FELL_COOKIE_NAME)?.value);
  const sheet = fellSheetForId(id, fellIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: FELL_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a fell note on.",
      path: listingFellPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: FELL_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a fell note."
          : sheet.kind === "sneakers"
            ? "Sneakers do not take a fell note. Fell is a jacket seam."
            : sheet.kind === "lamp"
              ? "A lamp does not take a fell note. Fell is a jacket seam."
              : sheet.kind === "chair"
                ? "A chair does not take a fell note. Fell is a jacket seam."
                : sheet.kind === "owned"
                  ? "A fell note is for the windbreaker. Another overlay already owns that listing."
                  : "A file does not take a fell note. A fell note is for the jacket on the table.",
      path: listingFellPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not fell it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not fell it. Still worn twice. Still mint-green. Still tote. Not serge. Not dart. Not sew.`,
    path: listingFellPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingFellPage({ params }: FellPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const fellIds = parseFellListingIds(jar.get(FELL_COOKIE_NAME)?.value);
  const sheet = fellSheetForId(id, fellIds);

  return <ListingFellView sheet={sheet} fellIds={fellIds} />;
}
