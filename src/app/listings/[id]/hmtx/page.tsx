import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingHmtxView,
  type HmtxViewKind,
  type HmtxViewSheet,
} from "@/components/listing-hmtx-view";
import {
  formatMoney,
  isDigitalListing,
  isGiftListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  HMTX_CHAIR_ID,
  HMTX_COOKIE_NAME,
  HMTX_PACK_ID,
  HMTX_PDF_ID,
  HMTX_REFUSE_COPY,
  canTapeHmtx,
  isListingHmtxOverlay,
  parseHmtxListingIds,
} from "@/lib/listing-hmtx";
import { listingHmtxPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type HmtxPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): HmtxViewKind {
  if (!listing) {
    return "missing";
  }
  if (isGiftListing(listing)) {
    return "gift";
  }
  if (!isDigitalListing(listing)) {
    if (listing.status === "sold") {
      return listing.id === HMTX_CHAIR_ID ? "chair" : "sold";
    }
    if (listing.status === "file-gone") {
      return "file-gone";
    }
    return listing.id === HMTX_CHAIR_ID ? "chair" : "physical";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.status === "sold") {
    return "sold";
  }
  if (listing.id === HMTX_PACK_ID) {
    return "pack";
  }
  if (listing.id === HMTX_PDF_ID) {
    return "pdf";
  }
  if (!canTapeHmtx(listing)) {
    return "owned";
  }
  return "digital";
}

function hmtxSheetForId(
  id: string,
  hmtxIds: string[],
): HmtxViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isHmtx: listing
      ? isListingHmtxOverlay(listing.id, hmtxIds)
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
}: HmtxPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const hmtxIds = parseHmtxListingIds(
    jar.get(HMTX_COOKIE_NAME)?.value,
  );
  const sheet = hmtxSheetForId(id, hmtxIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: HMTX_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a hmtx note on.",
      path: listingHmtxPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "digital") {
    return shareMetadata({
      title: HMTX_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a hmtx note."
          : sheet.kind === "chair"
            ? "A chair does not take a hmtx note. Hmtx honesty is for the booth font."
            : sheet.kind === "pack"
              ? "A sample pack does not take a hmtx note. Hmtx honesty is for the booth font."
              : sheet.kind === "pdf"
                ? "A junk PDF does not take a hmtx note. Hmtx honesty is for the booth font."
                : sheet.kind === "owned"
                  ? "A hmtx note is for the booth font. Another overlay already owns that listing."
                  : "A Game Boy does not take a hmtx note. Hmtx honesty is for the booth font.",
      path: listingHmtxPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not hmtx it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not hmtx it. Still two weights. Still almost-bold. Still tote. Not cvt. Not gdef. Not raster.`,
    path: listingHmtxPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingHmtxPage({
  params,
}: HmtxPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const hmtxIds = parseHmtxListingIds(
    jar.get(HMTX_COOKIE_NAME)?.value,
  );
  const sheet = hmtxSheetForId(id, hmtxIds);

  return <ListingHmtxView sheet={sheet} hmtxIds={hmtxIds} />;
}
