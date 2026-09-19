import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingCordView,
  type CordViewKind,
  type CordViewSheet,
} from "@/components/listing-cord-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  CORD_COOKIE_NAME,
  CORD_REFUSE_COPY,
  isListingCordOverlay,
  parseCordListingIds,
} from "@/lib/listing-cord";
import { listingCordPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type CordPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): CordViewKind {
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

function cordSheetForId(id: string, cordIds: string[]): CordViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isCord: listing ? isListingCordOverlay(listing.id, cordIds) : false,
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
}: CordPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const cordIds = parseCordListingIds(jar.get(CORD_COOKIE_NAME)?.value);
  const sheet = cordSheetForId(id, cordIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: CORD_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a rewired cord on.",
      path: listingCordPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: CORD_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not have a lamp cord."
          : "A file does not have a lamp cord. Rewire tape is for the lamp on the table.",
      path: listingCordPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `Rewired · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. Rewired. Not the factory cord. Still lights. Still tote. Shell is the Game Boy blister.`,
    path: listingCordPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingCordPage({ params }: CordPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const cordIds = parseCordListingIds(jar.get(CORD_COOKIE_NAME)?.value);
  const sheet = cordSheetForId(id, cordIds);

  return <ListingCordView sheet={sheet} cordIds={cordIds} />;
}
