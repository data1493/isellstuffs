import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingSnugView,
  type SnugViewKind,
  type SnugViewSheet,
} from "@/components/listing-snug-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  SNUG_CHAIR_ID,
  SNUG_COOKIE_NAME,
  SNUG_MUG_ID,
  SNUG_REFUSE_COPY,
  SNUG_WHISK_ID,
  canTapeSnug,
  isListingSnugOverlay,
  parseSnugListingIds,
} from "@/lib/listing-snug";
import { listingSnugPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type SnugPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): SnugViewKind {
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
    return listing.id === SNUG_CHAIR_ID ? "chair" : "sold";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.id === SNUG_CHAIR_ID) {
    return "chair";
  }
  if (listing.id === SNUG_MUG_ID) {
    return "mug";
  }
  if (listing.id === SNUG_WHISK_ID) {
    return "whisk";
  }
  if (!canTapeSnug(listing)) {
    return "owned";
  }
  return "physical";
}

function snugSheetForId(id: string, snugIds: string[]): SnugViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isSnug: listing ? isListingSnugOverlay(listing.id, snugIds) : false,
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
}: SnugPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const snugIds = parseSnugListingIds(jar.get(SNUG_COOKIE_NAME)?.value);
  const sheet = snugSheetForId(id, snugIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: SNUG_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a snug note on.",
      path: listingSnugPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: SNUG_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a snug note."
          : sheet.kind === "mug"
            ? "A mug does not take a snug note. Snug honesty is for the pot lid."
            : sheet.kind === "whisk"
              ? "A whisk does not take a snug note. Snug honesty is for the pot lid."
              : sheet.kind === "chair"
                ? "A chair does not take a snug note. Snug honesty is for the pot lid."
                : sheet.kind === "owned"
                  ? "A snug note is for the pot lid. Another overlay already owns that listing."
                  : "A file does not take a snug note. A snug note is for the lid on the table.",
      path: listingSnugPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not snug it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not snug it. Still a wiggle. Still a lid. Still tote. Not tap. Not vent. Not knurl.`,
    path: listingSnugPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingSnugPage({ params }: SnugPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const snugIds = parseSnugListingIds(jar.get(SNUG_COOKIE_NAME)?.value);
  const sheet = snugSheetForId(id, snugIds);

  return <ListingSnugView sheet={sheet} snugIds={snugIds} />;
}
