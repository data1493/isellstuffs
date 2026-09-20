import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingAvarView,
  type AvarViewKind,
  type AvarViewSheet,
} from "@/components/listing-avar-view";
import {
  formatMoney,
  isDigitalListing,
  isGiftListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  AVAR_CHAIR_ID,
  AVAR_COOKIE_NAME,
  AVAR_PACK_ID,
  AVAR_PDF_ID,
  AVAR_REFUSE_COPY,
  canTapeAvar,
  isListingAvarOverlay,
  parseAvarListingIds,
} from "@/lib/listing-avar";
import { listingAvarPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type AvarPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): AvarViewKind {
  if (!listing) {
    return "missing";
  }
  if (isGiftListing(listing)) {
    return "gift";
  }
  if (!isDigitalListing(listing)) {
    if (listing.status === "sold") {
      return listing.id === AVAR_CHAIR_ID ? "chair" : "sold";
    }
    if (listing.status === "file-gone") {
      return "file-gone";
    }
    return listing.id === AVAR_CHAIR_ID ? "chair" : "physical";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.status === "sold") {
    return "sold";
  }
  if (listing.id === AVAR_PACK_ID) {
    return "pack";
  }
  if (listing.id === AVAR_PDF_ID) {
    return "pdf";
  }
  if (!canTapeAvar(listing)) {
    return "owned";
  }
  return "digital";
}

function avarSheetForId(
  id: string,
  avarIds: string[],
): AvarViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isAvar: listing
      ? isListingAvarOverlay(listing.id, avarIds)
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
}: AvarPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const avarIds = parseAvarListingIds(
    jar.get(AVAR_COOKIE_NAME)?.value,
  );
  const sheet = avarSheetForId(id, avarIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: AVAR_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape an avar note on.",
      path: listingAvarPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "digital") {
    return shareMetadata({
      title: AVAR_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take an avar note."
          : sheet.kind === "chair"
            ? "A chair does not take an avar note. Avar honesty is for the booth font."
            : sheet.kind === "pack"
              ? "A sample pack does not take an avar note. Avar honesty is for the booth font."
              : sheet.kind === "pdf"
                ? "A junk PDF does not take an avar note. Avar honesty is for the booth font."
                : sheet.kind === "owned"
                  ? "An avar note is for the booth font. Another overlay already owns that listing."
                  : "A Game Boy does not take an avar note. Avar honesty is for the booth font.",
      path: listingAvarPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not avar it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not avar it. Still two weights. Still almost-bold. Still tote. Not opsz. Not raster. Not gridfit.`,
    path: listingAvarPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingAvarPage({
  params,
}: AvarPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const avarIds = parseAvarListingIds(
    jar.get(AVAR_COOKIE_NAME)?.value,
  );
  const sheet = avarSheetForId(id, avarIds);

  return <ListingAvarView sheet={sheet} avarIds={avarIds} />;
}
