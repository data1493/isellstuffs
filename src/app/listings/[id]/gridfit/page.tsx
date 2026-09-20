import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingGridfitView,
  type GridfitViewKind,
  type GridfitViewSheet,
} from "@/components/listing-gridfit-view";
import {
  formatMoney,
  isDigitalListing,
  isGiftListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  GRIDFIT_CHAIR_ID,
  GRIDFIT_COOKIE_NAME,
  GRIDFIT_PACK_ID,
  GRIDFIT_PDF_ID,
  GRIDFIT_REFUSE_COPY,
  canTapeGridfit,
  isListingGridfitOverlay,
  parseGridfitListingIds,
} from "@/lib/listing-gridfit";
import { listingGridfitPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type GridfitPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): GridfitViewKind {
  if (!listing) {
    return "missing";
  }
  if (isGiftListing(listing)) {
    return "gift";
  }
  if (!isDigitalListing(listing)) {
    if (listing.status === "sold") {
      return listing.id === GRIDFIT_CHAIR_ID ? "chair" : "sold";
    }
    if (listing.status === "file-gone") {
      return "file-gone";
    }
    return listing.id === GRIDFIT_CHAIR_ID ? "chair" : "physical";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.status === "sold") {
    return "sold";
  }
  if (listing.id === GRIDFIT_PACK_ID) {
    return "pack";
  }
  if (listing.id === GRIDFIT_PDF_ID) {
    return "pdf";
  }
  if (!canTapeGridfit(listing)) {
    return "owned";
  }
  return "digital";
}

function gridfitSheetForId(
  id: string,
  gridfitIds: string[],
): GridfitViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isGridfit: listing
      ? isListingGridfitOverlay(listing.id, gridfitIds)
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
}: GridfitPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const gridfitIds = parseGridfitListingIds(
    jar.get(GRIDFIT_COOKIE_NAME)?.value,
  );
  const sheet = gridfitSheetForId(id, gridfitIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: GRIDFIT_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a gridfit note on.",
      path: listingGridfitPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "digital") {
    return shareMetadata({
      title: GRIDFIT_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a gridfit note."
          : sheet.kind === "chair"
            ? "A chair does not take a gridfit note. Gridfit honesty is for the booth font."
            : sheet.kind === "pack"
              ? "A sample pack does not take a gridfit note. Gridfit honesty is for the booth font."
              : sheet.kind === "pdf"
                ? "A junk PDF does not take a gridfit note. Gridfit honesty is for the booth font."
                : sheet.kind === "owned"
                  ? "A gridfit note is for the booth font. Another overlay already owns that listing."
                  : "A Game Boy does not take a gridfit note. Gridfit honesty is for the booth font.",
      path: listingGridfitPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not gridfit it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not gridfit it. Still two weights. Still almost-bold. Still tote. Not raster. Not kern. Not hint.`,
    path: listingGridfitPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingGridfitPage({
  params,
}: GridfitPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const gridfitIds = parseGridfitListingIds(
    jar.get(GRIDFIT_COOKIE_NAME)?.value,
  );
  const sheet = gridfitSheetForId(id, gridfitIds);

  return <ListingGridfitView sheet={sheet} gridfitIds={gridfitIds} />;
}
