import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingCollateView,
  type CollateViewKind,
  type CollateViewSheet,
} from "@/components/listing-collate-view";
import {
  formatMoney,
  isDigitalListing,
  isGiftListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  COLLATE_COOKIE_NAME,
  COLLATE_REFUSE_COPY,
  isListingCollateOverlay,
  parseCollateListingIds,
} from "@/lib/listing-collate";
import { listingCollatePath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type CollatePageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): CollateViewKind {
  if (!listing) {
    return "missing";
  }
  if (isGiftListing(listing)) {
    return "gift";
  }
  if (isDigitalListing(listing)) {
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

function collateSheetForId(
  id: string,
  collateIds: string[],
): CollateViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isCollate: listing
      ? isListingCollateOverlay(listing.id, collateIds)
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
}: CollatePageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const collateIds = parseCollateListingIds(
    jar.get(COLLATE_COOKIE_NAME)?.value,
  );
  const sheet = collateSheetForId(id, collateIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: COLLATE_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a collate note on.",
      path: listingCollatePath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "digital") {
    return shareMetadata({
      title: COLLATE_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a collate note."
          : "A lamp does not take a collate note. A collate note is for one junk PDF page.",
      path: listingCollatePath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not collate them · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not collate them. Still one page. Still a folding table. Still tote. Not paginate. Not staple. Not a shop. Not typeset.`,
    path: listingCollatePath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingCollatePage({
  params,
}: CollatePageProps) {
  const { id } = await params;
  const jar = await cookies();
  const collateIds = parseCollateListingIds(
    jar.get(COLLATE_COOKIE_NAME)?.value,
  );
  const sheet = collateSheetForId(id, collateIds);

  return <ListingCollateView sheet={sheet} collateIds={collateIds} />;
}
