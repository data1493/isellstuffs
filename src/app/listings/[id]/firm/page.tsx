import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingFirmView,
  type FirmViewKind,
  type FirmViewSheet,
} from "@/components/listing-firm-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import {
  FIRM_COOKIE_NAME,
  isListingFirmOverlay,
  parseFirmListingIds,
} from "@/lib/firm-price";
import { listingHubName } from "@/lib/listing-display";
import { listingFirmPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type FirmPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): FirmViewKind {
  if (!listing) {
    return "missing";
  }
  if (listing.status === "sold") {
    return "sold";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (isGiftListing(listing)) {
    return "gift";
  }
  if (!isPhysicalListing(listing)) {
    return "digital";
  }
  return "physical";
}

function firmSheetForId(id: string, firmIds: string[]): FirmViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isFirm: listing ? isListingFirmOverlay(listing.id, firmIds) : false,
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
}: FirmPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const firmIds = parseFirmListingIds(jar.get(FIRM_COOKIE_NAME)?.value);
  const sheet = firmSheetForId(id, firmIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: "No firm price for that listing",
      description: "No SKU with that id. Nothing to hold firm.",
      path: listingFirmPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title:
        sheet.kind === "gift"
          ? "No firm price on a gift card"
          : "No firm price on a file",
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk."
          : "A file is not a lamp tag.",
      path: listingFirmPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `That's the price · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. The seller will not move. The tote still rings the tag.`,
    path: listingFirmPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingFirmPage({ params }: FirmPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const firmIds = parseFirmListingIds(jar.get(FIRM_COOKIE_NAME)?.value);
  const sheet = firmSheetForId(id, firmIds);

  return <ListingFirmView sheet={sheet} firmIds={firmIds} />;
}
