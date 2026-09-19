import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingSizeView,
  type SizeViewKind,
  type SizeViewSheet,
} from "@/components/listing-size-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  SIZE_COOKIE_NAME,
  SIZE_REFUSE_COPY,
  isListingSizeOverlay,
  parseSizeListingIds,
} from "@/lib/listing-size";
import { listingSizePath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type SizePageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): SizeViewKind {
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

function sizeSheetForId(id: string, sizeIds: string[]): SizeViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isSize: listing ? isListingSizeOverlay(listing.id, sizeIds) : false,
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
}: SizePageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const sizeIds = parseSizeListingIds(jar.get(SIZE_COOKIE_NAME)?.value);
  const sheet = sizeSheetForId(id, sizeIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: SIZE_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a size tag on.",
      path: listingSizePath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: SIZE_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code has no sewn-in tag."
          : "A file has no sewn-in tag. Size honesty is for a jacket on the table.",
      path: listingSizePath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `Tag says L · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. Press is which pressing. The Closet tag says L and it is not. Still tote.`,
    path: listingSizePath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingSizePage({ params }: SizePageProps) {
  const { id } = await params;
  const jar = await cookies();
  const sizeIds = parseSizeListingIds(jar.get(SIZE_COOKIE_NAME)?.value);
  const sheet = sizeSheetForId(id, sizeIds);

  return <ListingSizeView sheet={sheet} sizeIds={sizeIds} />;
}
