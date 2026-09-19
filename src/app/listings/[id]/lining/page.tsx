import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingLiningView,
  type LiningViewKind,
  type LiningViewSheet,
} from "@/components/listing-lining-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  LINING_COOKIE_NAME,
  LINING_REFUSE_COPY,
  isListingLiningOverlay,
  parseLiningListingIds,
} from "@/lib/listing-lining";
import { listingLiningPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type LiningPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): LiningViewKind {
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

function liningSheetForId(id: string, liningIds: string[]): LiningViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isLining: listing ? isListingLiningOverlay(listing.id, liningIds) : false,
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
}: LiningPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const liningIds = parseLiningListingIds(jar.get(LINING_COOKIE_NAME)?.value);
  const sheet = liningSheetForId(id, liningIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: LINING_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a lining note on.",
      path: listingLiningPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: LINING_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a lining."
          : "A liner PDF is not a jacket. A lining note is for a windbreaker on the table.",
      path: listingLiningPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I don’t have a lining · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I don’t have a lining. Shell only. Still a jacket. Still tote. Not spray. Not sew. Not verso.`,
    path: listingLiningPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingLiningPage({ params }: LiningPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const liningIds = parseLiningListingIds(jar.get(LINING_COOKIE_NAME)?.value);
  const sheet = liningSheetForId(id, liningIds);

  return <ListingLiningView sheet={sheet} liningIds={liningIds} />;
}
