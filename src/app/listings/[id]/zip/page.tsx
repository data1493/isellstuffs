import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingZipView,
  type ZipViewKind,
  type ZipViewSheet,
} from "@/components/listing-zip-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  ZIP_COOKIE_NAME,
  ZIP_REFUSE_COPY,
  isListingZipOverlay,
  parseZipListingIds,
} from "@/lib/listing-zip";
import { listingZipPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type ZipPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): ZipViewKind {
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

function zipSheetForId(id: string, zipIds: string[]): ZipViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isZip: listing ? isListingZipOverlay(listing.id, zipIds) : false,
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
}: ZipPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const zipIds = parseZipListingIds(jar.get(ZIP_COOKIE_NAME)?.value);
  const sheet = zipSheetForId(id, zipIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: ZIP_REFUSE_COPY,
      description: "No SKU with that id. Nothing to leave in the jewel.",
      path: listingZipPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: ZIP_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code is not a leftover jewel."
          : "A sample-pack zip is not a leftover jewel. Zip honesty is for a disc on the table.",
      path: listingZipPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I don't have the zip · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. Stick is I don't email the zip. Burn is no fresh disc. Print is Beats will not run the PDF. The disc is the leftover. Pay and open the folder. Still tote. Not stick. Not a USB shop. Not ink.`,
    path: listingZipPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingZipPage({ params }: ZipPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const zipIds = parseZipListingIds(jar.get(ZIP_COOKIE_NAME)?.value);
  const sheet = zipSheetForId(id, zipIds);

  return <ListingZipView sheet={sheet} zipIds={zipIds} />;
}
