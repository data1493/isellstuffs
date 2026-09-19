import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingOverburnView,
  type OverburnViewKind,
  type OverburnViewSheet,
} from "@/components/listing-overburn-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import {
  OVERBURN_CHAIR_ID,
  OVERBURN_COOKIE_NAME,
  OVERBURN_FONT_ID,
  OVERBURN_PACK_ID,
  OVERBURN_REFUSE_COPY,
  canTapeOverburn,
  isListingOverburnOverlay,
  parseOverburnListingIds,
} from "@/lib/listing-overburn";
import { listingHubName } from "@/lib/listing-display";
import { listingOverburnPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type OverburnPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): OverburnViewKind {
  if (!listing) {
    return "missing";
  }
  if (isGiftListing(listing)) {
    return "gift";
  }
  if (!isPhysicalListing(listing)) {
    return listing.status === "file-gone" ? "file-gone" : "digital";
  }
  if (listing.status === "sold") {
    return listing.id === OVERBURN_CHAIR_ID ? "chair" : "sold";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.id === OVERBURN_CHAIR_ID) {
    return "chair";
  }
  if (listing.id === OVERBURN_PACK_ID) {
    return "pack";
  }
  if (listing.id === OVERBURN_FONT_ID) {
    return "font";
  }
  if (!canTapeOverburn(listing)) {
    return "owned";
  }
  return "physical";
}

function overburnSheetForId(
  id: string,
  overburnIds: string[],
): OverburnViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isOverburn: listing ? isListingOverburnOverlay(listing.id, overburnIds) : false,
    title: listing?.title ?? null,
    priceLabel: listing ? formatMoney(listing.price) : null,
    fact: listing
      ? isPhysicalListing(listing)
        ? listing.condition
        : listing.fileFormat
      : null,
    stallName: stall?.boothName ?? listing?.stallId ?? null,
    stallSlug: stall?.slug ?? null,
    hubName: listing ? listingHubName(listing) : null,
    listing: listing ?? null,
  };
}

export async function generateMetadata({
  params,
}: OverburnPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const overburnIds = parseOverburnListingIds(
    jar.get(OVERBURN_COOKIE_NAME)?.value,
  );
  const sheet = overburnSheetForId(id, overburnIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: OVERBURN_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape an overburn note on.",
      path: listingOverburnPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: OVERBURN_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take an overburn note."
          : sheet.kind === "pack"
            ? "A sample pack does not take an overburn note. Overburn is a disc."
            : sheet.kind === "font"
              ? "A booth font does not take an overburn note. Overburn is a disc."
              : sheet.kind === "chair"
                ? "A chair does not take an overburn note. Overburn is a disc."
                : sheet.kind === "owned"
                  ? "An overburn note is for the burned CD-R. Another overlay already owns that listing."
                  : "A file does not take an overburn note. An overburn note is for a disc on the table.",
      path: listingOverburnPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not overburn it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not overburn it. Still Sharpie. Still scratched. Still tote. Not bevel. Not lathe. Not finalize.`,
    path: listingOverburnPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingOverburnPage({
  params,
}: OverburnPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const overburnIds = parseOverburnListingIds(
    jar.get(OVERBURN_COOKIE_NAME)?.value,
  );
  const sheet = overburnSheetForId(id, overburnIds);

  return <ListingOverburnView sheet={sheet} overburnIds={overburnIds} />;
}
