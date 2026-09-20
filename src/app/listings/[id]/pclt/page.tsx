import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingPcltView,
  type PcltViewKind,
  type PcltViewSheet,
} from "@/components/listing-pclt-view";
import {
  formatMoney,
  isDigitalListing,
  isGiftListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  PCLT_CHAIR_ID,
  PCLT_COOKIE_NAME,
  PCLT_PACK_ID,
  PCLT_PDF_ID,
  PCLT_REFUSE_COPY,
  canTapePclt,
  isListingPcltOverlay,
  parsePcltListingIds,
} from "@/lib/listing-pclt";
import { listingPcltPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type PcltPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): PcltViewKind {
  if (!listing) {
    return "missing";
  }
  if (isGiftListing(listing)) {
    return "gift";
  }
  if (!isDigitalListing(listing)) {
    if (listing.status === "sold") {
      return listing.id === PCLT_CHAIR_ID ? "chair" : "sold";
    }
    if (listing.status === "file-gone") {
      return "file-gone";
    }
    return listing.id === PCLT_CHAIR_ID ? "chair" : "physical";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.status === "sold") {
    return "sold";
  }
  if (listing.id === PCLT_PACK_ID) {
    return "pack";
  }
  if (listing.id === PCLT_PDF_ID) {
    return "pdf";
  }
  if (!canTapePclt(listing)) {
    return "owned";
  }
  return "digital";
}

function pcltSheetForId(
  id: string,
  pcltIds: string[],
): PcltViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isPclt: listing
      ? isListingPcltOverlay(listing.id, pcltIds)
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
}: PcltPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const pcltIds = parsePcltListingIds(
    jar.get(PCLT_COOKIE_NAME)?.value,
  );
  const sheet = pcltSheetForId(id, pcltIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: PCLT_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a pclt note on.",
      path: listingPcltPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "digital") {
    return shareMetadata({
      title: PCLT_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a pclt note."
          : sheet.kind === "chair"
            ? "A chair does not take a pclt note. Pclt honesty is for the booth font."
            : sheet.kind === "pack"
              ? "A sample pack does not take a pclt note. Pclt honesty is for the booth font."
              : sheet.kind === "pdf"
                ? "A junk PDF does not take a pclt note. Pclt honesty is for the booth font."
                : sheet.kind === "owned"
                  ? "A pclt note is for the booth font. Another overlay already owns that listing."
                  : "A Game Boy does not take a pclt note. Pclt honesty is for the booth font.",
      path: listingPcltPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not pclt it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not pclt it. Still two weights. Still almost-bold. Still tote. Not ltsh. Not opbd. Not raster.`,
    path: listingPcltPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingPcltPage({
  params,
}: PcltPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const pcltIds = parsePcltListingIds(
    jar.get(PCLT_COOKIE_NAME)?.value,
  );
  const sheet = pcltSheetForId(id, pcltIds);

  return <ListingPcltView sheet={sheet} pcltIds={pcltIds} />;
}
