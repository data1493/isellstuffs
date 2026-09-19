import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingBraidView,
  type BraidViewKind,
  type BraidViewSheet,
} from "@/components/listing-braid-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import {
  BRAID_BOY_ID,
  BRAID_COOKIE_NAME,
  BRAID_REFUSE_COPY,
  canTapeBraid,
  isListingBraidOverlay,
  parseBraidListingIds,
} from "@/lib/listing-braid";
import { listingHubName } from "@/lib/listing-display";
import { listingBraidPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type BraidPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): BraidViewKind {
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
    return "sold";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.id === BRAID_BOY_ID) {
    return "boy";
  }
  if (!canTapeBraid(listing)) {
    return "owned";
  }
  return "physical";
}

function braidSheetForId(id: string, braidIds: string[]): BraidViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isBraid: listing ? isListingBraidOverlay(listing.id, braidIds) : false,
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
}: BraidPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const braidIds = parseBraidListingIds(jar.get(BRAID_COOKIE_NAME)?.value);
  const sheet = braidSheetForId(id, braidIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: BRAID_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a braid note on.",
      path: listingBraidPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: BRAID_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a braid note."
          : sheet.kind === "boy"
            ? "A Game Boy does not take a braid note. Braid is a cable drawer."
            : sheet.kind === "owned"
              ? "A braid note is for the mystery cable drawer. Another overlay already owns that listing."
              : "A file does not take a braid note. A braid note is for a pile on the table.",
      path: listingBraidPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not braid them · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not braid them. Still a pile. Still untested. Still tote. Not coil. Not pile. Not a shop.`,
    path: listingBraidPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingBraidPage({ params }: BraidPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const braidIds = parseBraidListingIds(jar.get(BRAID_COOKIE_NAME)?.value);
  const sheet = braidSheetForId(id, braidIds);

  return <ListingBraidView sheet={sheet} braidIds={braidIds} />;
}
