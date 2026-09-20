import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingReballView,
  type ReballViewKind,
  type ReballViewSheet,
} from "@/components/listing-reball-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  REBALL_COOKIE_NAME,
  REBALL_DRAWER_ID,
  REBALL_LID_ID,
  REBALL_REFUSE_COPY,
  canTapeReball,
  isListingReballOverlay,
  parseReballListingIds,
} from "@/lib/listing-reball";
import { listingReballPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type ReballPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): ReballViewKind {
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
  if (listing.id === REBALL_DRAWER_ID) {
    return "drawer";
  }
  if (listing.id === REBALL_LID_ID) {
    return "lid";
  }
  if (!canTapeReball(listing)) {
    return "owned";
  }
  return "physical";
}

function reballSheetForId(id: string, reballIds: string[]): ReballViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isReball: listing ? isListingReballOverlay(listing.id, reballIds) : false,
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
}: ReballPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const reballIds = parseReballListingIds(jar.get(REBALL_COOKIE_NAME)?.value);
  const sheet = reballSheetForId(id, reballIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: REBALL_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a reball note on.",
      path: listingReballPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: REBALL_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a reball note."
          : sheet.kind === "drawer"
            ? "A cable drawer does not take a reball note. Reball is a Game Boy BGA."
            : sheet.kind === "lid"
              ? "A pot lid does not take a reball note. Reball is a Game Boy BGA."
              : sheet.kind === "owned"
                ? "A reball note is for the cracked Game Boy. Another overlay already owns that listing."
                : "A file does not take a reball note. A reball note is for the Game Boy on the table.",
      path: listingReballPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not reball it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not reball it. Still a crack. Still Tetris. Still tote. Not pogo. Not clock. Not reflow.`,
    path: listingReballPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingReballPage({ params }: ReballPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const reballIds = parseReballListingIds(jar.get(REBALL_COOKIE_NAME)?.value);
  const sheet = reballSheetForId(id, reballIds);

  return <ListingReballView sheet={sheet} reballIds={reballIds} />;
}
