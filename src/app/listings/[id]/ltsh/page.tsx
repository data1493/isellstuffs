import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingLtshView,
  type LtshViewKind,
  type LtshViewSheet,
} from "@/components/listing-ltsh-view";
import {
  formatMoney,
  isDigitalListing,
  isGiftListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  LTSH_CHAIR_ID,
  LTSH_COOKIE_NAME,
  LTSH_PACK_ID,
  LTSH_PDF_ID,
  LTSH_REFUSE_COPY,
  canTapeLtsh,
  isListingLtshOverlay,
  parseLtshListingIds,
} from "@/lib/listing-ltsh";
import { listingLtshPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type LtshPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): LtshViewKind {
  if (!listing) {
    return "missing";
  }
  if (isGiftListing(listing)) {
    return "gift";
  }
  if (!isDigitalListing(listing)) {
    if (listing.status === "sold") {
      return listing.id === LTSH_CHAIR_ID ? "chair" : "sold";
    }
    if (listing.status === "file-gone") {
      return "file-gone";
    }
    return listing.id === LTSH_CHAIR_ID ? "chair" : "physical";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.status === "sold") {
    return "sold";
  }
  if (listing.id === LTSH_PACK_ID) {
    return "pack";
  }
  if (listing.id === LTSH_PDF_ID) {
    return "pdf";
  }
  if (!canTapeLtsh(listing)) {
    return "owned";
  }
  return "digital";
}

function ltshSheetForId(
  id: string,
  ltshIds: string[],
): LtshViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isLtsh: listing
      ? isListingLtshOverlay(listing.id, ltshIds)
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
}: LtshPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const ltshIds = parseLtshListingIds(
    jar.get(LTSH_COOKIE_NAME)?.value,
  );
  const sheet = ltshSheetForId(id, ltshIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: LTSH_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a ltsh note on.",
      path: listingLtshPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "digital") {
    return shareMetadata({
      title: LTSH_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a ltsh note."
          : sheet.kind === "chair"
            ? "A chair does not take a ltsh note. Ltsh honesty is for the booth font."
            : sheet.kind === "pack"
              ? "A sample pack does not take a ltsh note. Ltsh honesty is for the booth font."
              : sheet.kind === "pdf"
                ? "A junk PDF does not take a ltsh note. Ltsh honesty is for the booth font."
                : sheet.kind === "owned"
                  ? "A ltsh note is for the booth font. Another overlay already owns that listing."
                  : "A Game Boy does not take a ltsh note. Ltsh honesty is for the booth font.",
      path: listingLtshPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not ltsh it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not ltsh it. Still two weights. Still almost-bold. Still tote. Not opbd. Not bsln. Not raster.`,
    path: listingLtshPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingLtshPage({
  params,
}: LtshPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const ltshIds = parseLtshListingIds(
    jar.get(LTSH_COOKIE_NAME)?.value,
  );
  const sheet = ltshSheetForId(id, ltshIds);

  return <ListingLtshView sheet={sheet} ltshIds={ltshIds} />;
}
