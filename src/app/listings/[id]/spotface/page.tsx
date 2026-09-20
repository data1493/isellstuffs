import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingSpotfaceView,
  type SpotfaceViewKind,
  type SpotfaceViewSheet,
} from "@/components/listing-spotface-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  SPOTFACE_CHAIR_ID,
  SPOTFACE_COOKIE_NAME,
  SPOTFACE_MUG_ID,
  SPOTFACE_REFUSE_COPY,
  SPOTFACE_WHISK_ID,
  canTapeSpotface,
  isListingSpotfaceOverlay,
  parseSpotfaceListingIds,
} from "@/lib/listing-spotface";
import { listingSpotfacePath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type SpotfacePageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): SpotfaceViewKind {
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
    return listing.id === SPOTFACE_CHAIR_ID ? "chair" : "sold";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.id === SPOTFACE_CHAIR_ID) {
    return "chair";
  }
  if (listing.id === SPOTFACE_MUG_ID) {
    return "mug";
  }
  if (listing.id === SPOTFACE_WHISK_ID) {
    return "whisk";
  }
  if (!canTapeSpotface(listing)) {
    return "owned";
  }
  return "physical";
}

function spotfaceSheetForId(
  id: string,
  spotfaceIds: string[],
): SpotfaceViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isSpotface: listing
      ? isListingSpotfaceOverlay(listing.id, spotfaceIds)
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
}: SpotfacePageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const spotfaceIds = parseSpotfaceListingIds(
    jar.get(SPOTFACE_COOKIE_NAME)?.value,
  );
  const sheet = spotfaceSheetForId(id, spotfaceIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: SPOTFACE_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a spotface note on.",
      path: listingSpotfacePath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: SPOTFACE_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a spotface note."
          : sheet.kind === "mug"
            ? "A mug does not take a spotface note. Spotface honesty is for the pot lid."
            : sheet.kind === "whisk"
              ? "A whisk does not take a spotface note. Spotface honesty is for the pot lid."
              : sheet.kind === "chair"
                ? "A chair does not take a spotface note. Spotface honesty is for the pot lid."
                : sheet.kind === "owned"
                  ? "A spotface note is for the pot lid. Another overlay already owns that listing."
                  : "A file does not take a spotface note. A spotface note is for the lid on the table.",
      path: listingSpotfacePath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not spotface it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not spotface it. Still a lid. Still no pot. Still tote. Not snug. Not tap. Not lap.`,
    path: listingSpotfacePath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingSpotfacePage({
  params,
}: SpotfacePageProps) {
  const { id } = await params;
  const jar = await cookies();
  const spotfaceIds = parseSpotfaceListingIds(
    jar.get(SPOTFACE_COOKIE_NAME)?.value,
  );
  const sheet = spotfaceSheetForId(id, spotfaceIds);

  return <ListingSpotfaceView sheet={sheet} spotfaceIds={spotfaceIds} />;
}
