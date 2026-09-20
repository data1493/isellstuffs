import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingPinchView,
  type PinchViewKind,
  type PinchViewSheet,
} from "@/components/listing-pinch-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import {
  PINCH_CHAIR_ID,
  PINCH_COOKIE_NAME,
  PINCH_JEWELS_ID,
  PINCH_LP_ID,
  PINCH_REFUSE_COPY,
  canTapePinch,
  isListingPinchOverlay,
  parsePinchListingIds,
} from "@/lib/listing-pinch";
import { listingHubName } from "@/lib/listing-display";
import { listingPinchPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type PinchPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): PinchViewKind {
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
    return listing.id === PINCH_CHAIR_ID ? "chair" : "sold";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.id === PINCH_CHAIR_ID) {
    return "chair";
  }
  if (listing.id === PINCH_LP_ID) {
    return "lp";
  }
  if (listing.id === PINCH_JEWELS_ID) {
    return "jewels";
  }
  if (!canTapePinch(listing)) {
    return "owned";
  }
  return "physical";
}

function pinchSheetForId(id: string, pinchIds: string[]): PinchViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isPinch: listing ? isListingPinchOverlay(listing.id, pinchIds) : false,
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
}: PinchPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const pinchIds = parsePinchListingIds(jar.get(PINCH_COOKIE_NAME)?.value);
  const sheet = pinchSheetForId(id, pinchIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: PINCH_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a pinch note on.",
      path: listingPinchPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: PINCH_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a pinch note."
          : sheet.kind === "lp"
            ? "A record does not take a pinch note. Pinch is a cassette roller."
            : sheet.kind === "jewels"
              ? "Empty jewel cases do not take a pinch note. Pinch is a cassette roller."
              : sheet.kind === "chair"
                ? "A chair does not take a pinch note. Pinch is a cassette roller."
                : sheet.kind === "owned"
                  ? "A pinch note is for SUMMER 93. Another overlay already owns that listing."
                  : "A file does not take a pinch note. A pinch note is for the cassette on the table.",
      path: listingPinchPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not pinch it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not pinch it. Still a hiss. Still a radio edit. Still tote. Not pancake. Not Dolby. Not wind.`,
    path: listingPinchPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingPinchPage({ params }: PinchPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const pinchIds = parsePinchListingIds(jar.get(PINCH_COOKIE_NAME)?.value);
  const sheet = pinchSheetForId(id, pinchIds);

  return <ListingPinchView sheet={sheet} pinchIds={pinchIds} />;
}
