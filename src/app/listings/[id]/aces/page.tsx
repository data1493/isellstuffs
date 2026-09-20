import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingAcesView,
  type AcesViewKind,
  type AcesViewSheet,
} from "@/components/listing-aces-view";
import {
  formatMoney,
  isDigitalListing,
  isGiftListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  ACES_CHAIR_ID,
  ACES_COOKIE_NAME,
  ACES_FONT_ID,
  ACES_PACK_ID,
  ACES_PDF_ID,
  ACES_REFUSE_COPY,
  canTapeAces,
  isListingAcesOverlay,
  parseAcesListingIds,
} from "@/lib/listing-aces";
import { listingAcesPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type AcesPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): AcesViewKind {
  if (!listing) {
    return "missing";
  }
  if (isGiftListing(listing)) {
    return "gift";
  }
  if (!isDigitalListing(listing)) {
    if (listing.status === "sold") {
      return listing.id === ACES_CHAIR_ID ? "chair" : "sold";
    }
    if (listing.status === "file-gone") {
      return "file-gone";
    }
    return listing.id === ACES_CHAIR_ID ? "chair" : "physical";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.status === "sold") {
    return "sold";
  }
  if (listing.id === ACES_PACK_ID) {
    return "pack";
  }
  if (listing.id === ACES_FONT_ID) {
    return "font";
  }
  if (listing.id === ACES_PDF_ID) {
    return "pdf";
  }
  if (!canTapeAces(listing)) {
    return "owned";
  }
  return "digital";
}

function acesSheetForId(id: string, acesIds: string[]): AcesViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isAces: listing ? isListingAcesOverlay(listing.id, acesIds) : false,
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
}: AcesPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const acesIds = parseAcesListingIds(jar.get(ACES_COOKIE_NAME)?.value);
  const sheet = acesSheetForId(id, acesIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: ACES_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape an aces note on.",
      path: listingAcesPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "digital") {
    return shareMetadata({
      title: ACES_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take an aces note."
          : sheet.kind === "chair"
            ? "A chair does not take an aces note. Aces honesty is for the parking-lot LUT pack."
            : sheet.kind === "pack"
              ? "A sample pack does not take an aces note. Aces honesty is for the parking-lot LUT pack."
              : sheet.kind === "font"
                ? "A booth font does not take an aces note. Aces honesty is for the parking-lot LUT pack."
                : sheet.kind === "pdf"
                  ? "A junk PDF does not take an aces note. Aces honesty is for the parking-lot LUT pack."
                  : sheet.kind === "owned"
                    ? "An aces note is for the parking-lot LUT pack. Another overlay already owns that listing."
                    : "A Game Boy does not take an aces note. Aces honesty is for the parking-lot LUT pack.",
      path: listingAcesPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not aces it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not aces it. Still a parking lot. Still fluorescent. Still tote. Not posterize. Not gamut. Not lattice. Not an account.`,
    path: listingAcesPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingAcesPage({ params }: AcesPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const acesIds = parseAcesListingIds(jar.get(ACES_COOKIE_NAME)?.value);
  const sheet = acesSheetForId(id, acesIds);

  return <ListingAcesView sheet={sheet} acesIds={acesIds} />;
}
