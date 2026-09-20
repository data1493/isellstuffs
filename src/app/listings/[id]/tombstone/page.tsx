import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingTombstoneView,
  type TombstoneViewKind,
  type TombstoneViewSheet,
} from "@/components/listing-tombstone-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  TOMBSTONE_COOKIE_NAME,
  TOMBSTONE_DRAWER_ID,
  TOMBSTONE_LID_ID,
  TOMBSTONE_REFUSE_COPY,
  canTapeTombstone,
  isListingTombstoneOverlay,
  parseTombstoneListingIds,
} from "@/lib/listing-tombstone";
import { listingTombstonePath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type TombstonePageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): TombstoneViewKind {
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
  if (listing.id === TOMBSTONE_DRAWER_ID) {
    return "drawer";
  }
  if (listing.id === TOMBSTONE_LID_ID) {
    return "lid";
  }
  if (!canTapeTombstone(listing)) {
    return "owned";
  }
  return "physical";
}

function tombstoneSheetForId(id: string, tombstoneIds: string[]): TombstoneViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isTombstone: listing ? isListingTombstoneOverlay(listing.id, tombstoneIds) : false,
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
}: TombstonePageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const tombstoneIds = parseTombstoneListingIds(
    jar.get(TOMBSTONE_COOKIE_NAME)?.value,
  );
  const sheet = tombstoneSheetForId(id, tombstoneIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: TOMBSTONE_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a tombstone note on.",
      path: listingTombstonePath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: TOMBSTONE_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a tombstone note."
          : sheet.kind === "drawer"
            ? "A cable drawer does not take a tombstone note. Tombstone is Game Boy paper."
            : sheet.kind === "lid"
              ? "A pot lid does not take a tombstone note. Tombstone is Game Boy paper."
              : sheet.kind === "owned"
                ? "A tombstone note is for the cracked Game Boy. Another overlay already owns that listing."
                : "A file does not take a tombstone note. A tombstone note is for the Game Boy on the table.",
      path: listingTombstonePath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not tombstone it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not tombstone it. Still a crack. Still Tetris. Still tote. Not squeegee. Not dam. Not underfill.`,
    path: listingTombstonePath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingTombstonePage({ params }: TombstonePageProps) {
  const { id } = await params;
  const jar = await cookies();
  const tombstoneIds = parseTombstoneListingIds(
    jar.get(TOMBSTONE_COOKIE_NAME)?.value,
  );
  const sheet = tombstoneSheetForId(id, tombstoneIds);

  return <ListingTombstoneView sheet={sheet} tombstoneIds={tombstoneIds} />;
}
