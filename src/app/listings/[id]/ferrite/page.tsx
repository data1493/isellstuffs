import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingFerriteView,
  type FerriteViewKind,
  type FerriteViewSheet,
} from "@/components/listing-ferrite-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  FERRITE_COOKIE_NAME,
  FERRITE_REFUSE_COPY,
  isListingFerriteOverlay,
  parseFerriteListingIds,
} from "@/lib/listing-ferrite";
import { listingFerritePath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type FerritePageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): FerriteViewKind {
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

function ferriteSheetForId(id: string, ferriteIds: string[]): FerriteViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isFerrite: listing ? isListingFerriteOverlay(listing.id, ferriteIds) : false,
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
}: FerritePageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const ferriteIds = parseFerriteListingIds(jar.get(FERRITE_COOKIE_NAME)?.value);
  const sheet = ferriteSheetForId(id, ferriteIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: FERRITE_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a ferrite note on.",
      path: listingFerritePath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: FERRITE_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a ferrite note."
          : "A file does not take a ferrite note. A ferrite note is for a pile on the table.",
      path: listingFerritePath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not ferrite them · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not ferrite them. Still a pile. Still untested. Still tote. Not coil. Not pile. Not a shop.`,
    path: listingFerritePath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingFerritePage({ params }: FerritePageProps) {
  const { id } = await params;
  const jar = await cookies();
  const ferriteIds = parseFerriteListingIds(jar.get(FERRITE_COOKIE_NAME)?.value);
  const sheet = ferriteSheetForId(id, ferriteIds);

  return <ListingFerriteView sheet={sheet} ferriteIds={ferriteIds} />;
}
