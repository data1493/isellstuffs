import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingWashView,
  type WashViewKind,
  type WashViewSheet,
} from "@/components/listing-wash-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  WASH_COOKIE_NAME,
  WASH_REFUSE_COPY,
  isListingWashOverlay,
  parseWashListingIds,
} from "@/lib/listing-wash";
import { listingWashPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type WashPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): WashViewKind {
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

function washSheetForId(id: string, washIds: string[]): WashViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isWash: listing ? isListingWashOverlay(listing.id, washIds) : false,
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
}: WashPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const washIds = parseWashListingIds(jar.get(WASH_COOKIE_NAME)?.value);
  const sheet = washSheetForId(id, washIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: WASH_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a wash on.",
      path: listingWashPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: WASH_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not go in a machine."
          : "A file is not a jacket. I washed it is for laundry paper on the table.",
      path: listingWashPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I washed it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I washed it once. Still smells like a car. Smoke is the smell. Size is the tag. Still tote.`,
    path: listingWashPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingWashPage({ params }: WashPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const washIds = parseWashListingIds(jar.get(WASH_COOKIE_NAME)?.value);
  const sheet = washSheetForId(id, washIds);

  return <ListingWashView sheet={sheet} washIds={washIds} />;
}
