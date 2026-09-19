import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingRingView,
  type RingViewKind,
  type RingViewSheet,
} from "@/components/listing-ring-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  RING_COOKIE_NAME,
  RING_REFUSE_COPY,
  isListingRingOverlay,
  parseRingListingIds,
} from "@/lib/listing-ring";
import { listingRingPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type RingPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): RingViewKind {
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

function ringSheetForId(id: string, ringIds: string[]): RingViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isRing: listing ? isListingRingOverlay(listing.id, ringIds) : false,
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
}: RingPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const ringIds = parseRingListingIds(jar.get(RING_COOKIE_NAME)?.value);
  const sheet = ringSheetForId(id, ringIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: RING_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a water ring on.",
      path: listingRingPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: RING_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a water ring."
          : "A file does not take a water ring. The ring stays on furniture.",
      path: listingRingPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `The water ring stays · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. The table already has a ring. Heat is the mug. Wrap is newspaper. Still tote. Not as-is. Not heat.`,
    path: listingRingPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingRingPage({ params }: RingPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const ringIds = parseRingListingIds(jar.get(RING_COOKIE_NAME)?.value);
  const sheet = ringSheetForId(id, ringIds);

  return <ListingRingView sheet={sheet} ringIds={ringIds} />;
}
