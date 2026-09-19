import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingFlockView,
  type FlockViewKind,
  type FlockViewSheet,
} from "@/components/listing-flock-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  FLOCK_COOKIE_NAME,
  FLOCK_REFUSE_COPY,
  isListingFlockOverlay,
  parseFlockListingIds,
} from "@/lib/listing-flock";
import { listingFlockPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type FlockPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): FlockViewKind {
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

function flockSheetForId(id: string, flockIds: string[]): FlockViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isFlock: listing ? isListingFlockOverlay(listing.id, flockIds) : false,
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
}: FlockPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const flockIds = parseFlockListingIds(jar.get(FLOCK_COOKIE_NAME)?.value);
  const sheet = flockSheetForId(id, flockIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: FLOCK_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a flock note on.",
      path: listingFlockPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: FLOCK_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a flock note."
          : "A file does not take a flock note. A flock note is for empty jewels on the table.",
      path: listingFlockPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not flock them · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not flock them. Still empty. Still one crack. Still tote. Not foam. Not nest. Not a shop. Not tray.`,
    path: listingFlockPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingFlockPage({ params }: FlockPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const flockIds = parseFlockListingIds(jar.get(FLOCK_COOKIE_NAME)?.value);
  const sheet = flockSheetForId(id, flockIds);

  return <ListingFlockView sheet={sheet} flockIds={flockIds} />;
}
