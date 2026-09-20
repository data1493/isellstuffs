import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingGsubView,
  type GsubViewKind,
  type GsubViewSheet,
} from "@/components/listing-gsub-view";
import {
  formatMoney,
  isDigitalListing,
  isGiftListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  GSUB_CHAIR_ID,
  GSUB_COOKIE_NAME,
  GSUB_PACK_ID,
  GSUB_PDF_ID,
  GSUB_REFUSE_COPY,
  canTapeGsub,
  isListingGsubOverlay,
  parseGsubListingIds,
} from "@/lib/listing-gsub";
import { listingGsubPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type GsubPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): GsubViewKind {
  if (!listing) {
    return "missing";
  }
  if (isGiftListing(listing)) {
    return "gift";
  }
  if (!isDigitalListing(listing)) {
    if (listing.status === "sold") {
      return listing.id === GSUB_CHAIR_ID ? "chair" : "sold";
    }
    if (listing.status === "file-gone") {
      return "file-gone";
    }
    return listing.id === GSUB_CHAIR_ID ? "chair" : "physical";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.status === "sold") {
    return "sold";
  }
  if (listing.id === GSUB_PACK_ID) {
    return "pack";
  }
  if (listing.id === GSUB_PDF_ID) {
    return "pdf";
  }
  if (!canTapeGsub(listing)) {
    return "owned";
  }
  return "digital";
}

function gsubSheetForId(
  id: string,
  gsubIds: string[],
): GsubViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isGsub: listing
      ? isListingGsubOverlay(listing.id, gsubIds)
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
}: GsubPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const gsubIds = parseGsubListingIds(
    jar.get(GSUB_COOKIE_NAME)?.value,
  );
  const sheet = gsubSheetForId(id, gsubIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: GSUB_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a gsub note on.",
      path: listingGsubPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "digital") {
    return shareMetadata({
      title: GSUB_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a gsub note."
          : sheet.kind === "chair"
            ? "A chair does not take a gsub note. Gsub honesty is for the booth font."
            : sheet.kind === "pack"
              ? "A sample pack does not take a gsub note. Gsub honesty is for the booth font."
              : sheet.kind === "pdf"
                ? "A junk PDF does not take a gsub note. Gsub honesty is for the booth font."
                : sheet.kind === "owned"
                  ? "A gsub note is for the booth font. Another overlay already owns that listing."
                  : "A Game Boy does not take a gsub note. Gsub honesty is for the booth font.",
      path: listingGsubPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not gsub it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not gsub it. Still two weights. Still almost-bold. Still tote. Not gvar. Not avar. Not raster.`,
    path: listingGsubPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingGsubPage({
  params,
}: GsubPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const gsubIds = parseGsubListingIds(
    jar.get(GSUB_COOKIE_NAME)?.value,
  );
  const sheet = gsubSheetForId(id, gsubIds);

  return <ListingGsubView sheet={sheet} gsubIds={gsubIds} />;
}
