import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingDressView,
  type DressViewKind,
  type DressViewSheet,
} from "@/components/listing-dress-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  DRESS_CHAIR_ID,
  DRESS_COOKIE_NAME,
  DRESS_MUG_ID,
  DRESS_REFUSE_COPY,
  DRESS_WHISK_ID,
  canTapeDress,
  isListingDressOverlay,
  parseDressListingIds,
} from "@/lib/listing-dress";
import { listingDressPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type DressPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): DressViewKind {
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
    return listing.id === DRESS_CHAIR_ID ? "chair" : "sold";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.id === DRESS_CHAIR_ID) {
    return "chair";
  }
  if (listing.id === DRESS_MUG_ID) {
    return "mug";
  }
  if (listing.id === DRESS_WHISK_ID) {
    return "whisk";
  }
  if (!canTapeDress(listing)) {
    return "owned";
  }
  return "physical";
}

function dressSheetForId(
  id: string,
  dressIds: string[],
): DressViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isDress: listing
      ? isListingDressOverlay(listing.id, dressIds)
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
}: DressPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const dressIds = parseDressListingIds(
    jar.get(DRESS_COOKIE_NAME)?.value,
  );
  const sheet = dressSheetForId(id, dressIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: DRESS_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a dress note on.",
      path: listingDressPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: DRESS_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a dress note."
          : sheet.kind === "mug"
            ? "A mug does not take a dress note. Dress honesty is for the pot lid."
            : sheet.kind === "whisk"
              ? "A whisk does not take a dress note. Dress honesty is for the pot lid."
              : sheet.kind === "chair"
                ? "A chair does not take a dress note. Dress honesty is for the pot lid."
                : sheet.kind === "owned"
                  ? "A dress note is for the pot lid. Another overlay already owns that listing."
                  : "A file does not take a dress note. A dress note is for the lid on the table.",
      path: listingDressPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not dress it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not dress it. Still a lid. Still no pot. Still tote. Not flycut. Not snug. Not spotface.`,
    path: listingDressPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingDressPage({
  params,
}: DressPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const dressIds = parseDressListingIds(
    jar.get(DRESS_COOKIE_NAME)?.value,
  );
  const sheet = dressSheetForId(id, dressIds);

  return <ListingDressView sheet={sheet} dressIds={dressIds} />;
}
