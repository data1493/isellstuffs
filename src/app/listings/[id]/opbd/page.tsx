import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingOpbdView,
  type OpbdViewKind,
  type OpbdViewSheet,
} from "@/components/listing-opbd-view";
import {
  formatMoney,
  isDigitalListing,
  isGiftListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  OPBD_CHAIR_ID,
  OPBD_COOKIE_NAME,
  OPBD_PACK_ID,
  OPBD_PDF_ID,
  OPBD_REFUSE_COPY,
  canTapeOpbd,
  isListingOpbdOverlay,
  parseOpbdListingIds,
} from "@/lib/listing-opbd";
import { listingOpbdPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type OpbdPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): OpbdViewKind {
  if (!listing) {
    return "missing";
  }
  if (isGiftListing(listing)) {
    return "gift";
  }
  if (!isDigitalListing(listing)) {
    if (listing.status === "sold") {
      return listing.id === OPBD_CHAIR_ID ? "chair" : "sold";
    }
    if (listing.status === "file-gone") {
      return "file-gone";
    }
    return listing.id === OPBD_CHAIR_ID ? "chair" : "physical";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.status === "sold") {
    return "sold";
  }
  if (listing.id === OPBD_PACK_ID) {
    return "pack";
  }
  if (listing.id === OPBD_PDF_ID) {
    return "pdf";
  }
  if (!canTapeOpbd(listing)) {
    return "owned";
  }
  return "digital";
}

function opbdSheetForId(
  id: string,
  opbdIds: string[],
): OpbdViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isOpbd: listing
      ? isListingOpbdOverlay(listing.id, opbdIds)
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
}: OpbdPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const opbdIds = parseOpbdListingIds(
    jar.get(OPBD_COOKIE_NAME)?.value,
  );
  const sheet = opbdSheetForId(id, opbdIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: OPBD_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape an opbd note on.",
      path: listingOpbdPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "digital") {
    return shareMetadata({
      title: OPBD_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take an opbd note."
          : sheet.kind === "chair"
            ? "A chair does not take an opbd note. Opbd honesty is for the booth font."
            : sheet.kind === "pack"
              ? "A sample pack does not take an opbd note. Opbd honesty is for the booth font."
              : sheet.kind === "pdf"
                ? "A junk PDF does not take an opbd note. Opbd honesty is for the booth font."
                : sheet.kind === "owned"
                  ? "An opbd note is for the booth font. Another overlay already owns that listing."
                  : "A Game Boy does not take an opbd note. Opbd honesty is for the booth font.",
      path: listingOpbdPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not opbd it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not opbd it. Still two weights. Still almost-bold. Still tote. Not bsln. Not hmtx. Not raster.`,
    path: listingOpbdPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingOpbdPage({
  params,
}: OpbdPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const opbdIds = parseOpbdListingIds(
    jar.get(OPBD_COOKIE_NAME)?.value,
  );
  const sheet = opbdSheetForId(id, opbdIds);

  return <ListingOpbdView sheet={sheet} opbdIds={opbdIds} />;
}
