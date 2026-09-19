import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingCellsView,
  type CellsViewKind,
  type CellsViewSheet,
} from "@/components/listing-cells-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  CELLS_COOKIE_NAME,
  CELLS_REFUSE_COPY,
  isListingCellsOverlay,
  parseCellsListingIds,
} from "@/lib/listing-cells";
import { listingCellsPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type CellsPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): CellsViewKind {
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

function cellsSheetForId(id: string, cellsIds: string[]): CellsViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isCells: listing ? isListingCellsOverlay(listing.id, cellsIds) : false,
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
}: CellsPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const cellsIds = parseCellsListingIds(jar.get(CELLS_COOKIE_NAME)?.value);
  const sheet = cellsSheetForId(id, cellsIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: CELLS_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape cells on.",
      path: listingCellsPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: CELLS_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. Files do not take AAs."
          : "A file does not take AAs. Cells honesty is for a handheld on the table.",
      path: listingCellsPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `Batteries not included · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. Needs AAs. Still tote. Not a fourth status.`,
    path: listingCellsPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingCellsPage({ params }: CellsPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const cellsIds = parseCellsListingIds(jar.get(CELLS_COOKIE_NAME)?.value);
  const sheet = cellsSheetForId(id, cellsIds);

  return <ListingCellsView sheet={sheet} cellsIds={cellsIds} />;
}
