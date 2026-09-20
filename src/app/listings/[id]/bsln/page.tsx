import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingBslnView,
  type BslnViewKind,
  type BslnViewSheet,
} from "@/components/listing-bsln-view";
import {
  formatMoney,
  isDigitalListing,
  isGiftListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  BSLN_CHAIR_ID,
  BSLN_COOKIE_NAME,
  BSLN_PACK_ID,
  BSLN_PDF_ID,
  BSLN_REFUSE_COPY,
  canTapeBsln,
  isListingBslnOverlay,
  parseBslnListingIds,
} from "@/lib/listing-bsln";
import { listingBslnPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type BslnPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): BslnViewKind {
  if (!listing) {
    return "missing";
  }
  if (isGiftListing(listing)) {
    return "gift";
  }
  if (!isDigitalListing(listing)) {
    if (listing.status === "sold") {
      return listing.id === BSLN_CHAIR_ID ? "chair" : "sold";
    }
    if (listing.status === "file-gone") {
      return "file-gone";
    }
    return listing.id === BSLN_CHAIR_ID ? "chair" : "physical";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.status === "sold") {
    return "sold";
  }
  if (listing.id === BSLN_PACK_ID) {
    return "pack";
  }
  if (listing.id === BSLN_PDF_ID) {
    return "pdf";
  }
  if (!canTapeBsln(listing)) {
    return "owned";
  }
  return "digital";
}

function bslnSheetForId(
  id: string,
  bslnIds: string[],
): BslnViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isBsln: listing
      ? isListingBslnOverlay(listing.id, bslnIds)
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
}: BslnPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const bslnIds = parseBslnListingIds(
    jar.get(BSLN_COOKIE_NAME)?.value,
  );
  const sheet = bslnSheetForId(id, bslnIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: BSLN_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a bsln note on.",
      path: listingBslnPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "digital") {
    return shareMetadata({
      title: BSLN_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a bsln note."
          : sheet.kind === "chair"
            ? "A chair does not take a bsln note. Bsln honesty is for the booth font."
            : sheet.kind === "pack"
              ? "A sample pack does not take a bsln note. Bsln honesty is for the booth font."
              : sheet.kind === "pdf"
                ? "A junk PDF does not take a bsln note. Bsln honesty is for the booth font."
                : sheet.kind === "owned"
                  ? "A bsln note is for the booth font. Another overlay already owns that listing."
                  : "A Game Boy does not take a bsln note. Bsln honesty is for the booth font.",
      path: listingBslnPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not bsln it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not bsln it. Still two weights. Still almost-bold. Still tote. Not hmtx. Not cvt. Not raster.`,
    path: listingBslnPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingBslnPage({
  params,
}: BslnPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const bslnIds = parseBslnListingIds(
    jar.get(BSLN_COOKIE_NAME)?.value,
  );
  const sheet = bslnSheetForId(id, bslnIds);

  return <ListingBslnView sheet={sheet} bslnIds={bslnIds} />;
}
