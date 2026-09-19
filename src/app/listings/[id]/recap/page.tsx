import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingRecapView,
  type RecapViewKind,
  type RecapViewSheet,
} from "@/components/listing-recap-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  RECAP_COOKIE_NAME,
  RECAP_REFUSE_COPY,
  isListingRecapOverlay,
  parseRecapListingIds,
} from "@/lib/listing-recap";
import { listingRecapPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type RecapPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): RecapViewKind {
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
  return "physical";
}

function recapSheetForId(id: string, recapIds: string[]): RecapViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isRecap: listing ? isListingRecapOverlay(listing.id, recapIds) : false,
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
}: RecapPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const recapIds = parseRecapListingIds(jar.get(RECAP_COOKIE_NAME)?.value);
  const sheet = recapSheetForId(id, recapIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: RECAP_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a recap note on.",
      path: listingRecapPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: RECAP_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a recap note."
          : "A file does not recap. A recap note is for a handheld on the table.",
      path: listingRecapPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not recap · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not recap. What saves is luck. Still Tetris. Still tote. Not cells. Not dump. Not link.`,
    path: listingRecapPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingRecapPage({ params }: RecapPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const recapIds = parseRecapListingIds(jar.get(RECAP_COOKIE_NAME)?.value);
  const sheet = recapSheetForId(id, recapIds);

  return <ListingRecapView sheet={sheet} recapIds={recapIds} />;
}
