import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingHickeyView,
  type HickeyViewKind,
  type HickeyViewSheet,
} from "@/components/listing-hickey-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  HICKEY_CHAIR_ID,
  HICKEY_COOKIE_NAME,
  HICKEY_MUG_ID,
  HICKEY_REFUSE_COPY,
  canTapeHickey,
  isListingHickeyOverlay,
  parseHickeyListingIds,
} from "@/lib/listing-hickey";
import { listingHickeyPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type HickeyPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): HickeyViewKind {
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
    return listing.id === HICKEY_CHAIR_ID ? "chair" : "sold";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.id === HICKEY_CHAIR_ID) {
    return "chair";
  }
  if (listing.id === HICKEY_MUG_ID) {
    return "mug";
  }
  if (!canTapeHickey(listing)) {
    return "owned";
  }
  return "physical";
}

function hickeySheetForId(id: string, hickeyIds: string[]): HickeyViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isHickey: listing ? isListingHickeyOverlay(listing.id, hickeyIds) : false,
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
}: HickeyPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const hickeyIds = parseHickeyListingIds(jar.get(HICKEY_COOKIE_NAME)?.value);
  const sheet = hickeySheetForId(id, hickeyIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: HICKEY_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a hickey note on.",
      path: listingHickeyPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: HICKEY_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a hickey note."
          : sheet.kind === "chair"
            ? "A chair does not take a hickey note. Hickey is a lamp pipe."
            : sheet.kind === "mug"
              ? "A mug does not take a hickey note. Hickey is a lamp pipe."
              : sheet.kind === "owned"
                ? "A hickey note is for the wobbly lamp. Another overlay already owns that listing."
                : "A file does not take a hickey note. A hickey note is for the lamp on the table.",
      path: listingHickeyPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not hickey it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not hickey it. Still a wiggle. Still shade optional. Still tote. Not fuse. Not chase. Not harp.`,
    path: listingHickeyPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingHickeyPage({ params }: HickeyPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const hickeyIds = parseHickeyListingIds(jar.get(HICKEY_COOKIE_NAME)?.value);
  const sheet = hickeySheetForId(id, hickeyIds);

  return <ListingHickeyView sheet={sheet} hickeyIds={hickeyIds} />;
}
