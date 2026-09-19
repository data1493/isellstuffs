import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingWarpView,
  type WarpViewKind,
  type WarpViewSheet,
} from "@/components/listing-warp-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  WARP_COOKIE_NAME,
  WARP_REFUSE_COPY,
  isListingWarpOverlay,
  parseWarpListingIds,
} from "@/lib/listing-warp";
import { listingWarpPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type WarpPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): WarpViewKind {
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

function warpSheetForId(id: string, warpIds: string[]): WarpViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isWarp: listing ? isListingWarpOverlay(listing.id, warpIds) : false,
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
}: WarpPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const warpIds = parseWarpListingIds(jar.get(WARP_COOKIE_NAME)?.value);
  const sheet = warpSheetForId(id, warpIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: WARP_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a warp note on.",
      path: listingWarpPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: WARP_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not flatten."
          : "A liner PDF does not flatten. A warp note is for an LP on the table.",
      path: listingWarpPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not flatten · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not flatten. Warp stays. Still plays. Still tote. Not center. Not skip. Not vg.`,
    path: listingWarpPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingWarpPage({ params }: WarpPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const warpIds = parseWarpListingIds(jar.get(WARP_COOKIE_NAME)?.value);
  const sheet = warpSheetForId(id, warpIds);

  return <ListingWarpView sheet={sheet} warpIds={warpIds} />;
}
