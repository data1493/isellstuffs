import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingCinchView,
  type CinchViewKind,
  type CinchViewSheet,
} from "@/components/listing-cinch-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import {
  CINCH_COOKIE_NAME,
  CINCH_REFUSE_COPY,
  canTapeCinch,
  isListingCinchOverlay,
  parseCinchListingIds,
} from "@/lib/listing-cinch";
import { listingHubName } from "@/lib/listing-display";
import { listingCinchPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type CinchPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): CinchViewKind {
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
  if (!canTapeCinch(listing)) {
    return "owned";
  }
  return "physical";
}

function cinchSheetForId(id: string, cinchIds: string[]): CinchViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isCinch: listing ? isListingCinchOverlay(listing.id, cinchIds) : false,
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
}: CinchPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const cinchIds = parseCinchListingIds(jar.get(CINCH_COOKIE_NAME)?.value);
  const sheet = cinchSheetForId(id, cinchIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: CINCH_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a cinch note on.",
      path: listingCinchPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: CINCH_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a cinch note."
          : sheet.kind === "owned"
            ? "A cinch note is for the windbreaker. Sneakers already have a stitch note."
            : "A file does not take a cinch note. A cinch note is for the jacket on the table.",
      path: listingCinchPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not cinch it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not cinch it. Still pits. Still a hopeful L. Still tote. Not wash. Not spray. Not lining.`,
    path: listingCinchPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingCinchPage({ params }: CinchPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const cinchIds = parseCinchListingIds(jar.get(CINCH_COOKIE_NAME)?.value);
  const sheet = cinchSheetForId(id, cinchIds);

  return <ListingCinchView sheet={sheet} cinchIds={cinchIds} />;
}
