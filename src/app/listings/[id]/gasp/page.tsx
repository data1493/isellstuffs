import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingGaspView,
  type GaspViewKind,
  type GaspViewSheet,
} from "@/components/listing-gasp-view";
import {
  formatMoney,
  isDigitalListing,
  isGiftListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  GASP_CHAIR_ID,
  GASP_COOKIE_NAME,
  GASP_PACK_ID,
  GASP_PDF_ID,
  GASP_REFUSE_COPY,
  canTapeGasp,
  isListingGaspOverlay,
  parseGaspListingIds,
} from "@/lib/listing-gasp";
import { listingGaspPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type GaspPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): GaspViewKind {
  if (!listing) {
    return "missing";
  }
  if (isGiftListing(listing)) {
    return "gift";
  }
  if (!isDigitalListing(listing)) {
    if (listing.status === "sold") {
      return listing.id === GASP_CHAIR_ID ? "chair" : "sold";
    }
    if (listing.status === "file-gone") {
      return "file-gone";
    }
    return listing.id === GASP_CHAIR_ID ? "chair" : "physical";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.status === "sold") {
    return "sold";
  }
  if (listing.id === GASP_PACK_ID) {
    return "pack";
  }
  if (listing.id === GASP_PDF_ID) {
    return "pdf";
  }
  if (!canTapeGasp(listing)) {
    return "owned";
  }
  return "digital";
}

function gaspSheetForId(id: string, gaspIds: string[]): GaspViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isGasp: listing ? isListingGaspOverlay(listing.id, gaspIds) : false,
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
}: GaspPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const gaspIds = parseGaspListingIds(jar.get(GASP_COOKIE_NAME)?.value);
  const sheet = gaspSheetForId(id, gaspIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: GASP_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a gasp note on.",
      path: listingGaspPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "digital") {
    return shareMetadata({
      title: GASP_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a gasp note."
          : sheet.kind === "chair"
            ? "A chair does not take a gasp note. Gasp honesty is for the booth font."
            : sheet.kind === "pack"
              ? "A sample pack does not take a gasp note. Gasp honesty is for the booth font."
              : sheet.kind === "pdf"
                ? "A junk PDF does not take a gasp note. Gasp honesty is for the booth font."
                : sheet.kind === "owned"
                  ? "A gasp note is for the booth font. Another overlay already owns that listing."
                  : "A Game Boy does not take a gasp note. Gasp honesty is for the booth font.",
      path: listingGaspPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not gasp it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not gasp it. Still two weights. Still almost-bold. Still tote. Not raster. Not kern. Not gridfit. Not an account.`,
    path: listingGaspPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingGaspPage({ params }: GaspPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const gaspIds = parseGaspListingIds(jar.get(GASP_COOKIE_NAME)?.value);
  const sheet = gaspSheetForId(id, gaspIds);

  return <ListingGaspView sheet={sheet} gaspIds={gaspIds} />;
}
