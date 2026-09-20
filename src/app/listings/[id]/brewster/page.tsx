import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingBrewsterView,
  type BrewsterViewKind,
  type BrewsterViewSheet,
} from "@/components/listing-brewster-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  BREWSTER_CHAIR_ID,
  BREWSTER_COOKIE_NAME,
  BREWSTER_MUG_ID,
  BREWSTER_REFUSE_COPY,
  BREWSTER_WHISK_ID,
  canTapeBrewster,
  isListingBrewsterOverlay,
  parseBrewsterListingIds,
} from "@/lib/listing-brewster";
import { listingBrewsterPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type BrewsterPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): BrewsterViewKind {
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
    return listing.id === BREWSTER_CHAIR_ID ? "chair" : "sold";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.id === BREWSTER_CHAIR_ID) {
    return "chair";
  }
  if (listing.id === BREWSTER_MUG_ID) {
    return "mug";
  }
  if (listing.id === BREWSTER_WHISK_ID) {
    return "whisk";
  }
  if (!canTapeBrewster(listing)) {
    return "owned";
  }
  return "physical";
}

function brewsterSheetForId(
  id: string,
  brewsterIds: string[],
): BrewsterViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isBrewster: listing
      ? isListingBrewsterOverlay(listing.id, brewsterIds)
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
}: BrewsterPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const brewsterIds = parseBrewsterListingIds(
    jar.get(BREWSTER_COOKIE_NAME)?.value,
  );
  const sheet = brewsterSheetForId(id, brewsterIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: BREWSTER_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a brewster note on.",
      path: listingBrewsterPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: BREWSTER_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a brewster note."
          : sheet.kind === "mug"
            ? "A mug does not take a brewster note. Brewster honesty is for the pot lid."
            : sheet.kind === "whisk"
              ? "A whisk does not take a brewster note. Brewster honesty is for the pot lid."
              : sheet.kind === "chair"
                ? "A chair does not take a brewster note. Brewster honesty is for the pot lid."
                : sheet.kind === "owned"
                  ? "A brewster note is for the pot lid. Another overlay already owns that listing."
                  : "A file does not take a brewster note. A brewster note is for the lid on the table.",
      path: listingBrewsterPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not brewster it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not brewster it. Still a lid. Still no pot. Still tote. Not haidinger. Not fizeau. Not countersink.`,
    path: listingBrewsterPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingBrewsterPage({
  params,
}: BrewsterPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const brewsterIds = parseBrewsterListingIds(
    jar.get(BREWSTER_COOKIE_NAME)?.value,
  );
  const sheet = brewsterSheetForId(id, brewsterIds);

  return <ListingBrewsterView sheet={sheet} brewsterIds={brewsterIds} />;
}
