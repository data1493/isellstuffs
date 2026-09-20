import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingPivotView,
  type PivotViewKind,
  type PivotViewSheet,
} from "@/components/listing-pivot-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  PIVOT_CHAIR_ID,
  PIVOT_COOKIE_NAME,
  PIVOT_JEWELS_ID,
  PIVOT_MIXTAPE_ID,
  PIVOT_REFUSE_COPY,
  canTapePivot,
  isListingPivotOverlay,
  parsePivotListingIds,
} from "@/lib/listing-pivot";
import { listingPivotPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type PivotPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): PivotViewKind {
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
    return listing.id === PIVOT_CHAIR_ID ? "chair" : "sold";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.id === PIVOT_CHAIR_ID) {
    return "chair";
  }
  if (listing.id === PIVOT_MIXTAPE_ID) {
    return "mixtape";
  }
  if (listing.id === PIVOT_JEWELS_ID) {
    return "jewels";
  }
  if (!canTapePivot(listing)) {
    return "owned";
  }
  return "physical";
}

function pivotSheetForId(id: string, pivotIds: string[]): PivotViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isPivot: listing ? isListingPivotOverlay(listing.id, pivotIds) : false,
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
}: PivotPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const pivotIds = parsePivotListingIds(jar.get(PIVOT_COOKIE_NAME)?.value);
  const sheet = pivotSheetForId(id, pivotIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: PIVOT_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a pivot note on.",
      path: listingPivotPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: PIVOT_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a pivot note."
          : sheet.kind === "mixtape"
            ? "A mixtape does not take a pivot note. Pivot honesty is for the unnamed LP."
            : sheet.kind === "jewels"
              ? "Empty jewels do not take a pivot note. Pivot honesty is for the unnamed LP."
              : sheet.kind === "chair"
                ? "A chair does not take a pivot note. Pivot honesty is for the unnamed LP."
                : sheet.kind === "owned"
                  ? "A pivot note is for the unnamed LP. Another overlay already owns that listing."
                  : "A file does not take a pivot note. A pivot note is for the LP on the table.",
      path: listingPivotPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not pivot it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not pivot it. Still a skip. Still unnamed. Still tote. Not dashpot. Not gimbal. Not vacuum.`,
    path: listingPivotPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingPivotPage({ params }: PivotPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const pivotIds = parsePivotListingIds(jar.get(PIVOT_COOKIE_NAME)?.value);
  const sheet = pivotSheetForId(id, pivotIds);

  return <ListingPivotView sheet={sheet} pivotIds={pivotIds} />;
}
