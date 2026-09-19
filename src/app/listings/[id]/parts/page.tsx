import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingPartsView,
  type PartsViewKind,
  type PartsViewSheet,
} from "@/components/listing-parts-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  PARTS_COOKIE_NAME,
  PARTS_REFUSE_COPY,
  isListingPartsOverlay,
  parsePartsListingIds,
} from "@/lib/listing-parts";
import { listingPartsPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type PartsPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): PartsViewKind {
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

function partsSheetForId(id: string, partsIds: string[]): PartsViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isParts: listing ? isListingPartsOverlay(listing.id, partsIds) : false,
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
}: PartsPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const partsIds = parsePartsListingIds(jar.get(PARTS_COOKIE_NAME)?.value);
  const sheet = partsSheetForId(id, partsIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: PARTS_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape parts on.",
      path: listingPartsPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: PARTS_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. Files do not run."
          : "A file does not run. Parts honesty is for a tangle on the table.",
      path: listingPartsPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `Sold for parts · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. It does not run. Still tote. Not a fourth status.`,
    path: listingPartsPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingPartsPage({ params }: PartsPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const partsIds = parsePartsListingIds(jar.get(PARTS_COOKIE_NAME)?.value);
  const sheet = partsSheetForId(id, partsIds);

  return <ListingPartsView sheet={sheet} partsIds={partsIds} />;
}
