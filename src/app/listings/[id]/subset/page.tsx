import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingSubsetView,
  type SubsetViewKind,
  type SubsetViewSheet,
} from "@/components/listing-subset-view";
import {
  formatMoney,
  isDigitalListing,
  isGiftListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  SUBSET_COOKIE_NAME,
  SUBSET_HOST_ID,
  SUBSET_LUT_ID,
  SUBSET_PACK_ID,
  SUBSET_REFUSE_COPY,
  isListingSubsetOverlay,
  parseSubsetListingIds,
} from "@/lib/listing-subset";
import { listingSubsetPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type SubsetPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): SubsetViewKind {
  if (!listing) {
    return "missing";
  }
  if (isGiftListing(listing)) {
    return "gift";
  }
  if (listing.id === SUBSET_PACK_ID) {
    return "pack";
  }
  if (listing.id === SUBSET_LUT_ID) {
    return "lut";
  }
  if (isDigitalListing(listing)) {
    if (listing.status === "file-gone") {
      return "file-gone";
    }
    if (listing.id !== SUBSET_HOST_ID) {
      return "owned";
    }
    return "digital";
  }
  if (listing.status === "sold") {
    return "sold";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  return "physical";
}

function subsetSheetForId(id: string, subsetIds: string[]): SubsetViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isSubset: listing ? isListingSubsetOverlay(listing.id, subsetIds) : false,
    title: listing?.title ?? null,
    priceLabel: listing ? formatMoney(listing.price) : null,
    fact: listing
      ? isDigitalListing(listing)
        ? listing.fileFormat
        : listing.condition
      : null,
    stallName: stall?.boothName ?? listing?.stallId ?? null,
    stallSlug: stall?.slug ?? null,
    hubName: listing ? listingHubName(listing) : null,
    listing: listing ?? null,
  };
}

export async function generateMetadata({
  params,
}: SubsetPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const subsetIds = parseSubsetListingIds(jar.get(SUBSET_COOKIE_NAME)?.value);
  const sheet = subsetSheetForId(id, subsetIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: SUBSET_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a subset note on.",
      path: listingSubsetPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "digital") {
    return shareMetadata({
      title: SUBSET_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a subset note."
          : sheet.kind === "pack" || sheet.kind === "lut"
            ? "A subset note is for two weights and an OTF, not a zip and not a LUT."
            : "A lamp does not take a subset note. A subset note is for two weights and an OTF.",
      path: listingSubsetPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not subset it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not subset it. Still two weights. Still an OTF. Still tote. Not hint. Not ligature. Not a shop. Not variable.`,
    path: listingSubsetPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingSubsetPage({ params }: SubsetPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const subsetIds = parseSubsetListingIds(jar.get(SUBSET_COOKIE_NAME)?.value);
  const sheet = subsetSheetForId(id, subsetIds);

  return <ListingSubsetView sheet={sheet} subsetIds={subsetIds} />;
}
