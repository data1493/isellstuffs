import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingSprigView,
  type SprigViewKind,
  type SprigViewSheet,
} from "@/components/listing-sprig-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  SPRIG_CHAIR_ID,
  SPRIG_COOKIE_NAME,
  SPRIG_LID_ID,
  SPRIG_REFUSE_COPY,
  SPRIG_WHISK_ID,
  canTapeSprig,
  isListingSprigOverlay,
  parseSprigListingIds,
} from "@/lib/listing-sprig";
import { listingSprigPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type SprigPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): SprigViewKind {
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
    return listing.id === SPRIG_CHAIR_ID ? "chair" : "sold";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.id === SPRIG_CHAIR_ID) {
    return "chair";
  }
  if (listing.id === SPRIG_LID_ID) {
    return "lid";
  }
  if (listing.id === SPRIG_WHISK_ID) {
    return "whisk";
  }
  if (!canTapeSprig(listing)) {
    return "owned";
  }
  return "physical";
}

function sprigSheetForId(id: string, sprigIds: string[]): SprigViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isSprig: listing ? isListingSprigOverlay(listing.id, sprigIds) : false,
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
}: SprigPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const sprigIds = parseSprigListingIds(jar.get(SPRIG_COOKIE_NAME)?.value);
  const sheet = sprigSheetForId(id, sprigIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: SPRIG_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a sprig note on.",
      path: listingSprigPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: SPRIG_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a sprig note."
          : sheet.kind === "lid"
            ? "A lid does not take a sprig note. Sprig is a mug relief."
            : sheet.kind === "whisk"
              ? "A whisk does not take a sprig note. Sprig is a mug relief."
              : sheet.kind === "chair"
                ? "A chair does not take a sprig note. Sprig is a mug relief."
                : sheet.kind === "owned"
                  ? "A sprig note is for the diner mug. Another overlay already owns that listing."
                  : "A file does not take a sprig note. A sprig note is for the mug on the table.",
      path: listingSprigPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not sprig it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not sprig it. Still a chip. Still a mug. Still tote. Not salt. Not pickle. Not glaze.`,
    path: listingSprigPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingSprigPage({ params }: SprigPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const sprigIds = parseSprigListingIds(jar.get(SPRIG_COOKIE_NAME)?.value);
  const sheet = sprigSheetForId(id, sprigIds);

  return <ListingSprigView sheet={sheet} sprigIds={sprigIds} />;
}
