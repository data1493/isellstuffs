import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingMinsView,
  type MinsViewKind,
  type MinsViewSheet,
} from "@/components/listing-mins-view";
import {
  formatMoney,
  isDigitalListing,
  isGiftListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  MINS_COOKIE_NAME,
  MINS_REFUSE_COPY,
  isListingMinsOverlay,
  parseMinsListingIds,
} from "@/lib/listing-mins";
import { listingMinsPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type MinsPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): MinsViewKind {
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

function minsSheetForId(id: string, minsIds: string[]): MinsViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isMins: listing ? isListingMinsOverlay(listing.id, minsIds) : false,
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
}: MinsPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const minsIds = parseMinsListingIds(jar.get(MINS_COOKIE_NAME)?.value);
  const sheet = minsSheetForId(id, minsIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: MINS_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a minutes note on.",
      path: listingMinsPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "digital") {
    return shareMetadata({
      title: MINS_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code is not a kitchen timer."
          : "A mug is not a kitchen timer. Minutes honesty is for a file on the digital lot.",
      path: listingMinsPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not time it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not time it. No minutes. Vibe is cups are vibes. Double is I will not scale. Cards is I will not type them. Still tote.`,
    path: listingMinsPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingMinsPage({ params }: MinsPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const minsIds = parseMinsListingIds(jar.get(MINS_COOKIE_NAME)?.value);
  const sheet = minsSheetForId(id, minsIds);

  return <ListingMinsView sheet={sheet} minsIds={minsIds} />;
}
