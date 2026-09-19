import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingBurnishView,
  type BurnishViewKind,
  type BurnishViewSheet,
} from "@/components/listing-burnish-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  BURNISH_COOKIE_NAME,
  BURNISH_REFUSE_COPY,
  isListingBurnishOverlay,
  parseBurnishListingIds,
} from "@/lib/listing-burnish";
import { listingBurnishPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type BurnishPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): BurnishViewKind {
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

function burnishSheetForId(id: string, burnishIds: string[]): BurnishViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isBurnish: listing ? isListingBurnishOverlay(listing.id, burnishIds) : false,
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
}: BurnishPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const burnishIds = parseBurnishListingIds(
    jar.get(BURNISH_COOKIE_NAME)?.value,
  );
  const sheet = burnishSheetForId(id, burnishIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: BURNISH_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a burnish note on.",
      path: listingBurnishPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: BURNISH_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a burnish note."
          : "A file does not take a burnish note. A burnish note is for a pair on the table.",
      path: listingBurnishPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not burnish it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not burnish it. Still a pair. Still peeling. Still tote. Not welt. Not stitch. Not a shop. Not polish.`,
    path: listingBurnishPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingBurnishPage({ params }: BurnishPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const burnishIds = parseBurnishListingIds(
    jar.get(BURNISH_COOKIE_NAME)?.value,
  );
  const sheet = burnishSheetForId(id, burnishIds);

  return <ListingBurnishView sheet={sheet} burnishIds={burnishIds} />;
}
