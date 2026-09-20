import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingTapView,
  type TapViewKind,
  type TapViewSheet,
} from "@/components/listing-tap-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  TAP_CHAIR_ID,
  TAP_COOKIE_NAME,
  TAP_MUG_ID,
  TAP_REFUSE_COPY,
  TAP_WHISK_ID,
  canTapeTap,
  isListingTapOverlay,
  parseTapListingIds,
} from "@/lib/listing-tap";
import { listingTapPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type TapPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): TapViewKind {
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
    return listing.id === TAP_CHAIR_ID ? "chair" : "sold";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.id === TAP_CHAIR_ID) {
    return "chair";
  }
  if (listing.id === TAP_MUG_ID) {
    return "mug";
  }
  if (listing.id === TAP_WHISK_ID) {
    return "whisk";
  }
  if (!canTapeTap(listing)) {
    return "owned";
  }
  return "physical";
}

function tapSheetForId(id: string, tapIds: string[]): TapViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isTap: listing ? isListingTapOverlay(listing.id, tapIds) : false,
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
}: TapPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const tapIds = parseTapListingIds(jar.get(TAP_COOKIE_NAME)?.value);
  const sheet = tapSheetForId(id, tapIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: TAP_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a tap note on.",
      path: listingTapPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: TAP_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a tap note."
          : sheet.kind === "mug"
            ? "A mug does not take a tap note. Tap is a pot-lid thread."
            : sheet.kind === "whisk"
              ? "A whisk does not take a tap note. Tap is a pot-lid thread."
              : sheet.kind === "chair"
                ? "A chair does not take a tap note. Tap is a pot-lid thread."
                : sheet.kind === "owned"
                  ? "A tap note is for the pot lid. Another overlay already owns that listing."
                  : "A file does not take a tap note. A tap note is for the lid on the table.",
      path: listingTapPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not tap it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not tap it. Still a lid. Still no pot. Still tote. Not chamfer. Not ream. Not chase.`,
    path: listingTapPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingTapPage({ params }: TapPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const tapIds = parseTapListingIds(jar.get(TAP_COOKIE_NAME)?.value);
  const sheet = tapSheetForId(id, tapIds);

  return <ListingTapView sheet={sheet} tapIds={tapIds} />;
}
