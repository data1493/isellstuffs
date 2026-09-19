import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingVanView,
  type VanViewKind,
  type VanViewSheet,
} from "@/components/listing-van-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import { listingVanPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";
import {
  VAN_COOKIE_NAME,
  isListingVanOverlay,
  parseVanListingIds,
} from "@/lib/van-restock";

export const dynamic = "force-dynamic";

type VanPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): VanViewKind {
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

function vanSheetForId(id: string, vanIds: string[]): VanViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    inVan: listing ? isListingVanOverlay(listing.id, vanIds) : false,
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
}: VanPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const vanIds = parseVanListingIds(jar.get(VAN_COOKIE_NAME)?.value);
  const sheet = vanSheetForId(id, vanIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: "No van for that listing",
      description: "No SKU with that id. Nothing waiting out back.",
      path: listingVanPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title:
        sheet.kind === "gift"
          ? "No van on a gift card"
          : "No van on a file",
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk."
          : "A file is not in the van.",
      path: listingVanPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `More in the van · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. More out back. Ask. Still baggable.`,
    path: listingVanPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingVanPage({ params }: VanPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const vanIds = parseVanListingIds(jar.get(VAN_COOKIE_NAME)?.value);
  const sheet = vanSheetForId(id, vanIds);

  return <ListingVanView sheet={sheet} vanIds={vanIds} />;
}
