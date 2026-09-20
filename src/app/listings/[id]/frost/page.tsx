import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingFrostView,
  type FrostViewKind,
  type FrostViewSheet,
} from "@/components/listing-frost-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  FROST_CHAIR_ID,
  FROST_COOKIE_NAME,
  FROST_MUG_ID,
  FROST_REFUSE_COPY,
  FROST_WHISK_ID,
  canTapeFrost,
  isListingFrostOverlay,
  parseFrostListingIds,
} from "@/lib/listing-frost";
import { listingFrostPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type FrostPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): FrostViewKind {
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
    return listing.id === FROST_CHAIR_ID ? "chair" : "sold";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.id === FROST_CHAIR_ID) {
    return "chair";
  }
  if (listing.id === FROST_MUG_ID) {
    return "mug";
  }
  if (listing.id === FROST_WHISK_ID) {
    return "whisk";
  }
  if (!canTapeFrost(listing)) {
    return "owned";
  }
  return "physical";
}

function frostSheetForId(
  id: string,
  frostIds: string[],
): FrostViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isFrost: listing
      ? isListingFrostOverlay(listing.id, frostIds)
      : false,
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
}: FrostPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const frostIds = parseFrostListingIds(
    jar.get(FROST_COOKIE_NAME)?.value,
  );
  const sheet = frostSheetForId(id, frostIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: FROST_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a frost note on.",
      path: listingFrostPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: FROST_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a frost note."
          : sheet.kind === "mug"
            ? "A mug does not take a frost note. Frost honesty is for the pot lid."
            : sheet.kind === "whisk"
              ? "A whisk does not take a frost note. Frost honesty is for the pot lid."
              : sheet.kind === "chair"
                ? "A chair does not take a frost note. Frost honesty is for the pot lid."
                : sheet.kind === "owned"
                  ? "A frost note is for the pot lid. Another overlay already owns that listing."
                  : "A file does not take a frost note. A frost note is for the lid on the table.",
      path: listingFrostPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not frost it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not frost it. Still a lid. Still no pot. Still tote. Not prussian. Not wedge. Not countersink.`,
    path: listingFrostPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingFrostPage({
  params,
}: FrostPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const frostIds = parseFrostListingIds(
    jar.get(FROST_COOKIE_NAME)?.value,
  );
  const sheet = frostSheetForId(id, frostIds);

  return <ListingFrostView sheet={sheet} frostIds={frostIds} />;
}
