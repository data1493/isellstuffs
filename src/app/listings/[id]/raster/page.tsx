import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingRasterView,
  type RasterViewKind,
  type RasterViewSheet,
} from "@/components/listing-raster-view";
import {
  formatMoney,
  isDigitalListing,
  isGiftListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  RASTER_CHAIR_ID,
  RASTER_COOKIE_NAME,
  RASTER_LUT_ID,
  RASTER_PACK_ID,
  RASTER_REFUSE_COPY,
  canTapeRaster,
  isListingRasterOverlay,
  parseRasterListingIds,
} from "@/lib/listing-raster";
import { listingRasterPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type RasterPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): RasterViewKind {
  if (!listing) {
    return "missing";
  }
  if (isGiftListing(listing)) {
    return "gift";
  }
  if (!isDigitalListing(listing)) {
    if (listing.status === "sold") {
      return listing.id === RASTER_CHAIR_ID ? "chair" : "sold";
    }
    if (listing.status === "file-gone") {
      return "file-gone";
    }
    return listing.id === RASTER_CHAIR_ID ? "chair" : "physical";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.status === "sold") {
    return "sold";
  }
  if (listing.id === RASTER_PACK_ID) {
    return "pack";
  }
  if (listing.id === RASTER_LUT_ID) {
    return "lut";
  }
  if (!canTapeRaster(listing)) {
    return "owned";
  }
  return "digital";
}

function rasterSheetForId(
  id: string,
  rasterIds: string[],
): RasterViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isRaster: listing
      ? isListingRasterOverlay(listing.id, rasterIds)
      : false,
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
}: RasterPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const rasterIds = parseRasterListingIds(
    jar.get(RASTER_COOKIE_NAME)?.value,
  );
  const sheet = rasterSheetForId(id, rasterIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: RASTER_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a raster note on.",
      path: listingRasterPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "digital") {
    return shareMetadata({
      title: RASTER_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a raster note."
          : sheet.kind === "chair"
            ? "A chair does not take a raster note. Raster honesty is for the booth font."
            : sheet.kind === "pack"
              ? "A sample pack does not take a raster note. Raster honesty is for the booth font."
              : sheet.kind === "lut"
                ? "A LUT pack does not take a raster note. Raster honesty is for the booth font."
                : sheet.kind === "owned"
                  ? "A raster note is for the booth font. Another overlay already owns that listing."
                  : "A Game Boy does not take a raster note. Raster honesty is for the booth font.",
      path: listingRasterPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not raster it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not raster it. Still two weights. Still almost bold. Still tote. Not outline. Not kern. Not subset.`,
    path: listingRasterPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingRasterPage({
  params,
}: RasterPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const rasterIds = parseRasterListingIds(
    jar.get(RASTER_COOKIE_NAME)?.value,
  );
  const sheet = rasterSheetForId(id, rasterIds);

  return <ListingRasterView sheet={sheet} rasterIds={rasterIds} />;
}
