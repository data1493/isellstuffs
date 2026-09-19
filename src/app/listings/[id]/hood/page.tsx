import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingHoodView,
  type HoodViewKind,
  type HoodViewSheet,
} from "@/components/listing-hood-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  HOOD_COOKIE_NAME,
  HOOD_REFUSE_COPY,
  isListingHoodOverlay,
  parseHoodListingIds,
} from "@/lib/listing-hood";
import { listingHoodPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type HoodPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): HoodViewKind {
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

function hoodSheetForId(id: string, hoodIds: string[]): HoodViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isHood: listing ? isListingHoodOverlay(listing.id, hoodIds) : false,
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
}: HoodPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const hoodIds = parseHoodListingIds(jar.get(HOOD_COOKIE_NAME)?.value);
  const sheet = hoodSheetForId(id, hoodIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: HOOD_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a hood note on.",
      path: listingHoodPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: HOOD_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a hood."
          : "A liner PDF is not a jacket. A hood note is for a windbreaker on the table.",
      path: listingHoodPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I don’t have a hood · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I don’t have a hood. Shell only. Still a jacket. Still tote. Not spray. Not sew. Not lining.`,
    path: listingHoodPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingHoodPage({ params }: HoodPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const hoodIds = parseHoodListingIds(jar.get(HOOD_COOKIE_NAME)?.value);
  const sheet = hoodSheetForId(id, hoodIds);

  return <ListingHoodView sheet={sheet} hoodIds={hoodIds} />;
}
