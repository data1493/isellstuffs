import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingLinkView,
  type LinkViewKind,
  type LinkViewSheet,
} from "@/components/listing-link-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  LINK_COOKIE_NAME,
  LINK_REFUSE_COPY,
  isListingLinkOverlay,
  parseLinkListingIds,
} from "@/lib/listing-link";
import { listingLinkPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type LinkPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): LinkViewKind {
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

function linkSheetForId(id: string, linkIds: string[]): LinkViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isLink: listing ? isListingLinkOverlay(listing.id, linkIds) : false,
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
}: LinkPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const linkIds = parseLinkListingIds(jar.get(LINK_COOKIE_NAME)?.value);
  const sheet = linkSheetForId(id, linkIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: LINK_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a link note on.",
      path: listingLinkPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: LINK_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a link note."
          : "A file does not take a link note. A link note is for a brick on the table.",
      path: listingLinkPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I don't have a link · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I don't have a link. One brick. Still tote. Not a Nintendo desk. Still for sale.`,
    path: listingLinkPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingLinkPage({ params }: LinkPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const linkIds = parseLinkListingIds(jar.get(LINK_COOKIE_NAME)?.value);
  const sheet = linkSheetForId(id, linkIds);

  return <ListingLinkView sheet={sheet} linkIds={linkIds} />;
}
