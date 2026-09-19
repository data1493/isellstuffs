import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingDolbyView,
  type DolbyViewKind,
  type DolbyViewSheet,
} from "@/components/listing-dolby-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import {
  DOLBY_CDR_ID,
  DOLBY_CHAIR_ID,
  DOLBY_COOKIE_NAME,
  DOLBY_LP_ID,
  DOLBY_REFUSE_COPY,
  canTapeDolby,
  isListingDolbyOverlay,
  parseDolbyListingIds,
} from "@/lib/listing-dolby";
import { listingHubName } from "@/lib/listing-display";
import { listingDolbyPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type DolbyPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): DolbyViewKind {
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
    return listing.id === DOLBY_CHAIR_ID ? "chair" : "sold";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.id === DOLBY_CHAIR_ID) {
    return "chair";
  }
  if (listing.id === DOLBY_LP_ID) {
    return "lp";
  }
  if (listing.id === DOLBY_CDR_ID) {
    return "cdr";
  }
  if (!canTapeDolby(listing)) {
    return "owned";
  }
  return "physical";
}

function dolbySheetForId(id: string, dolbyIds: string[]): DolbyViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isDolby: listing ? isListingDolbyOverlay(listing.id, dolbyIds) : false,
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
}: DolbyPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const dolbyIds = parseDolbyListingIds(jar.get(DOLBY_COOKIE_NAME)?.value);
  const sheet = dolbySheetForId(id, dolbyIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: DOLBY_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a Dolby note on.",
      path: listingDolbyPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: DOLBY_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a Dolby note."
          : sheet.kind === "lp"
            ? "A record does not take a Dolby note. Dolby is a cassette NR."
            : sheet.kind === "cdr"
              ? "A disc does not take a Dolby note. Dolby is a cassette NR."
              : sheet.kind === "chair"
                ? "A chair does not take a Dolby note. Dolby is a cassette NR."
                : sheet.kind === "owned"
                  ? "A Dolby note is for SUMMER 93. Another overlay already owns that listing."
                  : "A file does not take a Dolby note. A Dolby note is for the cassette on the table.",
      path: listingDolbyPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not Dolby it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not Dolby it. Still hiss. Still SUMMER 93. Still tote. Not hiss. Not degauss. Not azimuth.`,
    path: listingDolbyPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingDolbyPage({ params }: DolbyPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const dolbyIds = parseDolbyListingIds(jar.get(DOLBY_COOKIE_NAME)?.value);
  const sheet = dolbySheetForId(id, dolbyIds);

  return <ListingDolbyView sheet={sheet} dolbyIds={dolbyIds} />;
}
