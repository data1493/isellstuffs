import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingTrepanView,
  type TrepanViewKind,
  type TrepanViewSheet,
} from "@/components/listing-trepan-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  TREPAN_CHAIR_ID,
  TREPAN_COOKIE_NAME,
  TREPAN_MUG_ID,
  TREPAN_REFUSE_COPY,
  TREPAN_WHISK_ID,
  canTapeTrepan,
  isListingTrepanOverlay,
  parseTrepanListingIds,
} from "@/lib/listing-trepan";
import { listingTrepanPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type TrepanPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): TrepanViewKind {
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
    return listing.id === TREPAN_CHAIR_ID ? "chair" : "sold";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.id === TREPAN_CHAIR_ID) {
    return "chair";
  }
  if (listing.id === TREPAN_MUG_ID) {
    return "mug";
  }
  if (listing.id === TREPAN_WHISK_ID) {
    return "whisk";
  }
  if (!canTapeTrepan(listing)) {
    return "owned";
  }
  return "physical";
}

function trepanSheetForId(id: string, trepanIds: string[]): TrepanViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isTrepan: listing ? isListingTrepanOverlay(listing.id, trepanIds) : false,
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
}: TrepanPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const trepanIds = parseTrepanListingIds(jar.get(TREPAN_COOKIE_NAME)?.value);
  const sheet = trepanSheetForId(id, trepanIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: TREPAN_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a trepan note on.",
      path: listingTrepanPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: TREPAN_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a trepan note."
          : sheet.kind === "mug"
            ? "A mug does not take a trepan note. Trepan honesty is for the pot lid."
            : sheet.kind === "whisk"
              ? "A whisk does not take a trepan note. Trepan honesty is for the pot lid."
              : sheet.kind === "chair"
                ? "A chair does not take a trepan note. Trepan honesty is for the pot lid."
                : sheet.kind === "owned"
                  ? "A trepan note is for the pot lid. Another overlay already owns that listing."
                  : "A file does not take a trepan note. A trepan note is for the lid on the table.",
      path: listingTrepanPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not trepan it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not trepan it. Still a lid. Still no pot. Still tote. Not snug. Not countersink. Not spotface.`,
    path: listingTrepanPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingTrepanPage({ params }: TrepanPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const trepanIds = parseTrepanListingIds(jar.get(TREPAN_COOKIE_NAME)?.value);
  const sheet = trepanSheetForId(id, trepanIds);

  return <ListingTrepanView sheet={sheet} trepanIds={trepanIds} />;
}
