import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingPuckView,
  type PuckViewKind,
  type PuckViewSheet,
} from "@/components/listing-puck-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import {
  PUCK_CHAIR_ID,
  PUCK_COOKIE_NAME,
  PUCK_JEWELS_ID,
  PUCK_MIXTAPE_ID,
  PUCK_REFUSE_COPY,
  canTapePuck,
  isListingPuckOverlay,
  parsePuckListingIds,
} from "@/lib/listing-puck";
import { listingHubName } from "@/lib/listing-display";
import { listingPuckPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type PuckPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): PuckViewKind {
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
    return listing.id === PUCK_CHAIR_ID ? "chair" : "sold";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.id === PUCK_CHAIR_ID) {
    return "chair";
  }
  if (listing.id === PUCK_MIXTAPE_ID) {
    return "mixtape";
  }
  if (listing.id === PUCK_JEWELS_ID) {
    return "jewels";
  }
  if (!canTapePuck(listing)) {
    return "owned";
  }
  return "physical";
}

function puckSheetForId(id: string, puckIds: string[]): PuckViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isPuck: listing ? isListingPuckOverlay(listing.id, puckIds) : false,
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
}: PuckPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const puckIds = parsePuckListingIds(jar.get(PUCK_COOKIE_NAME)?.value);
  const sheet = puckSheetForId(id, puckIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: PUCK_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a puck note on.",
      path: listingPuckPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: PUCK_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a puck note."
          : sheet.kind === "mixtape"
            ? "A mixtape does not take a puck note. Puck is an LP weight."
            : sheet.kind === "jewels"
              ? "Empty jewel cases do not take a puck note. Puck is an LP weight."
              : sheet.kind === "chair"
                ? "A chair does not take a puck note. Puck is an LP weight."
                : sheet.kind === "owned"
                  ? "A puck note is for the unnamed LP. Another overlay already owns that listing."
                  : "A file does not take a puck note. A puck note is for the LP on the table.",
      path: listingPuckPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not puck it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not puck it. Still a skip. Still a grocery bag. Still tote. Not skip. Not center. Not warp.`,
    path: listingPuckPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingPuckPage({ params }: PuckPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const puckIds = parsePuckListingIds(jar.get(PUCK_COOKIE_NAME)?.value);
  const sheet = puckSheetForId(id, puckIds);

  return <ListingPuckView sheet={sheet} puckIds={puckIds} />;
}
