import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingSlantView,
  type SlantViewKind,
  type SlantViewSheet,
} from "@/components/listing-slant-view";
import {
  formatMoney,
  isDigitalListing,
  isGiftListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  SLANT_COOKIE_NAME,
  SLANT_REFUSE_COPY,
  isListingSlantOverlay,
  parseSlantListingIds,
} from "@/lib/listing-slant";
import { listingSlantPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type SlantPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): SlantViewKind {
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

function slantSheetForId(id: string, slantIds: string[]): SlantViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isSlant: listing ? isListingSlantOverlay(listing.id, slantIds) : false,
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
}: SlantPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const slantIds = parseSlantListingIds(jar.get(SLANT_COOKIE_NAME)?.value);
  const sheet = slantSheetForId(id, slantIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: SLANT_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a slant on.",
      path: listingSlantPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "digital") {
    return shareMetadata({
      title: SLANT_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code is not a slant."
          : "A lamp is not a slant. Slant honesty is for a file on the digital lot.",
      path: listingSlantPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not cut a slant · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. Regular and almost bold. Foundry is two weights, not a seat. Still tote. Not a type shop.`,
    path: listingSlantPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingSlantPage({ params }: SlantPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const slantIds = parseSlantListingIds(jar.get(SLANT_COOKIE_NAME)?.value);
  const sheet = slantSheetForId(id, slantIds);

  return <ListingSlantView sheet={sheet} slantIds={slantIds} />;
}
