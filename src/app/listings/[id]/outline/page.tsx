import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingOutlineView,
  type OutlineViewKind,
  type OutlineViewSheet,
} from "@/components/listing-outline-view";
import {
  formatMoney,
  isDigitalListing,
  isGiftListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  OUTLINE_CHAIR_ID,
  OUTLINE_COOKIE_NAME,
  OUTLINE_LUT_ID,
  OUTLINE_PACK_ID,
  OUTLINE_REFUSE_COPY,
  canTapeOutline,
  isListingOutlineOverlay,
  parseOutlineListingIds,
} from "@/lib/listing-outline";
import { listingOutlinePath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type OutlinePageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): OutlineViewKind {
  if (!listing) {
    return "missing";
  }
  if (isGiftListing(listing)) {
    return "gift";
  }
  if (!isDigitalListing(listing)) {
    if (listing.status === "sold") {
      return listing.id === OUTLINE_CHAIR_ID ? "chair" : "sold";
    }
    if (listing.status === "file-gone") {
      return "file-gone";
    }
    return listing.id === OUTLINE_CHAIR_ID ? "chair" : "physical";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.status === "sold") {
    return "sold";
  }
  if (listing.id === OUTLINE_PACK_ID) {
    return "pack";
  }
  if (listing.id === OUTLINE_LUT_ID) {
    return "lut";
  }
  if (!canTapeOutline(listing)) {
    return "owned";
  }
  return "digital";
}

function outlineSheetForId(
  id: string,
  outlineIds: string[],
): OutlineViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isOutline: listing
      ? isListingOutlineOverlay(listing.id, outlineIds)
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
}: OutlinePageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const outlineIds = parseOutlineListingIds(
    jar.get(OUTLINE_COOKIE_NAME)?.value,
  );
  const sheet = outlineSheetForId(id, outlineIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: OUTLINE_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape an outline note on.",
      path: listingOutlinePath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "digital") {
    return shareMetadata({
      title: OUTLINE_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take an outline note."
          : sheet.kind === "chair"
            ? "A chair does not take an outline note. Outline honesty is for the booth font."
            : sheet.kind === "pack"
              ? "A sample pack does not take an outline note. Outline honesty is for the booth font."
              : sheet.kind === "lut"
                ? "A LUT pack does not take an outline note. Outline honesty is for the booth font."
                : sheet.kind === "owned"
                  ? "An outline note is for the booth font. Another overlay already owns that listing."
                  : "A jacket does not take an outline note. Outline honesty is for the booth font.",
      path: listingOutlinePath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not outline them · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not outline them. Still two weights. Still OTF. Still tote. Not subset. Not hint. Not ligature.`,
    path: listingOutlinePath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingOutlinePage({
  params,
}: OutlinePageProps) {
  const { id } = await params;
  const jar = await cookies();
  const outlineIds = parseOutlineListingIds(
    jar.get(OUTLINE_COOKIE_NAME)?.value,
  );
  const sheet = outlineSheetForId(id, outlineIds);

  return <ListingOutlineView sheet={sheet} outlineIds={outlineIds} />;
}
