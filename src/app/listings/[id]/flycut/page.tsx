import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingFlycutView,
  type FlycutViewKind,
  type FlycutViewSheet,
} from "@/components/listing-flycut-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  FLYCUT_CHAIR_ID,
  FLYCUT_COOKIE_NAME,
  FLYCUT_MUG_ID,
  FLYCUT_REFUSE_COPY,
  FLYCUT_WHISK_ID,
  canTapeFlycut,
  isListingFlycutOverlay,
  parseFlycutListingIds,
} from "@/lib/listing-flycut";
import { listingFlycutPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type FlycutPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): FlycutViewKind {
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
    return listing.id === FLYCUT_CHAIR_ID ? "chair" : "sold";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.id === FLYCUT_CHAIR_ID) {
    return "chair";
  }
  if (listing.id === FLYCUT_MUG_ID) {
    return "mug";
  }
  if (listing.id === FLYCUT_WHISK_ID) {
    return "whisk";
  }
  if (!canTapeFlycut(listing)) {
    return "owned";
  }
  return "physical";
}

function flycutSheetForId(
  id: string,
  flycutIds: string[],
): FlycutViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isFlycut: listing
      ? isListingFlycutOverlay(listing.id, flycutIds)
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
}: FlycutPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const flycutIds = parseFlycutListingIds(
    jar.get(FLYCUT_COOKIE_NAME)?.value,
  );
  const sheet = flycutSheetForId(id, flycutIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: FLYCUT_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a flycut note on.",
      path: listingFlycutPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: FLYCUT_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a flycut note."
          : sheet.kind === "mug"
            ? "A mug does not take a flycut note. Flycut honesty is for the pot lid."
            : sheet.kind === "whisk"
              ? "A whisk does not take a flycut note. Flycut honesty is for the pot lid."
              : sheet.kind === "chair"
                ? "A chair does not take a flycut note. Flycut honesty is for the pot lid."
                : sheet.kind === "owned"
                  ? "A flycut note is for the pot lid. Another overlay already owns that listing."
                  : "A file does not take a flycut note. A flycut note is for the lid on the table.",
      path: listingFlycutPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not flycut it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not flycut it. Still a lid. Still no pot. Still tote. Not snug. Not countersink. Not spotface.`,
    path: listingFlycutPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingFlycutPage({
  params,
}: FlycutPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const flycutIds = parseFlycutListingIds(
    jar.get(FLYCUT_COOKIE_NAME)?.value,
  );
  const sheet = flycutSheetForId(id, flycutIds);

  return <ListingFlycutView sheet={sheet} flycutIds={flycutIds} />;
}
