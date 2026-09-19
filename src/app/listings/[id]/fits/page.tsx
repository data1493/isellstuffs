import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingFitsView,
  type FitsViewKind,
  type FitsViewSheet,
} from "@/components/listing-fits-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  FITS_COOKIE_NAME,
  FITS_REFUSE_COPY,
  isListingFitsOverlay,
  parseFitsListingIds,
} from "@/lib/listing-fits";
import { listingFitsPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type FitsPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): FitsViewKind {
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

function fitsSheetForId(id: string, fitsIds: string[]): FitsViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isFits: listing ? isListingFitsOverlay(listing.id, fitsIds) : false,
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
}: FitsPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const fitsIds = parseFitsListingIds(jar.get(FITS_COOKIE_NAME)?.value);
  const sheet = fitsSheetForId(id, fitsIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: FITS_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a 3-quart on.",
      path: listingFitsPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: FITS_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not fit a pot."
          : "A file does not fit a pot. Lid honesty is for a lid on the table.",
      path: listingFitsPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `Fits a 3-quart · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. With needs two titles. This is one pot that fits a 3-quart. Still tote.`,
    path: listingFitsPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingFitsPage({ params }: FitsPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const fitsIds = parseFitsListingIds(jar.get(FITS_COOKIE_NAME)?.value);
  const sheet = fitsSheetForId(id, fitsIds);

  return <ListingFitsView sheet={sheet} fitsIds={fitsIds} />;
}
