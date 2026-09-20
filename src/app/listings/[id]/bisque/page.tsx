import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingBisqueView,
  type BisqueViewKind,
  type BisqueViewSheet,
} from "@/components/listing-bisque-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import {
  BISQUE_CHAIR_ID,
  BISQUE_COOKIE_NAME,
  BISQUE_LID_ID,
  BISQUE_REFUSE_COPY,
  BISQUE_WHISK_ID,
  canTapeBisque,
  isListingBisqueOverlay,
  parseBisqueListingIds,
} from "@/lib/listing-bisque";
import { listingHubName } from "@/lib/listing-display";
import { listingBisquePath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type BisquePageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): BisqueViewKind {
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
    return listing.id === BISQUE_CHAIR_ID ? "chair" : "sold";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.id === BISQUE_CHAIR_ID) {
    return "chair";
  }
  if (listing.id === BISQUE_LID_ID) {
    return "lid";
  }
  if (listing.id === BISQUE_WHISK_ID) {
    return "whisk";
  }
  if (!canTapeBisque(listing)) {
    return "owned";
  }
  return "physical";
}

function bisqueSheetForId(id: string, bisqueIds: string[]): BisqueViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isBisque: listing ? isListingBisqueOverlay(listing.id, bisqueIds) : false,
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
}: BisquePageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const bisqueIds = parseBisqueListingIds(jar.get(BISQUE_COOKIE_NAME)?.value);
  const sheet = bisqueSheetForId(id, bisqueIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: BISQUE_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a bisque note on.",
      path: listingBisquePath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: BISQUE_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a bisque note."
          : sheet.kind === "lid"
            ? "A lid does not take a bisque note. Bisque is a mug fire."
            : sheet.kind === "whisk"
              ? "A whisk does not take a bisque note. Bisque is a mug fire."
              : sheet.kind === "chair"
                ? "A chair does not take a bisque note. Bisque is a mug fire."
                : sheet.kind === "owned"
                  ? "A bisque note is for the diner mug. Another overlay already owns that listing."
                  : "A file does not take a bisque note. A bisque note is for the mug on the table.",
      path: listingBisquePath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not bisque it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not bisque it. Still a mug. Still a chip. Still tote. Not glaze. Not pickle. Not fettle.`,
    path: listingBisquePath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingBisquePage({ params }: BisquePageProps) {
  const { id } = await params;
  const jar = await cookies();
  const bisqueIds = parseBisqueListingIds(jar.get(BISQUE_COOKIE_NAME)?.value);
  const sheet = bisqueSheetForId(id, bisqueIds);

  return <ListingBisqueView sheet={sheet} bisqueIds={bisqueIds} />;
}
