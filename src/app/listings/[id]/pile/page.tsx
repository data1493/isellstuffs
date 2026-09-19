import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingPileView,
  type PileViewKind,
  type PileViewSheet,
} from "@/components/listing-pile-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  PILE_COOKIE_NAME,
  PILE_REFUSE_COPY,
  isListingPileOverlay,
  parsePileListingIds,
} from "@/lib/listing-pile";
import { listingPilePath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type PilePageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): PileViewKind {
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

function pileSheetForId(id: string, pileIds: string[]): PileViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isPile: listing ? isListingPileOverlay(listing.id, pileIds) : false,
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
}: PilePageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const pileIds = parsePileListingIds(jar.get(PILE_COOKIE_NAME)?.value);
  const sheet = pileSheetForId(id, pileIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: PILE_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a pile on.",
      path: listingPilePath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: PILE_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code is not a drawer pile."
          : "A file is not a drawer pile. Won't split the pile is for a tangle on the table.",
      path: listingPilePath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `Won't split the pile · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. Won't split the pile. Take the drawer or leave it. Parts is it does not run. Still tote.`,
    path: listingPilePath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingPilePage({ params }: PilePageProps) {
  const { id } = await params;
  const jar = await cookies();
  const pileIds = parsePileListingIds(jar.get(PILE_COOKIE_NAME)?.value);
  const sheet = pileSheetForId(id, pileIds);

  return <ListingPileView sheet={sheet} pileIds={pileIds} />;
}
