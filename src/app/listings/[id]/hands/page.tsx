import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingHandsView,
  type HandsViewKind,
  type HandsViewSheet,
} from "@/components/listing-hands-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import {
  HANDS_COOKIE_NAME,
  isListingHandsOverlay,
  parseHandsListingIds,
} from "@/lib/in-hands";
import { listingHubName } from "@/lib/listing-display";
import { listingHandsPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type HandsPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): HandsViewKind {
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

function handsSheetForId(id: string, handsIds: string[]): HandsViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    walking: listing ? isListingHandsOverlay(listing.id, handsIds) : false,
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
}: HandsPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const handsIds = parseHandsListingIds(jar.get(HANDS_COOKIE_NAME)?.value);
  const sheet = handsSheetForId(id, handsIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: "No hands for that listing",
      description: "No SKU with that id. Nothing walking off the table.",
      path: listingHandsPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title:
        sheet.kind === "gift"
          ? "No hands on a gift card"
          : "No hands on a file",
      description:
        sheet.kind === "gift"
          ? "The gift card stays at the desk."
          : "A file is not in anyone's hands.",
      path: listingHandsPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `In someone's hands · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. Walking away with it. Not sold yet.`,
    path: listingHandsPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingHandsPage({ params }: HandsPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const handsIds = parseHandsListingIds(jar.get(HANDS_COOKIE_NAME)?.value);
  const sheet = handsSheetForId(id, handsIds);

  return <ListingHandsView sheet={sheet} handsIds={handsIds} />;
}
