import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingCountersinkView,
  type CountersinkViewKind,
  type CountersinkViewSheet,
} from "@/components/listing-countersink-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  COUNTERSINK_CHAIR_ID,
  COUNTERSINK_COOKIE_NAME,
  COUNTERSINK_MUG_ID,
  COUNTERSINK_REFUSE_COPY,
  COUNTERSINK_WHISK_ID,
  canTapeCountersink,
  isListingCountersinkOverlay,
  parseCountersinkListingIds,
} from "@/lib/listing-countersink";
import { listingCountersinkPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type CountersinkPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): CountersinkViewKind {
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
    return listing.id === COUNTERSINK_CHAIR_ID ? "chair" : "sold";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.id === COUNTERSINK_CHAIR_ID) {
    return "chair";
  }
  if (listing.id === COUNTERSINK_MUG_ID) {
    return "mug";
  }
  if (listing.id === COUNTERSINK_WHISK_ID) {
    return "whisk";
  }
  if (!canTapeCountersink(listing)) {
    return "owned";
  }
  return "physical";
}

function countersinkSheetForId(
  id: string,
  countersinkIds: string[],
): CountersinkViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isCountersink: listing
      ? isListingCountersinkOverlay(listing.id, countersinkIds)
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
}: CountersinkPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const countersinkIds = parseCountersinkListingIds(
    jar.get(COUNTERSINK_COOKIE_NAME)?.value,
  );
  const sheet = countersinkSheetForId(id, countersinkIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: COUNTERSINK_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a countersink note on.",
      path: listingCountersinkPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: COUNTERSINK_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a countersink note."
          : sheet.kind === "mug"
            ? "A mug does not take a countersink note. Countersink honesty is for the pot lid."
            : sheet.kind === "whisk"
              ? "A whisk does not take a countersink note. Countersink honesty is for the pot lid."
              : sheet.kind === "chair"
                ? "A chair does not take a countersink note. Countersink honesty is for the pot lid."
                : sheet.kind === "owned"
                  ? "A countersink note is for the pot lid. Another overlay already owns that listing."
                  : "A file does not take a countersink note. A countersink note is for the lid on the table.",
      path: listingCountersinkPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not countersink it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not countersink it. Still a lid. Still no pot. Still tote. Not snug. Not tap. Not spotface.`,
    path: listingCountersinkPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingCountersinkPage({
  params,
}: CountersinkPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const countersinkIds = parseCountersinkListingIds(
    jar.get(COUNTERSINK_COOKIE_NAME)?.value,
  );
  const sheet = countersinkSheetForId(id, countersinkIds);

  return (
    <ListingCountersinkView sheet={sheet} countersinkIds={countersinkIds} />
  );
}
