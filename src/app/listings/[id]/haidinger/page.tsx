import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingHaidingerView,
  type HaidingerViewKind,
  type HaidingerViewSheet,
} from "@/components/listing-haidinger-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  HAIDINGER_CHAIR_ID,
  HAIDINGER_COOKIE_NAME,
  HAIDINGER_MUG_ID,
  HAIDINGER_REFUSE_COPY,
  HAIDINGER_WHISK_ID,
  canTapeHaidinger,
  isListingHaidingerOverlay,
  parseHaidingerListingIds,
} from "@/lib/listing-haidinger";
import { listingHaidingerPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type HaidingerPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): HaidingerViewKind {
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
    return listing.id === HAIDINGER_CHAIR_ID ? "chair" : "sold";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.id === HAIDINGER_CHAIR_ID) {
    return "chair";
  }
  if (listing.id === HAIDINGER_MUG_ID) {
    return "mug";
  }
  if (listing.id === HAIDINGER_WHISK_ID) {
    return "whisk";
  }
  if (!canTapeHaidinger(listing)) {
    return "owned";
  }
  return "physical";
}

function haidingerSheetForId(
  id: string,
  haidingerIds: string[],
): HaidingerViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isHaidinger: listing
      ? isListingHaidingerOverlay(listing.id, haidingerIds)
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
}: HaidingerPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const haidingerIds = parseHaidingerListingIds(
    jar.get(HAIDINGER_COOKIE_NAME)?.value,
  );
  const sheet = haidingerSheetForId(id, haidingerIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: HAIDINGER_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a haidinger note on.",
      path: listingHaidingerPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: HAIDINGER_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a haidinger note."
          : sheet.kind === "mug"
            ? "A mug does not take a haidinger note. Haidinger honesty is for the pot lid."
            : sheet.kind === "whisk"
              ? "A whisk does not take a haidinger note. Haidinger honesty is for the pot lid."
              : sheet.kind === "chair"
                ? "A chair does not take a haidinger note. Haidinger honesty is for the pot lid."
                : sheet.kind === "owned"
                  ? "A haidinger note is for the pot lid. Another overlay already owns that listing."
                  : "A file does not take a haidinger note. A haidinger note is for the lid on the table.",
      path: listingHaidingerPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not haidinger it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not haidinger it. Still a lid. Still no pot. Still tote. Not fizeau. Not fringe. Not countersink.`,
    path: listingHaidingerPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingHaidingerPage({
  params,
}: HaidingerPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const haidingerIds = parseHaidingerListingIds(
    jar.get(HAIDINGER_COOKIE_NAME)?.value,
  );
  const sheet = haidingerSheetForId(id, haidingerIds);

  return <ListingHaidingerView sheet={sheet} haidingerIds={haidingerIds} />;
}
