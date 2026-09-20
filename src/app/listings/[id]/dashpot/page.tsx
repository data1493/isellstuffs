import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingDashpotView,
  type DashpotViewKind,
  type DashpotViewSheet,
} from "@/components/listing-dashpot-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  DASHPOT_CHAIR_ID,
  DASHPOT_COOKIE_NAME,
  DASHPOT_JEWELS_ID,
  DASHPOT_MIXTAPE_ID,
  DASHPOT_REFUSE_COPY,
  canTapeDashpot,
  isListingDashpotOverlay,
  parseDashpotListingIds,
} from "@/lib/listing-dashpot";
import { listingDashpotPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type DashpotPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): DashpotViewKind {
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
    return listing.id === DASHPOT_CHAIR_ID ? "chair" : "sold";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.id === DASHPOT_CHAIR_ID) {
    return "chair";
  }
  if (listing.id === DASHPOT_MIXTAPE_ID) {
    return "mixtape";
  }
  if (listing.id === DASHPOT_JEWELS_ID) {
    return "jewels";
  }
  if (!canTapeDashpot(listing)) {
    return "owned";
  }
  return "physical";
}

function dashpotSheetForId(id: string, dashpotIds: string[]): DashpotViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isDashpot: listing ? isListingDashpotOverlay(listing.id, dashpotIds) : false,
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
}: DashpotPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const dashpotIds = parseDashpotListingIds(jar.get(DASHPOT_COOKIE_NAME)?.value);
  const sheet = dashpotSheetForId(id, dashpotIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: DASHPOT_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a dashpot note on.",
      path: listingDashpotPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: DASHPOT_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a dashpot note."
          : sheet.kind === "mixtape"
            ? "A mixtape does not take a dashpot note. Dashpot honesty is for the unnamed LP."
            : sheet.kind === "jewels"
              ? "Empty jewels do not take a dashpot note. Dashpot honesty is for the unnamed LP."
              : sheet.kind === "chair"
                ? "A chair does not take a dashpot note. Dashpot honesty is for the unnamed LP."
                : sheet.kind === "owned"
                  ? "A dashpot note is for the unnamed LP. Another overlay already owns that listing."
                  : "A file does not take a dashpot note. A dashpot note is for the LP on the table.",
      path: listingDashpotPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not dashpot it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not dashpot it. Still a skip. Still unnamed. Still tote. Not gimbal. Not antiskate. Not vacuum.`,
    path: listingDashpotPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingDashpotPage({ params }: DashpotPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const dashpotIds = parseDashpotListingIds(jar.get(DASHPOT_COOKIE_NAME)?.value);
  const sheet = dashpotSheetForId(id, dashpotIds);

  return <ListingDashpotView sheet={sheet} dashpotIds={dashpotIds} />;
}
