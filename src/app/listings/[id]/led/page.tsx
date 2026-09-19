import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingLedView,
  type LedViewKind,
  type LedViewSheet,
} from "@/components/listing-led-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  LED_COOKIE_NAME,
  LED_REFUSE_COPY,
  isListingLedOverlay,
  parseLedListingIds,
} from "@/lib/listing-led";
import { listingLedPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type LedPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): LedViewKind {
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

function ledSheetForId(id: string, ledIds: string[]): LedViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isLed: listing ? isListingLedOverlay(listing.id, ledIds) : false,
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
}: LedPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const ledIds = parseLedListingIds(jar.get(LED_COOKIE_NAME)?.value);
  const sheet = ledSheetForId(id, ledIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: LED_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a led note on.",
      path: listingLedPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: LED_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a led note."
          : "A file does not take a led note. A led note is for a lamp on the table.",
      path: listingLedPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not LED it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not LED it. Twist the neck. Still lights. Still tote. Not a lighting shop. Still for sale.`,
    path: listingLedPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingLedPage({ params }: LedPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const ledIds = parseLedListingIds(jar.get(LED_COOKIE_NAME)?.value);
  const sheet = ledSheetForId(id, ledIds);

  return <ListingLedView sheet={sheet} ledIds={ledIds} />;
}
