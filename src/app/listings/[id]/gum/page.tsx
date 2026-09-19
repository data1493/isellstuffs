import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingGumView,
  type GumViewKind,
  type GumViewSheet,
} from "@/components/listing-gum-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  GUM_COOKIE_NAME,
  GUM_REFUSE_COPY,
  isListingGumOverlay,
  parseGumListingIds,
} from "@/lib/listing-gum";
import { listingGumPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type GumPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): GumViewKind {
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

function gumSheetForId(id: string, gumIds: string[]): GumViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isGum: listing ? isListingGumOverlay(listing.id, gumIds) : false,
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
}: GumPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const gumIds = parseGumListingIds(jar.get(GUM_COOKIE_NAME)?.value);
  const sheet = gumSheetForId(id, gumIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: GUM_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape shop-sticker paper on.",
      path: listingGumPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: GUM_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take shop-sticker paper."
          : "A file does not take shop-sticker paper. Residue honesty is for empties on the table.",
      path: listingGumPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `The stickers stay · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. The stickers stay. Residue. Still a pile. Still tote. Not a sticker shop. Still for sale.`,
    path: listingGumPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingGumPage({ params }: GumPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const gumIds = parseGumListingIds(jar.get(GUM_COOKIE_NAME)?.value);
  const sheet = gumSheetForId(id, gumIds);

  return <ListingGumView sheet={sheet} gumIds={gumIds} />;
}
