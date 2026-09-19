import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingRipView,
  type RipViewKind,
  type RipViewSheet,
} from "@/components/listing-rip-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  RIP_COOKIE_NAME,
  RIP_REFUSE_COPY,
  isListingRipOverlay,
  parseRipListingIds,
} from "@/lib/listing-rip";
import { listingRipPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type RipPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): RipViewKind {
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

function ripSheetForId(id: string, ripIds: string[]): RipViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isRip: listing ? isListingRipOverlay(listing.id, ripIds) : false,
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
}: RipPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const ripIds = parseRipListingIds(jar.get(RIP_COOKIE_NAME)?.value);
  const sheet = ripSheetForId(id, ripIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: RIP_REFUSE_COPY,
      description: "No SKU with that id. Nothing to leave on the tape.",
      path: listingRipPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: RIP_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code is not a cassette."
          : "A liner PDF is not a tape. Rip honesty is for a cassette on the table.",
      path: listingRipPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I don't rip · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. Hiss is the hiss. Songs is no titles. Scan is the liner PDF pair. This is the cassette. I will not make a WAV. Still tote. Not hiss. Not a transfer shop.`,
    path: listingRipPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingRipPage({ params }: RipPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const ripIds = parseRipListingIds(jar.get(RIP_COOKIE_NAME)?.value);
  const sheet = ripSheetForId(id, ripIds);

  return <ListingRipView sheet={sheet} ripIds={ripIds} />;
}
