import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingStrapView,
  type StrapViewKind,
  type StrapViewSheet,
} from "@/components/listing-strap-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  STRAP_COOKIE_NAME,
  STRAP_REFUSE_COPY,
  isListingStrapOverlay,
  parseStrapListingIds,
} from "@/lib/listing-strap";
import { listingStrapPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type StrapPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): StrapViewKind {
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

function strapSheetForId(id: string, strapIds: string[]): StrapViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isStrap: listing ? isListingStrapOverlay(listing.id, strapIds) : false,
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
}: StrapPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const strapIds = parseStrapListingIds(jar.get(STRAP_COOKIE_NAME)?.value);
  const sheet = strapSheetForId(id, strapIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: STRAP_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a strap on.",
      path: listingStrapPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: STRAP_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a strap."
          : "A file does not take a strap. Strap honesty is for a camera or bag on the table.",
      path: listingStrapPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `The strap walked · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. The strap is not in the box. Still tote. Remote is the clicker. Not van. Not lost.`,
    path: listingStrapPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingStrapPage({ params }: StrapPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const strapIds = parseStrapListingIds(jar.get(STRAP_COOKIE_NAME)?.value);
  const sheet = strapSheetForId(id, strapIds);

  return <ListingStrapView sheet={sheet} strapIds={strapIds} />;
}
