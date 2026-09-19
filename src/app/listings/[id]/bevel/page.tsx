import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingBevelView,
  type BevelViewKind,
  type BevelViewSheet,
} from "@/components/listing-bevel-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import {
  BEVEL_CHAIR_ID,
  BEVEL_COOKIE_NAME,
  BEVEL_FONT_ID,
  BEVEL_PACK_ID,
  BEVEL_REFUSE_COPY,
  canTapeBevel,
  isListingBevelOverlay,
  parseBevelListingIds,
} from "@/lib/listing-bevel";
import { listingHubName } from "@/lib/listing-display";
import { listingBevelPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type BevelPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): BevelViewKind {
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
    return listing.id === BEVEL_CHAIR_ID ? "chair" : "sold";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.id === BEVEL_CHAIR_ID) {
    return "chair";
  }
  if (listing.id === BEVEL_PACK_ID) {
    return "pack";
  }
  if (listing.id === BEVEL_FONT_ID) {
    return "font";
  }
  if (!canTapeBevel(listing)) {
    return "owned";
  }
  return "physical";
}

function bevelSheetForId(id: string, bevelIds: string[]): BevelViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isBevel: listing ? isListingBevelOverlay(listing.id, bevelIds) : false,
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
}: BevelPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const bevelIds = parseBevelListingIds(jar.get(BEVEL_COOKIE_NAME)?.value);
  const sheet = bevelSheetForId(id, bevelIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: BEVEL_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a bevel note on.",
      path: listingBevelPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: BEVEL_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a bevel note."
          : sheet.kind === "pack"
            ? "A sample pack does not take a bevel note. Bevel is a disc edge."
            : sheet.kind === "font"
              ? "A booth font does not take a bevel note. Bevel is a disc edge."
              : sheet.kind === "chair"
                ? "A chair does not take a bevel note. Bevel is a disc edge."
                : sheet.kind === "owned"
                  ? "A bevel note is for the burned CD-R. Another overlay already owns that listing."
                  : "A file does not take a bevel note. A bevel note is for a disc on the table.",
      path: listingBevelPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not bevel it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not bevel it. Still scratched. Still Sharpie. Still tote. Not lathe. Not polish. Not finalize.`,
    path: listingBevelPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingBevelPage({ params }: BevelPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const bevelIds = parseBevelListingIds(jar.get(BEVEL_COOKIE_NAME)?.value);
  const sheet = bevelSheetForId(id, bevelIds);

  return <ListingBevelView sheet={sheet} bevelIds={bevelIds} />;
}
