import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingTinView,
  type TinViewKind,
  type TinViewSheet,
} from "@/components/listing-tin-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  TIN_COOKIE_NAME,
  TIN_REFUSE_COPY,
  isListingTinOverlay,
  parseTinListingIds,
} from "@/lib/listing-tin";
import { listingTinPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type TinPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): TinViewKind {
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

function tinSheetForId(id: string, tinIds: string[]): TinViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isTin: listing ? isListingTinOverlay(listing.id, tinIds) : false,
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
}: TinPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const tinIds = parseTinListingIds(jar.get(TIN_COOKIE_NAME)?.value);
  const sheet = tinSheetForId(id, tinIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: TIN_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a tin note on.",
      path: listingTinPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: TIN_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a tin note."
          : "A file does not take a tin note. A tin note is for a pile on the table.",
      path: listingTinPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not tin them · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not tin them. Still a pile. Still untested. Still tote. Not coil. Not pile. Not a shop.`,
    path: listingTinPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingTinPage({ params }: TinPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const tinIds = parseTinListingIds(jar.get(TIN_COOKIE_NAME)?.value);
  const sheet = tinSheetForId(id, tinIds);

  return <ListingTinView sheet={sheet} tinIds={tinIds} />;
}
