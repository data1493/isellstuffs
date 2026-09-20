import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingGvarView,
  type GvarViewKind,
  type GvarViewSheet,
} from "@/components/listing-gvar-view";
import {
  formatMoney,
  isDigitalListing,
  isGiftListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  GVAR_CHAIR_ID,
  GVAR_COOKIE_NAME,
  GVAR_PACK_ID,
  GVAR_PDF_ID,
  GVAR_REFUSE_COPY,
  canTapeGvar,
  isListingGvarOverlay,
  parseGvarListingIds,
} from "@/lib/listing-gvar";
import { listingGvarPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type GvarPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): GvarViewKind {
  if (!listing) {
    return "missing";
  }
  if (isGiftListing(listing)) {
    return "gift";
  }
  if (!isDigitalListing(listing)) {
    if (listing.status === "sold") {
      return listing.id === GVAR_CHAIR_ID ? "chair" : "sold";
    }
    if (listing.status === "file-gone") {
      return "file-gone";
    }
    return listing.id === GVAR_CHAIR_ID ? "chair" : "physical";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.status === "sold") {
    return "sold";
  }
  if (listing.id === GVAR_PACK_ID) {
    return "pack";
  }
  if (listing.id === GVAR_PDF_ID) {
    return "pdf";
  }
  if (!canTapeGvar(listing)) {
    return "owned";
  }
  return "digital";
}

function gvarSheetForId(
  id: string,
  gvarIds: string[],
): GvarViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isGvar: listing
      ? isListingGvarOverlay(listing.id, gvarIds)
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
}: GvarPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const gvarIds = parseGvarListingIds(
    jar.get(GVAR_COOKIE_NAME)?.value,
  );
  const sheet = gvarSheetForId(id, gvarIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: GVAR_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a gvar note on.",
      path: listingGvarPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "digital") {
    return shareMetadata({
      title: GVAR_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a gvar note."
          : sheet.kind === "chair"
            ? "A chair does not take a gvar note. Gvar honesty is for the booth font."
            : sheet.kind === "pack"
              ? "A sample pack does not take a gvar note. Gvar honesty is for the booth font."
              : sheet.kind === "pdf"
                ? "A junk PDF does not take a gvar note. Gvar honesty is for the booth font."
                : sheet.kind === "owned"
                  ? "A gvar note is for the booth font. Another overlay already owns that listing."
                  : "A Game Boy does not take a gvar note. Gvar honesty is for the booth font.",
      path: listingGvarPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not gvar it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not gvar it. Still two weights. Still almost-bold. Still tote. Not avar. Not opsz. Not raster.`,
    path: listingGvarPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingGvarPage({
  params,
}: GvarPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const gvarIds = parseGvarListingIds(
    jar.get(GVAR_COOKIE_NAME)?.value,
  );
  const sheet = gvarSheetForId(id, gvarIds);

  return <ListingGvarView sheet={sheet} gvarIds={gvarIds} />;
}
