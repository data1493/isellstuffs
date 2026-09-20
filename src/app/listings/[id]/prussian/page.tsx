import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingPrussianView,
  type PrussianViewKind,
  type PrussianViewSheet,
} from "@/components/listing-prussian-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  PRUSSIAN_CHAIR_ID,
  PRUSSIAN_COOKIE_NAME,
  PRUSSIAN_MUG_ID,
  PRUSSIAN_REFUSE_COPY,
  PRUSSIAN_WHISK_ID,
  canTapePrussian,
  isListingPrussianOverlay,
  parsePrussianListingIds,
} from "@/lib/listing-prussian";
import { listingPrussianPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type PrussianPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): PrussianViewKind {
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
    return listing.id === PRUSSIAN_CHAIR_ID ? "chair" : "sold";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.id === PRUSSIAN_CHAIR_ID) {
    return "chair";
  }
  if (listing.id === PRUSSIAN_MUG_ID) {
    return "mug";
  }
  if (listing.id === PRUSSIAN_WHISK_ID) {
    return "whisk";
  }
  if (!canTapePrussian(listing)) {
    return "owned";
  }
  return "physical";
}

function prussianSheetForId(
  id: string,
  prussianIds: string[],
): PrussianViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isPrussian: listing
      ? isListingPrussianOverlay(listing.id, prussianIds)
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
}: PrussianPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const prussianIds = parsePrussianListingIds(
    jar.get(PRUSSIAN_COOKIE_NAME)?.value,
  );
  const sheet = prussianSheetForId(id, prussianIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: PRUSSIAN_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a prussian note on.",
      path: listingPrussianPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: PRUSSIAN_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a prussian note."
          : sheet.kind === "mug"
            ? "A mug does not take a prussian note. Prussian honesty is for the pot lid."
            : sheet.kind === "whisk"
              ? "A whisk does not take a prussian note. Prussian honesty is for the pot lid."
              : sheet.kind === "chair"
                ? "A chair does not take a prussian note. Prussian honesty is for the pot lid."
                : sheet.kind === "owned"
                  ? "A prussian note is for the pot lid. Another overlay already owns that listing."
                  : "A file does not take a prussian note. A prussian note is for the lid on the table.",
      path: listingPrussianPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not prussian it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not prussian it. Still a lid. Still no pot. Still tote. Not wedge. Not sine. Not countersink.`,
    path: listingPrussianPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingPrussianPage({
  params,
}: PrussianPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const prussianIds = parsePrussianListingIds(
    jar.get(PRUSSIAN_COOKIE_NAME)?.value,
  );
  const sheet = prussianSheetForId(id, prussianIds);

  return <ListingPrussianView sheet={sheet} prussianIds={prussianIds} />;
}
