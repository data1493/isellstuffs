import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingPosterizeView,
  type PosterizeViewKind,
  type PosterizeViewSheet,
} from "@/components/listing-posterize-view";
import {
  formatMoney,
  isDigitalListing,
  isGiftListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  POSTERIZE_COOKIE_NAME,
  POSTERIZE_HOST_ID,
  POSTERIZE_REFUSE_COPY,
  canTapePosterize,
  isListingPosterizeOverlay,
  parsePosterizeListingIds,
} from "@/lib/listing-posterize";
import { listingPosterizePath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type PosterizePageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): PosterizeViewKind {
  if (!listing) {
    return "missing";
  }
  if (isGiftListing(listing)) {
    return "gift";
  }
  if (isDigitalListing(listing)) {
    if (listing.status === "file-gone") {
      return "file-gone";
    }
    if (listing.id !== POSTERIZE_HOST_ID || !canTapePosterize(listing)) {
      return "owned";
    }
    return "digital";
  }
  if (listing.status === "sold") {
    return "sold";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  return "physical";
}

function posterizeSheetForId(id: string, posterizeIds: string[]): PosterizeViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isPosterize: listing ? isListingPosterizeOverlay(listing.id, posterizeIds) : false,
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
}: PosterizePageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const posterizeIds = parsePosterizeListingIds(jar.get(POSTERIZE_COOKIE_NAME)?.value);
  const sheet = posterizeSheetForId(id, posterizeIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: POSTERIZE_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a posterize note on.",
      path: listingPosterizePath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "digital") {
    return shareMetadata({
      title: POSTERIZE_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a posterize note."
          : sheet.kind === "owned"
            ? "A posterize note is for the parking-lot LUT pack. Another overlay already owns that listing."
            : "A Game Boy does not take a posterize note. A posterize note is for three parking-lot looks.",
      path: listingPosterizePath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not posterize them · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not posterize them. Still three looks. Still a parking lot. Still tote. Not gamma. Not cube. Not a shop. Not shaper. Not an account.`,
    path: listingPosterizePath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingPosterizePage({ params }: PosterizePageProps) {
  const { id } = await params;
  const jar = await cookies();
  const posterizeIds = parsePosterizeListingIds(jar.get(POSTERIZE_COOKIE_NAME)?.value);
  const sheet = posterizeSheetForId(id, posterizeIds);

  return <ListingPosterizeView sheet={sheet} posterizeIds={posterizeIds} />;
}
