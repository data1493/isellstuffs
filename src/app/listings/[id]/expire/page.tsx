import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingExpireView,
  type ExpireViewKind,
  type ExpireViewSheet,
} from "@/components/listing-expire-view";
import {
  formatMoney,
  isDigitalListing,
  isGiftListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  EXPIRE_COOKIE_NAME,
  EXPIRE_REFUSE_COPY,
  isListingExpireOverlay,
  parseExpireListingIds,
} from "@/lib/listing-expire";
import { listingExpirePath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type ExpirePageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): ExpireViewKind {
  if (!listing) {
    return "missing";
  }
  if (isGiftListing(listing)) {
    if (listing.status === "file-gone") {
      return "file-gone";
    }
    if (listing.status === "sold") {
      return "sold";
    }
    return "gift";
  }
  if (isDigitalListing(listing)) {
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

function expireSheetForId(id: string, expireIds: string[]): ExpireViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isExpire: listing ? isListingExpireOverlay(listing.id, expireIds) : false,
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
}: ExpirePageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const expireIds = parseExpireListingIds(jar.get(EXPIRE_COOKIE_NAME)?.value);
  const sheet = expireSheetForId(id, expireIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: EXPIRE_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape an expire note on.",
      path: listingExpirePath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "gift") {
    return shareMetadata({
      title: EXPIRE_REFUSE_COPY,
      description:
        sheet.kind === "physical" || sheet.kind === "sold"
          ? "A CD-R does not expire. Expire honesty is for the mall gift card."
          : "A junk PDF does not expire. Expire honesty is for the mall gift card.",
      path: listingExpirePath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not expire it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not expire it. No void date. Still credit. Reload is stall paper only. Gift desk is paper. Still tote.`,
    path: listingExpirePath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingExpirePage({ params }: ExpirePageProps) {
  const { id } = await params;
  const jar = await cookies();
  const expireIds = parseExpireListingIds(jar.get(EXPIRE_COOKIE_NAME)?.value);
  const sheet = expireSheetForId(id, expireIds);

  return <ListingExpireView sheet={sheet} expireIds={expireIds} />;
}
