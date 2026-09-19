import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingSaucerView,
  type SaucerViewKind,
  type SaucerViewSheet,
} from "@/components/listing-saucer-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  SAUCER_COOKIE_NAME,
  SAUCER_REFUSE_COPY,
  isListingSaucerOverlay,
  parseSaucerListingIds,
} from "@/lib/listing-saucer";
import { listingSaucerPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type SaucerPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): SaucerViewKind {
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

function saucerSheetForId(id: string, saucerIds: string[]): SaucerViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isSaucer: listing ? isListingSaucerOverlay(listing.id, saucerIds) : false,
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
}: SaucerPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const saucerIds = parseSaucerListingIds(jar.get(SAUCER_COOKIE_NAME)?.value);
  const sheet = saucerSheetForId(id, saucerIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: SAUCER_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a saucer note on.",
      path: listingSaucerPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: SAUCER_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a saucer note."
          : "A recipe PDF is not a mug. A saucer note is for a diner mug on the table.",
      path: listingSaucerPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I don't have a saucer · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I don't have a saucer. Mug only. Still a mug. Still tote. Not a diner shop. Still for sale.`,
    path: listingSaucerPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingSaucerPage({ params }: SaucerPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const saucerIds = parseSaucerListingIds(jar.get(SAUCER_COOKIE_NAME)?.value);
  const sheet = saucerSheetForId(id, saucerIds);

  return <ListingSaucerView sheet={sheet} saucerIds={saucerIds} />;
}
