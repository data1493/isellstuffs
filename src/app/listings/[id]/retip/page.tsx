import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingRetipView,
  type RetipViewKind,
  type RetipViewSheet,
} from "@/components/listing-retip-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  RETIP_CHAIR_ID,
  RETIP_COOKIE_NAME,
  RETIP_JEWELS_ID,
  RETIP_MIXTAPE_ID,
  RETIP_REFUSE_COPY,
  canTapeRetip,
  isListingRetipOverlay,
  parseRetipListingIds,
} from "@/lib/listing-retip";
import { listingRetipPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type RetipPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): RetipViewKind {
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
    return listing.id === RETIP_CHAIR_ID ? "chair" : "sold";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.id === RETIP_CHAIR_ID) {
    return "chair";
  }
  if (listing.id === RETIP_MIXTAPE_ID) {
    return "mixtape";
  }
  if (listing.id === RETIP_JEWELS_ID) {
    return "jewels";
  }
  if (!canTapeRetip(listing)) {
    return "owned";
  }
  return "physical";
}

function retipSheetForId(
  id: string,
  retipIds: string[],
): RetipViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isRetip: listing
      ? isListingRetipOverlay(listing.id, retipIds)
      : false,
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
}: RetipPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const retipIds = parseRetipListingIds(
    jar.get(RETIP_COOKIE_NAME)?.value,
  );
  const sheet = retipSheetForId(id, retipIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: RETIP_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a retip note on.",
      path: listingRetipPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: RETIP_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a retip note."
          : sheet.kind === "mixtape"
            ? "A mixtape does not take a retip note. Retip is an LP skip."
            : sheet.kind === "jewels"
              ? "Empty jewel cases do not take a retip note. Retip is an LP skip."
              : sheet.kind === "chair"
                ? "A chair does not take a retip note. Retip is an LP skip."
                : sheet.kind === "owned"
                  ? "A retip note is for the unnamed LP. Another overlay already owns that listing."
                  : "A file does not take a retip note. A retip note is for the LP on the table.",
      path: listingRetipPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not retip it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not retip it. Still a skip. Still unnamed. Still tote. Not vacuum. Not zenith. Not overhang.`,
    path: listingRetipPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingRetipPage({
  params,
}: RetipPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const retipIds = parseRetipListingIds(
    jar.get(RETIP_COOKIE_NAME)?.value,
  );
  const sheet = retipSheetForId(id, retipIds);

  return <ListingRetipView sheet={sheet} retipIds={retipIds} />;
}
