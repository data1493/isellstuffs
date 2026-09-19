import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingWeltView,
  type WeltViewKind,
  type WeltViewSheet,
} from "@/components/listing-welt-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  WELT_COOKIE_NAME,
  WELT_REFUSE_COPY,
  isListingWeltOverlay,
  parseWeltListingIds,
} from "@/lib/listing-welt";
import { listingWeltPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type WeltPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): WeltViewKind {
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

function weltSheetForId(id: string, weltIds: string[]): WeltViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isWelt: listing ? isListingWeltOverlay(listing.id, weltIds) : false,
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
}: WeltPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const weltIds = parseWeltListingIds(jar.get(WELT_COOKIE_NAME)?.value);
  const sheet = weltSheetForId(id, weltIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: WELT_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a welt note on.",
      path: listingWeltPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: WELT_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a welt note."
          : "A file does not take a welt note. A welt note is for a pair on the table.",
      path: listingWeltPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not welt them · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not welt them. Still peeling. Still a pair. Still tote. Not stitch. Not sole. Not a shop. Not cement.`,
    path: listingWeltPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingWeltPage({ params }: WeltPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const weltIds = parseWeltListingIds(jar.get(WELT_COOKIE_NAME)?.value);
  const sheet = weltSheetForId(id, weltIds);

  return <ListingWeltView sheet={sheet} weltIds={weltIds} />;
}
