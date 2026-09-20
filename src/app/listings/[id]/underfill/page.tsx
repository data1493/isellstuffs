import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingUnderfillView,
  type UnderfillViewKind,
  type UnderfillViewSheet,
} from "@/components/listing-underfill-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  UNDERFILL_COOKIE_NAME,
  UNDERFILL_DRAWER_ID,
  UNDERFILL_LID_ID,
  UNDERFILL_REFUSE_COPY,
  canTapeUnderfill,
  isListingUnderfillOverlay,
  parseUnderfillListingIds,
} from "@/lib/listing-underfill";
import { listingUnderfillPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type UnderfillPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): UnderfillViewKind {
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
  if (listing.id === UNDERFILL_DRAWER_ID) {
    return "drawer";
  }
  if (listing.id === UNDERFILL_LID_ID) {
    return "lid";
  }
  if (!canTapeUnderfill(listing)) {
    return "owned";
  }
  return "physical";
}

function underfillSheetForId(id: string, underfillIds: string[]): UnderfillViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isUnderfill: listing ? isListingUnderfillOverlay(listing.id, underfillIds) : false,
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
}: UnderfillPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const underfillIds = parseUnderfillListingIds(jar.get(UNDERFILL_COOKIE_NAME)?.value);
  const sheet = underfillSheetForId(id, underfillIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: UNDERFILL_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape an underfill note on.",
      path: listingUnderfillPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: UNDERFILL_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take an underfill note."
          : sheet.kind === "drawer"
            ? "A cable drawer does not take an underfill note. Underfill is a Game Boy epoxy."
            : sheet.kind === "lid"
              ? "A pot lid does not take an underfill note. Underfill is a Game Boy epoxy."
              : sheet.kind === "owned"
                ? "An underfill note is for the cracked Game Boy. Another overlay already owns that listing."
                : "A file does not take an underfill note. An underfill note is for the Game Boy on the table.",
      path: listingUnderfillPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not underfill it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not underfill it. Still a crack. Still Tetris. Still tote. Not pogo. Not clock. Not reball.`,
    path: listingUnderfillPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingUnderfillPage({ params }: UnderfillPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const underfillIds = parseUnderfillListingIds(jar.get(UNDERFILL_COOKIE_NAME)?.value);
  const sheet = underfillSheetForId(id, underfillIds);

  return <ListingUnderfillView sheet={sheet} underfillIds={underfillIds} />;
}
