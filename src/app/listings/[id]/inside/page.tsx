import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingInsideView,
  type InsideViewKind,
  type InsideViewSheet,
} from "@/components/listing-inside-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  INSIDE_COOKIE_NAME,
  INSIDE_REFUSE_COPY,
  isListingInsideOverlay,
  parseInsideListingIds,
} from "@/lib/listing-inside";
import { listingInsidePath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type InsidePageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): InsideViewKind {
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

function insideSheetForId(id: string, insideIds: string[]): InsideViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isInside: listing ? isListingInsideOverlay(listing.id, insideIds) : false,
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
}: InsidePageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const insideIds = parseInsideListingIds(jar.get(INSIDE_COOKIE_NAME)?.value);
  const sheet = insideSheetForId(id, insideIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: INSIDE_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape an inside note on.",
      path: listingInsidePath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: INSIDE_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take an inside note."
          : "A file does not take an inside note. An inside note is for empty jewels on the table.",
      path: listingInsidePath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not say what was inside · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not say what was inside. Empty. That is how they arrived. Still tote. Not a memory desk. Still for sale.`,
    path: listingInsidePath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingInsidePage({ params }: InsidePageProps) {
  const { id } = await params;
  const jar = await cookies();
  const insideIds = parseInsideListingIds(jar.get(INSIDE_COOKIE_NAME)?.value);
  const sheet = insideSheetForId(id, insideIds);

  return <ListingInsideView sheet={sheet} insideIds={insideIds} />;
}
