import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingScaleView,
  type ScaleViewKind,
  type ScaleViewSheet,
} from "@/components/listing-scale-view";
import {
  formatMoney,
  isDigitalListing,
  isGiftListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  SCALE_COOKIE_NAME,
  SCALE_HOST_ID,
  SCALE_REFUSE_COPY,
  canTapeScale,
  isListingScaleOverlay,
  parseScaleListingIds,
} from "@/lib/listing-scale";
import { listingScalePath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type ScalePageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): ScaleViewKind {
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
    if (listing.id !== SCALE_HOST_ID || !canTapeScale(listing)) {
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

function scaleSheetForId(id: string, scaleIds: string[]): ScaleViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isScale: listing ? isListingScaleOverlay(listing.id, scaleIds) : false,
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
}: ScalePageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const scaleIds = parseScaleListingIds(jar.get(SCALE_COOKIE_NAME)?.value);
  const sheet = scaleSheetForId(id, scaleIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: SCALE_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a scale note on.",
      path: listingScalePath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "digital") {
    return shareMetadata({
      title: SCALE_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a scale note."
          : sheet.kind === "owned"
            ? "A scale note is for the stained recipe cards. Another overlay already owns that listing."
            : "A lid does not take a scale note. A scale note is for three scanned cards.",
      path: listingScalePath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not scale them · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not scale them. Still vibes. Still three cards. Still tote. Not metric. Not double. Not a shop. Not cards.`,
    path: listingScalePath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingScalePage({ params }: ScalePageProps) {
  const { id } = await params;
  const jar = await cookies();
  const scaleIds = parseScaleListingIds(jar.get(SCALE_COOKIE_NAME)?.value);
  const sheet = scaleSheetForId(id, scaleIds);

  return <ListingScaleView sheet={sheet} scaleIds={scaleIds} />;
}
