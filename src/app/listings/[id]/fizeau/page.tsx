import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingFizeauView,
  type FizeauViewKind,
  type FizeauViewSheet,
} from "@/components/listing-fizeau-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  FIZEAU_CHAIR_ID,
  FIZEAU_COOKIE_NAME,
  FIZEAU_MUG_ID,
  FIZEAU_REFUSE_COPY,
  FIZEAU_WHISK_ID,
  canTapeFizeau,
  isListingFizeauOverlay,
  parseFizeauListingIds,
} from "@/lib/listing-fizeau";
import { listingFizeauPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type FizeauPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): FizeauViewKind {
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
    return listing.id === FIZEAU_CHAIR_ID ? "chair" : "sold";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.id === FIZEAU_CHAIR_ID) {
    return "chair";
  }
  if (listing.id === FIZEAU_MUG_ID) {
    return "mug";
  }
  if (listing.id === FIZEAU_WHISK_ID) {
    return "whisk";
  }
  if (!canTapeFizeau(listing)) {
    return "owned";
  }
  return "physical";
}

function fizeauSheetForId(
  id: string,
  fizeauIds: string[],
): FizeauViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isFizeau: listing
      ? isListingFizeauOverlay(listing.id, fizeauIds)
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
}: FizeauPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const fizeauIds = parseFizeauListingIds(
    jar.get(FIZEAU_COOKIE_NAME)?.value,
  );
  const sheet = fizeauSheetForId(id, fizeauIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: FIZEAU_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a fizeau note on.",
      path: listingFizeauPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: FIZEAU_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a fizeau note."
          : sheet.kind === "mug"
            ? "A mug does not take a fizeau note. Fizeau honesty is for the pot lid."
            : sheet.kind === "whisk"
              ? "A whisk does not take a fizeau note. Fizeau honesty is for the pot lid."
              : sheet.kind === "chair"
                ? "A chair does not take a fizeau note. Fizeau honesty is for the pot lid."
                : sheet.kind === "owned"
                  ? "A fizeau note is for the pot lid. Another overlay already owns that listing."
                  : "A file does not take a fizeau note. A fizeau note is for the lid on the table.",
      path: listingFizeauPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not fizeau it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not fizeau it. Still a lid. Still no pot. Still tote. Not fringe. Not frost. Not countersink.`,
    path: listingFizeauPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingFizeauPage({
  params,
}: FizeauPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const fizeauIds = parseFizeauListingIds(
    jar.get(FIZEAU_COOKIE_NAME)?.value,
  );
  const sheet = fizeauSheetForId(id, fizeauIds);

  return <ListingFizeauView sheet={sheet} fizeauIds={fizeauIds} />;
}
