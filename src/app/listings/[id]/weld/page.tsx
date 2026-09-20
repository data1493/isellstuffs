import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingWeldView,
  type WeldViewKind,
  type WeldViewSheet,
} from "@/components/listing-weld-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  WELD_COOKIE_NAME,
  WELD_REFUSE_COPY,
  isListingWeldOverlay,
  parseWeldListingIds,
} from "@/lib/listing-weld";
import { listingWeldPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type WeldPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): WeldViewKind {
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

function weldSheetForId(id: string, weldIds: string[]): WeldViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isWeld: listing ? isListingWeldOverlay(listing.id, weldIds) : false,
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
}: WeldPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const weldIds = parseWeldListingIds(jar.get(WELD_COOKIE_NAME)?.value);
  const sheet = weldSheetForId(id, weldIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: WELD_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a weld note on.",
      path: listingWeldPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: WELD_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a weld note."
          : "A file does not take a weld note. A weld note is for empty jewels on the table.",
      path: listingWeldPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not weld them · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not weld them. Still five empties. Still one hinge gone. Still tote. Not foam. Not nest. Not a shop. Not inlay.`,
    path: listingWeldPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingWeldPage({ params }: WeldPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const weldIds = parseWeldListingIds(jar.get(WELD_COOKIE_NAME)?.value);
  const sheet = weldSheetForId(id, weldIds);

  return <ListingWeldView sheet={sheet} weldIds={weldIds} />;
}
