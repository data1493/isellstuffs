import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingEbdtView,
  type EbdtViewKind,
  type EbdtViewSheet,
} from "@/components/listing-ebdt-view";
import {
  formatMoney,
  isDigitalListing,
  isGiftListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  EBDT_CHAIR_ID,
  EBDT_COOKIE_NAME,
  EBDT_PACK_ID,
  EBDT_PDF_ID,
  EBDT_REFUSE_COPY,
  canTapeEbdt,
  isListingEbdtOverlay,
  parseEbdtListingIds,
} from "@/lib/listing-ebdt";
import { listingEbdtPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type EbdtPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): EbdtViewKind {
  if (!listing) {
    return "missing";
  }
  if (isGiftListing(listing)) {
    return "gift";
  }
  if (!isDigitalListing(listing)) {
    if (listing.status === "sold") {
      return listing.id === EBDT_CHAIR_ID ? "chair" : "sold";
    }
    if (listing.status === "file-gone") {
      return "file-gone";
    }
    return listing.id === EBDT_CHAIR_ID ? "chair" : "physical";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.status === "sold") {
    return "sold";
  }
  if (listing.id === EBDT_PACK_ID) {
    return "pack";
  }
  if (listing.id === EBDT_PDF_ID) {
    return "pdf";
  }
  if (!canTapeEbdt(listing)) {
    return "owned";
  }
  return "digital";
}

function ebdtSheetForId(
  id: string,
  ebdtIds: string[],
): EbdtViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isEbdt: listing
      ? isListingEbdtOverlay(listing.id, ebdtIds)
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
}: EbdtPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const ebdtIds = parseEbdtListingIds(
    jar.get(EBDT_COOKIE_NAME)?.value,
  );
  const sheet = ebdtSheetForId(id, ebdtIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: EBDT_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape an ebdt note on.",
      path: listingEbdtPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "digital") {
    return shareMetadata({
      title: EBDT_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take an ebdt note."
          : sheet.kind === "chair"
            ? "A chair does not take an ebdt note. Ebdt honesty is for the booth font."
            : sheet.kind === "pack"
              ? "A sample pack does not take an ebdt note. Ebdt honesty is for the booth font."
              : sheet.kind === "pdf"
                ? "A junk PDF does not take an ebdt note. Ebdt honesty is for the booth font."
                : sheet.kind === "owned"
                  ? "An ebdt note is for the booth font. Another overlay already owns that listing."
                  : "A Game Boy does not take an ebdt note. Ebdt honesty is for the booth font.",
      path: listingEbdtPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not ebdt it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not ebdt it. Still two weights. Still almost-bold. Still tote. Not pclt. Not ltsh. Not raster.`,
    path: listingEbdtPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingEbdtPage({
  params,
}: EbdtPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const ebdtIds = parseEbdtListingIds(
    jar.get(EBDT_COOKIE_NAME)?.value,
  );
  const sheet = ebdtSheetForId(id, ebdtIds);

  return <ListingEbdtView sheet={sheet} ebdtIds={ebdtIds} />;
}
