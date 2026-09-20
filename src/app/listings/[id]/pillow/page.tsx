import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingPillowView,
  type PillowViewKind,
  type PillowViewSheet,
} from "@/components/listing-pillow-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  PILLOW_COOKIE_NAME,
  PILLOW_DRAWER_ID,
  PILLOW_LID_ID,
  PILLOW_REFUSE_COPY,
  canTapePillow,
  isListingPillowOverlay,
  parsePillowListingIds,
} from "@/lib/listing-pillow";
import { listingPillowPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type PillowPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): PillowViewKind {
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
  if (listing.id === PILLOW_DRAWER_ID) {
    return "drawer";
  }
  if (listing.id === PILLOW_LID_ID) {
    return "lid";
  }
  if (!canTapePillow(listing)) {
    return "owned";
  }
  return "physical";
}

function pillowSheetForId(id: string, pillowIds: string[]): PillowViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isPillow: listing ? isListingPillowOverlay(listing.id, pillowIds) : false,
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
}: PillowPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const pillowIds = parsePillowListingIds(
    jar.get(PILLOW_COOKIE_NAME)?.value,
  );
  const sheet = pillowSheetForId(id, pillowIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: PILLOW_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a pillow note on.",
      path: listingPillowPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: PILLOW_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a pillow note."
          : sheet.kind === "drawer"
            ? "A cable drawer does not take a pillow note. Pillow is Game Boy paper."
            : sheet.kind === "lid"
              ? "A pot lid does not take a pillow note. Pillow is Game Boy paper."
              : sheet.kind === "owned"
                ? "A pillow note is for the cracked Game Boy. Another overlay already owns that listing."
                : "A file does not take a pillow note. A pillow note is for the Game Boy on the table.",
      path: listingPillowPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not pillow it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not pillow it. Still a crack. Still Tetris. Still tote. Not billboard. Not tombstone. Not underfill.`,
    path: listingPillowPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingPillowPage({ params }: PillowPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const pillowIds = parsePillowListingIds(
    jar.get(PILLOW_COOKIE_NAME)?.value,
  );
  const sheet = pillowSheetForId(id, pillowIds);

  return <ListingPillowView sheet={sheet} pillowIds={pillowIds} />;
}
