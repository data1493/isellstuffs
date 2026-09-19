import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingPocketsView,
  type PocketsViewKind,
  type PocketsViewSheet,
} from "@/components/listing-pockets-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  POCKETS_COOKIE_NAME,
  POCKETS_REFUSE_COPY,
  isListingPocketsOverlay,
  parsePocketsListingIds,
} from "@/lib/listing-pockets";
import { listingPocketsPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type PocketsPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): PocketsViewKind {
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

function pocketsSheetForId(id: string, pocketsIds: string[]): PocketsViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isEmpty: listing ? isListingPocketsOverlay(listing.id, pocketsIds) : false,
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
}: PocketsPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const pocketsIds = parsePocketsListingIds(jar.get(POCKETS_COOKIE_NAME)?.value);
  const sheet = pocketsSheetForId(id, pocketsIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: POCKETS_REFUSE_COPY,
      description: "No SKU with that id. Nothing to empty the pockets of.",
      path: listingPocketsPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: POCKETS_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. Files have no pockets."
          : "A file has no pockets. Pocket honesty is for a jacket on the table.",
      path: listingPocketsPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `Pockets are empty · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. Still for sale. Not lost. Walkers still dig the jacket.`,
    path: listingPocketsPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingPocketsPage({ params }: PocketsPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const pocketsIds = parsePocketsListingIds(jar.get(POCKETS_COOKIE_NAME)?.value);
  const sheet = pocketsSheetForId(id, pocketsIds);

  return <ListingPocketsView sheet={sheet} pocketsIds={pocketsIds} />;
}
