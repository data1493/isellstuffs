import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingWarmView,
  type WarmViewKind,
  type WarmViewSheet,
} from "@/components/listing-warm-view";
import {
  formatMoney,
  isDigitalListing,
  isGiftListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  WARM_COOKIE_NAME,
  WARM_REFUSE_COPY,
  isListingWarmOverlay,
  parseWarmListingIds,
} from "@/lib/listing-warm";
import { listingWarmPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type WarmPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): WarmViewKind {
  if (!listing) {
    return "missing";
  }
  if (isGiftListing(listing)) {
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

function warmSheetForId(id: string, warmIds: string[]): WarmViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isWarm: listing ? isListingWarmOverlay(listing.id, warmIds) : false,
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
}: WarmPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const warmIds = parseWarmListingIds(jar.get(WARM_COOKIE_NAME)?.value);
  const sheet = warmSheetForId(id, warmIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: WARM_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a warm note on.",
      path: listingWarmPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "digital") {
    return shareMetadata({
      title: WARM_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code is not a LUT look."
          : "A lamp is not a LUT look. Warm honesty is for a file on the digital lot.",
      path: listingWarmPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `Warm stays warm · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. Warm stays warm. Three looks. Shot is I don't shoot. Grade is no custom LUT. Convert is Rec.709. Still tote.`,
    path: listingWarmPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingWarmPage({ params }: WarmPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const warmIds = parseWarmListingIds(jar.get(WARM_COOKIE_NAME)?.value);
  const sheet = warmSheetForId(id, warmIds);

  return <ListingWarmView sheet={sheet} warmIds={warmIds} />;
}
