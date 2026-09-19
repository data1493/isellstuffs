import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingNestView,
  type NestViewKind,
  type NestViewSheet,
} from "@/components/listing-nest-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  NEST_COOKIE_NAME,
  NEST_REFUSE_COPY,
  isListingNestOverlay,
  parseNestListingIds,
} from "@/lib/listing-nest";
import { listingNestPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type NestPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): NestViewKind {
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

function nestSheetForId(id: string, nestIds: string[]): NestViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isNest: listing ? isListingNestOverlay(listing.id, nestIds) : false,
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
}: NestPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const nestIds = parseNestListingIds(jar.get(NEST_COOKIE_NAME)?.value);
  const sheet = nestSheetForId(id, nestIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: NEST_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a nest note on.",
      path: listingNestPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: NEST_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a nest note."
          : "A file does not take a nest note. A nest note is for empty jewels on the table.",
      path: listingNestPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not nest them · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not nest them. Still a pile. Still empty. Still tote. Not sort. Not fill. Not a shop. Not cases.`,
    path: listingNestPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingNestPage({ params }: NestPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const nestIds = parseNestListingIds(jar.get(NEST_COOKIE_NAME)?.value);
  const sheet = nestSheetForId(id, nestIds);

  return <ListingNestView sheet={sheet} nestIds={nestIds} />;
}
