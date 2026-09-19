import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingLookView,
  type LookViewKind,
  type LookViewSheet,
} from "@/components/listing-look-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  LOOK_COOKIE_NAME,
  isListingLookOverlay,
  parseLookListingIds,
} from "@/lib/look-overlay";
import { listingLookPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type LookPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): LookViewKind {
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

function lookSheetForId(id: string, lookIds: string[]): LookViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    looking: listing ? isListingLookOverlay(listing.id, lookIds) : false,
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
}: LookPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const lookIds = parseLookListingIds(jar.get(LOOK_COOKIE_NAME)?.value);
  const sheet = lookSheetForId(id, lookIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: "No look for that listing",
      description: "No SKU with that id. Nothing to leave on the table.",
      path: listingLookPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title:
        sheet.kind === "gift"
          ? "No look on a gift card"
          : "No look on a file",
      description:
        sheet.kind === "gift"
          ? "The gift card is for sale at the desk."
          : "A file is not a display piece.",
      path: listingLookPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `Look, don't bag · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. Display piece on the table. Not for sale.`,
    path: listingLookPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingLookPage({ params }: LookPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const lookIds = parseLookListingIds(jar.get(LOOK_COOKIE_NAME)?.value);
  const sheet = lookSheetForId(id, lookIds);

  return <ListingLookView sheet={sheet} lookIds={lookIds} />;
}
