import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingWithView,
  type WithMateSheet,
  type WithViewKind,
  type WithViewSheet,
} from "@/components/listing-with-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  WITH_COOKIE_NAME,
  mateOf,
  parseWithPairs,
  sameStallMates,
} from "@/lib/listing-with";
import { listingWithPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type WithPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): WithViewKind {
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

function mateSheet(listing: ReturnType<typeof listingById>): WithMateSheet | null {
  if (!listing) {
    return null;
  }
  return {
    id: listing.id,
    title: listing.title,
    priceLabel: formatMoney(listing.price),
    fact: isPhysicalListing(listing) ? listing.condition : listing.fileFormat,
  };
}

function withSheetForId(
  id: string,
  pairs: ReturnType<typeof parseWithPairs>,
): WithViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;
  const mateId = listing ? mateOf(listing.id, pairs) : null;
  const mate = mateId ? listingById(mateId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    mateId: mate ? mate.id : null,
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
    mate: mateSheet(mate),
    mates: listing ? sameStallMates(listing).map((item) => mateSheet(item)!) : [],
  };
}

export async function generateMetadata({
  params,
}: WithPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const pairs = parseWithPairs(jar.get(WITH_COOKIE_NAME)?.value);
  const sheet = withSheetForId(id, pairs);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: "No pair for that listing",
      description: "No SKU with that id. Nothing walking together.",
      path: listingWithPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title:
        sheet.kind === "gift"
          ? "No pair on a gift card"
          : "No pair on a file",
      description:
        sheet.kind === "gift"
          ? "The gift card stays at the desk."
          : "A file does not walk with a jacket.",
      path: listingWithPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: sheet.mate
      ? `With · ${sheet.title} + ${sheet.mate.title}`
      : `These two go together · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. The mate is on the table. Not a bundle. Tote math stays put.`,
    path: listingWithPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingWithPage({ params }: WithPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const pairs = parseWithPairs(jar.get(WITH_COOKIE_NAME)?.value);
  const sheet = withSheetForId(id, pairs);

  return <ListingWithView sheet={sheet} pairs={pairs} />;
}
