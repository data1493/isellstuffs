import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingGdefView,
  type GdefViewKind,
  type GdefViewSheet,
} from "@/components/listing-gdef-view";
import {
  formatMoney,
  isDigitalListing,
  isGiftListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  GDEF_CHAIR_ID,
  GDEF_COOKIE_NAME,
  GDEF_PACK_ID,
  GDEF_PDF_ID,
  GDEF_REFUSE_COPY,
  canTapeGdef,
  isListingGdefOverlay,
  parseGdefListingIds,
} from "@/lib/listing-gdef";
import { listingGdefPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type GdefPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): GdefViewKind {
  if (!listing) {
    return "missing";
  }
  if (isGiftListing(listing)) {
    return "gift";
  }
  if (!isDigitalListing(listing)) {
    if (listing.status === "sold") {
      return listing.id === GDEF_CHAIR_ID ? "chair" : "sold";
    }
    if (listing.status === "file-gone") {
      return "file-gone";
    }
    return listing.id === GDEF_CHAIR_ID ? "chair" : "physical";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.status === "sold") {
    return "sold";
  }
  if (listing.id === GDEF_PACK_ID) {
    return "pack";
  }
  if (listing.id === GDEF_PDF_ID) {
    return "pdf";
  }
  if (!canTapeGdef(listing)) {
    return "owned";
  }
  return "digital";
}

function gdefSheetForId(
  id: string,
  gdefIds: string[],
): GdefViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isGdef: listing
      ? isListingGdefOverlay(listing.id, gdefIds)
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
}: GdefPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const gdefIds = parseGdefListingIds(
    jar.get(GDEF_COOKIE_NAME)?.value,
  );
  const sheet = gdefSheetForId(id, gdefIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: GDEF_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a gdef note on.",
      path: listingGdefPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "digital") {
    return shareMetadata({
      title: GDEF_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a gdef note."
          : sheet.kind === "chair"
            ? "A chair does not take a gdef note. Gdef honesty is for the booth font."
            : sheet.kind === "pack"
              ? "A sample pack does not take a gdef note. Gdef honesty is for the booth font."
              : sheet.kind === "pdf"
                ? "A junk PDF does not take a gdef note. Gdef honesty is for the booth font."
                : sheet.kind === "owned"
                  ? "A gdef note is for the booth font. Another overlay already owns that listing."
                  : "A Game Boy does not take a gdef note. Gdef honesty is for the booth font.",
      path: listingGdefPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not gdef it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not gdef it. Still two weights. Still almost-bold. Still tote. Not gsub. Not gvar. Not raster.`,
    path: listingGdefPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingGdefPage({
  params,
}: GdefPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const gdefIds = parseGdefListingIds(
    jar.get(GDEF_COOKIE_NAME)?.value,
  );
  const sheet = gdefSheetForId(id, gdefIds);

  return <ListingGdefView sheet={sheet} gdefIds={gdefIds} />;
}
