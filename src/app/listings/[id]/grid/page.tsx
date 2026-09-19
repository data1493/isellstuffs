import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingGridView,
  type GridViewKind,
  type GridViewSheet,
} from "@/components/listing-grid-view";
import {
  formatMoney,
  isDigitalListing,
  isGiftListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  GRID_COOKIE_NAME,
  GRID_REFUSE_COPY,
  isListingGridOverlay,
  parseGridListingIds,
} from "@/lib/listing-grid";
import { listingGridPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type GridPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): GridViewKind {
  if (!listing) {
    return "missing";
  }
  if (isGiftListing(listing)) {
    return "gift";
  }
  if (isDigitalListing(listing)) {
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

function gridSheetForId(id: string, gridIds: string[]): GridViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isGrid: listing ? isListingGridOverlay(listing.id, gridIds) : false,
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
}: GridPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const gridIds = parseGridListingIds(jar.get(GRID_COOKIE_NAME)?.value);
  const sheet = gridSheetForId(id, gridIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: GRID_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a grid on.",
      path: listingGridPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "digital") {
    return shareMetadata({
      title: GRID_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code is not a sheet."
          : "A lamp is not a sheet. Grid honesty is for a file on the digital lot.",
      path: listingGridPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not spreadsheet · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. One page. A rule of thumb. Still tote. Not revise. Not a sheet desk. Not typeset.`,
    path: listingGridPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingGridPage({ params }: GridPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const gridIds = parseGridListingIds(jar.get(GRID_COOKIE_NAME)?.value);
  const sheet = gridSheetForId(id, gridIds);

  return <ListingGridView sheet={sheet} gridIds={gridIds} />;
}
