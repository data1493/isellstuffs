import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingHeavyView,
  type HeavyViewKind,
  type HeavyViewSheet,
} from "@/components/listing-heavy-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  HEAVY_COOKIE_NAME,
  HEAVY_REFUSE_COPY,
  isListingHeavyOverlay,
  parseHeavyListingIds,
} from "@/lib/listing-heavy";
import { listingHeavyPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type HeavyPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): HeavyViewKind {
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

function heavySheetForId(id: string, heavyIds: string[]): HeavyViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isHeavy: listing ? isListingHeavyOverlay(listing.id, heavyIds) : false,
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
}: HeavyPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const heavyIds = parseHeavyListingIds(jar.get(HEAVY_COOKIE_NAME)?.value);
  const sheet = heavySheetForId(id, heavyIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: HEAVY_REFUSE_COPY,
      description: "No SKU with that id. Nothing to lift with two people.",
      path: listingHeavyPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: HEAVY_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. Files are not a lift."
          : "A file is not a lift. Weight paper is for a thing on the table.",
      path: listingHeavyPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `Needs two people · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. Still for sale. Weight paper. Not a hold.`,
    path: listingHeavyPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingHeavyPage({ params }: HeavyPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const heavyIds = parseHeavyListingIds(jar.get(HEAVY_COOKIE_NAME)?.value);
  const sheet = heavySheetForId(id, heavyIds);

  return <ListingHeavyView sheet={sheet} heavyIds={heavyIds} />;
}
