import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingBentView,
  type BentViewKind,
  type BentViewSheet,
} from "@/components/listing-bent-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  BENT_COOKIE_NAME,
  BENT_REFUSE_COPY,
  isListingBentOverlay,
  parseBentListingIds,
} from "@/lib/listing-bent";
import { listingBentPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type BentPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): BentViewKind {
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

function bentSheetForId(id: string, bentIds: string[]): BentViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isBent: listing ? isListingBentOverlay(listing.id, bentIds) : false,
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
}: BentPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const bentIds = parseBentListingIds(jar.get(BENT_COOKIE_NAME)?.value);
  const sheet = bentSheetForId(id, bentIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: BENT_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a splay on.",
      path: listingBentPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: BENT_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code is not a whisk."
          : "A file is not a whisk. Leave it bent is for a balloon on the table.",
      path: listingBentPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `Leave it bent · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. Leave the balloon gone. Still beats eggs. Heat is the mug. Fits is the lid. Still tote.`,
    path: listingBentPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingBentPage({ params }: BentPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const bentIds = parseBentListingIds(jar.get(BENT_COOKIE_NAME)?.value);
  const sheet = bentSheetForId(id, bentIds);

  return <ListingBentView sheet={sheet} bentIds={bentIds} />;
}
