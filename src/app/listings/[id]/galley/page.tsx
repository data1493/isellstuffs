import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingGalleyView,
  type GalleyViewKind,
  type GalleyViewSheet,
} from "@/components/listing-galley-view";
import {
  formatMoney,
  isDigitalListing,
  isGiftListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  GALLEY_COOKIE_NAME,
  GALLEY_REFUSE_COPY,
  canTapeGalley,
  isListingGalleyOverlay,
  parseGalleyListingIds,
} from "@/lib/listing-galley";
import { listingGalleyPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type GalleyPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): GalleyViewKind {
  if (!listing) {
    return "missing";
  }
  if (isGiftListing(listing)) {
    return "gift";
  }
  if (isDigitalListing(listing)) {
    if (listing.status === "file-gone") {
      return "file-gone";
    }
    if (!canTapeGalley(listing)) {
      return "owned";
    }
    return "digital";
  }
  if (listing.status === "sold") {
    return "sold";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  return "physical";
}

function galleySheetForId(id: string, galleyIds: string[]): GalleyViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isGalley: listing ? isListingGalleyOverlay(listing.id, galleyIds) : false,
    title: listing?.title ?? null,
    priceLabel: listing ? formatMoney(listing.price) : null,
    fact: listing
      ? isDigitalListing(listing)
        ? listing.fileFormat
        : listing.condition
      : null,
    stallName: stall?.boothName ?? listing?.stallId ?? null,
    stallSlug: stall?.slug ?? null,
    hubName: listing ? listingHubName(listing) : null,
    listing: listing ?? null,
  };
}

export async function generateMetadata({
  params,
}: GalleyPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const galleyIds = parseGalleyListingIds(jar.get(GALLEY_COOKIE_NAME)?.value);
  const sheet = galleySheetForId(id, galleyIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: GALLEY_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a galley note on.",
      path: listingGalleyPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "digital") {
    return shareMetadata({
      title: GALLEY_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a galley note."
          : sheet.kind === "owned"
            ? "A galley note is for the Side A liner. Another overlay already owns that listing."
            : "A mixtape does not take a galley note. A galley note is for one liner page.",
      path: listingGalleyPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not galley it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not galley it. Still one page. Still wrong on purpose. Still tote. Not mat. Not dedicate. Not a shop. Not impose. Print proof, not a login.`,
    path: listingGalleyPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingGalleyPage({ params }: GalleyPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const galleyIds = parseGalleyListingIds(jar.get(GALLEY_COOKIE_NAME)?.value);
  const sheet = galleySheetForId(id, galleyIds);

  return <ListingGalleyView sheet={sheet} galleyIds={galleyIds} />;
}
