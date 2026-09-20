import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingFlutterView,
  type FlutterViewKind,
  type FlutterViewSheet,
} from "@/components/listing-flutter-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  FLUTTER_CHAIR_ID,
  FLUTTER_COOKIE_NAME,
  FLUTTER_JEWELS_ID,
  FLUTTER_LP_ID,
  FLUTTER_REFUSE_COPY,
  canTapeFlutter,
  isListingFlutterOverlay,
  parseFlutterListingIds,
} from "@/lib/listing-flutter";
import { listingFlutterPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type FlutterPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): FlutterViewKind {
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
    return listing.id === FLUTTER_CHAIR_ID ? "chair" : "sold";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.id === FLUTTER_CHAIR_ID) {
    return "chair";
  }
  if (listing.id === FLUTTER_LP_ID) {
    return "lp";
  }
  if (listing.id === FLUTTER_JEWELS_ID) {
    return "jewels";
  }
  if (!canTapeFlutter(listing)) {
    return "owned";
  }
  return "physical";
}

function flutterSheetForId(id: string, flutterIds: string[]): FlutterViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isFlutter: listing ? isListingFlutterOverlay(listing.id, flutterIds) : false,
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
}: FlutterPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const flutterIds = parseFlutterListingIds(jar.get(FLUTTER_COOKIE_NAME)?.value);
  const sheet = flutterSheetForId(id, flutterIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: FLUTTER_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a flutter note on.",
      path: listingFlutterPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: FLUTTER_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a flutter note."
          : sheet.kind === "lp"
            ? "A record does not take a flutter note. Flutter is a cassette wobble."
            : sheet.kind === "jewels"
              ? "Empty jewel cases do not take a flutter note. Flutter is a cassette wobble."
              : sheet.kind === "chair"
                ? "A chair does not take a flutter note. Flutter is a cassette wobble."
                : sheet.kind === "owned"
                  ? "A flutter note is for SUMMER 93. Another overlay already owns that listing."
                  : "A file does not take a flutter note. A flutter note is for the cassette on the table.",
      path: listingFlutterPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not flutter it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not flutter it. Still hiss. Still a radio edit. Still tote. Not bias. Not pinch. Not azimuth.`,
    path: listingFlutterPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingFlutterPage({ params }: FlutterPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const flutterIds = parseFlutterListingIds(jar.get(FLUTTER_COOKIE_NAME)?.value);
  const sheet = flutterSheetForId(id, flutterIds);

  return <ListingFlutterView sheet={sheet} flutterIds={flutterIds} />;
}
