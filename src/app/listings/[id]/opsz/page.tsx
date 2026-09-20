import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingOpszView,
  type OpszViewKind,
  type OpszViewSheet,
} from "@/components/listing-opsz-view";
import {
  formatMoney,
  isDigitalListing,
  isGiftListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  OPSZ_CHAIR_ID,
  OPSZ_COOKIE_NAME,
  OPSZ_PACK_ID,
  OPSZ_PDF_ID,
  OPSZ_REFUSE_COPY,
  canTapeOpsz,
  isListingOpszOverlay,
  parseOpszListingIds,
} from "@/lib/listing-opsz";
import { listingOpszPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type OpszPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): OpszViewKind {
  if (!listing) {
    return "missing";
  }
  if (isGiftListing(listing)) {
    return "gift";
  }
  if (!isDigitalListing(listing)) {
    if (listing.status === "sold") {
      return listing.id === OPSZ_CHAIR_ID ? "chair" : "sold";
    }
    if (listing.status === "file-gone") {
      return "file-gone";
    }
    return listing.id === OPSZ_CHAIR_ID ? "chair" : "physical";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.status === "sold") {
    return "sold";
  }
  if (listing.id === OPSZ_PACK_ID) {
    return "pack";
  }
  if (listing.id === OPSZ_PDF_ID) {
    return "pdf";
  }
  if (!canTapeOpsz(listing)) {
    return "owned";
  }
  return "digital";
}

function opszSheetForId(
  id: string,
  opszIds: string[],
): OpszViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isOpsz: listing
      ? isListingOpszOverlay(listing.id, opszIds)
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
}: OpszPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const opszIds = parseOpszListingIds(
    jar.get(OPSZ_COOKIE_NAME)?.value,
  );
  const sheet = opszSheetForId(id, opszIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: OPSZ_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape an opsz note on.",
      path: listingOpszPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "digital") {
    return shareMetadata({
      title: OPSZ_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take an opsz note."
          : sheet.kind === "chair"
            ? "A chair does not take an opsz note. Opsz honesty is for the booth font."
            : sheet.kind === "pack"
              ? "A sample pack does not take an opsz note. Opsz honesty is for the booth font."
              : sheet.kind === "pdf"
                ? "A junk PDF does not take an opsz note. Opsz honesty is for the booth font."
                : sheet.kind === "owned"
                  ? "An opsz note is for the booth font. Another overlay already owns that listing."
                  : "A Game Boy does not take an opsz note. Opsz honesty is for the booth font.",
      path: listingOpszPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not opsz it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not opsz it. Still two weights. Still almost-bold. Still tote. Not raster. Not gasp. Not gridfit.`,
    path: listingOpszPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingOpszPage({
  params,
}: OpszPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const opszIds = parseOpszListingIds(
    jar.get(OPSZ_COOKIE_NAME)?.value,
  );
  const sheet = opszSheetForId(id, opszIds);

  return <ListingOpszView sheet={sheet} opszIds={opszIds} />;
}
