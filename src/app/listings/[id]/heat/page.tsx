import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingHeatView,
  type HeatViewKind,
  type HeatViewSheet,
} from "@/components/listing-heat-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  HEAT_COOKIE_NAME,
  HEAT_REFUSE_COPY,
  isListingHeatOverlay,
  parseHeatListingIds,
} from "@/lib/listing-heat";
import { listingHeatPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type HeatPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): HeatViewKind {
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
    return "sold";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  return "physical";
}

function heatSheetForId(id: string, heatIds: string[]): HeatViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isHeat: listing ? isListingHeatOverlay(listing.id, heatIds) : false,
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
}: HeatPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const heatIds = parseHeatListingIds(jar.get(HEAT_COOKIE_NAME)?.value);
  const sheet = heatSheetForId(id, heatIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: HEAT_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a microwave warning on.",
      path: listingHeatPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: HEAT_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not go in a microwave."
          : "A file does not go in a microwave. Heat tape is for ceramic on the table.",
      path: listingHeatPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `Not for the microwave · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. Ceramic on the table. Gold rim. Don't nuke it. Still tote. Not wrap. Not fits.`,
    path: listingHeatPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingHeatPage({ params }: HeatPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const heatIds = parseHeatListingIds(jar.get(HEAT_COOKIE_NAME)?.value);
  const sheet = heatSheetForId(id, heatIds);

  return <ListingHeatView sheet={sheet} heatIds={heatIds} />;
}
