import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingDartView,
  type DartViewKind,
  type DartViewSheet,
} from "@/components/listing-dart-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import {
  DART_COOKIE_NAME,
  DART_LAMP_ID,
  DART_REFUSE_COPY,
  DART_SNEAKER_ID,
  canTapeDart,
  isListingDartOverlay,
  parseDartListingIds,
} from "@/lib/listing-dart";
import { listingHubName } from "@/lib/listing-display";
import { listingDartPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type DartPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): DartViewKind {
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
  if (listing.id === DART_SNEAKER_ID) {
    return "sneakers";
  }
  if (listing.id === DART_LAMP_ID) {
    return "lamp";
  }
  if (!canTapeDart(listing)) {
    return "owned";
  }
  return "physical";
}

function dartSheetForId(id: string, dartIds: string[]): DartViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isDart: listing ? isListingDartOverlay(listing.id, dartIds) : false,
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
}: DartPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const dartIds = parseDartListingIds(jar.get(DART_COOKIE_NAME)?.value);
  const sheet = dartSheetForId(id, dartIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: DART_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a dart note on.",
      path: listingDartPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: DART_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a dart note."
          : sheet.kind === "sneakers"
            ? "Sneakers do not take a dart note. Dart is a jacket hang."
            : sheet.kind === "lamp"
              ? "A lamp does not take a dart note. Dart is a jacket hang."
              : sheet.kind === "owned"
                ? "A dart note is for the windbreaker. Another overlay already owns that listing."
                : "A file does not take a dart note. A dart note is for the jacket on the table.",
      path: listingDartPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not dart it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not dart it. Still worn twice. Still a car. Still tote. Not wash. Not spray. Not lining.`,
    path: listingDartPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingDartPage({ params }: DartPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const dartIds = parseDartListingIds(jar.get(DART_COOKIE_NAME)?.value);
  const sheet = dartSheetForId(id, dartIds);

  return <ListingDartView sheet={sheet} dartIds={dartIds} />;
}
