import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingWedgeView,
  type WedgeViewKind,
  type WedgeViewSheet,
} from "@/components/listing-wedge-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  WEDGE_CHAIR_ID,
  WEDGE_COOKIE_NAME,
  WEDGE_MUG_ID,
  WEDGE_REFUSE_COPY,
  WEDGE_WHISK_ID,
  canTapeWedge,
  isListingWedgeOverlay,
  parseWedgeListingIds,
} from "@/lib/listing-wedge";
import { listingWedgePath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type WedgePageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): WedgeViewKind {
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
    return listing.id === WEDGE_CHAIR_ID ? "chair" : "sold";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.id === WEDGE_CHAIR_ID) {
    return "chair";
  }
  if (listing.id === WEDGE_MUG_ID) {
    return "mug";
  }
  if (listing.id === WEDGE_WHISK_ID) {
    return "whisk";
  }
  if (!canTapeWedge(listing)) {
    return "owned";
  }
  return "physical";
}

function wedgeSheetForId(
  id: string,
  wedgeIds: string[],
): WedgeViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isWedge: listing
      ? isListingWedgeOverlay(listing.id, wedgeIds)
      : false,
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
}: WedgePageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const wedgeIds = parseWedgeListingIds(
    jar.get(WEDGE_COOKIE_NAME)?.value,
  );
  const sheet = wedgeSheetForId(id, wedgeIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: WEDGE_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a wedge note on.",
      path: listingWedgePath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: WEDGE_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a wedge note."
          : sheet.kind === "mug"
            ? "A mug does not take a wedge note. Wedge honesty is for the pot lid."
            : sheet.kind === "whisk"
              ? "A whisk does not take a wedge note. Wedge honesty is for the pot lid."
              : sheet.kind === "chair"
                ? "A chair does not take a wedge note. Wedge honesty is for the pot lid."
                : sheet.kind === "owned"
                  ? "A wedge note is for the pot lid. Another overlay already owns that listing."
                  : "A file does not take a wedge note. A wedge note is for the lid on the table.",
      path: listingWedgePath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not wedge it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not wedge it. Still a lid. Still no pot. Still tote. Not sine. Not wring. Not countersink.`,
    path: listingWedgePath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingWedgePage({
  params,
}: WedgePageProps) {
  const { id } = await params;
  const jar = await cookies();
  const wedgeIds = parseWedgeListingIds(
    jar.get(WEDGE_COOKIE_NAME)?.value,
  );
  const sheet = wedgeSheetForId(id, wedgeIds);

  return <ListingWedgeView sheet={sheet} wedgeIds={wedgeIds} />;
}
