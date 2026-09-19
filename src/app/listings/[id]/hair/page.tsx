import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingHairView,
  type HairViewKind,
  type HairViewSheet,
} from "@/components/listing-hair-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  HAIR_COOKIE_NAME,
  HAIR_REFUSE_COPY,
  isListingHairOverlay,
  parseHairListingIds,
} from "@/lib/listing-hair";
import { listingHairPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type HairPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): HairViewKind {
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

function hairSheetForId(id: string, hairIds: string[]): HairViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isHair: listing ? isListingHairOverlay(listing.id, hairIds) : false,
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
}: HairPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const hairIds = parseHairListingIds(jar.get(HAIR_COOKIE_NAME)?.value);
  const sheet = hairSheetForId(id, hairIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: HAIR_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape pet hair on.",
      path: listingHairPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: HAIR_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not hold pet hair."
          : "A file does not hold pet hair. Pet-hair honesty is for furniture and textiles on the table.",
      path: listingHairPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `Pet hair stays · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. Smoke is the jacket smell. Wash is I washed it. This is furniture and textile pet hair. Still tote. Not smoke. Not wash.`,
    path: listingHairPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingHairPage({ params }: HairPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const hairIds = parseHairListingIds(jar.get(HAIR_COOKIE_NAME)?.value);
  const sheet = hairSheetForId(id, hairIds);

  return <ListingHairView sheet={sheet} hairIds={hairIds} />;
}
