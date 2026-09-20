import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingGamutView,
  type GamutViewKind,
  type GamutViewSheet,
} from "@/components/listing-gamut-view";
import {
  formatMoney,
  isDigitalListing,
  isGiftListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  GAMUT_CHAIR_ID,
  GAMUT_COOKIE_NAME,
  GAMUT_FONT_ID,
  GAMUT_PACK_ID,
  GAMUT_PDF_ID,
  GAMUT_REFUSE_COPY,
  canTapeGamut,
  isListingGamutOverlay,
  parseGamutListingIds,
} from "@/lib/listing-gamut";
import { listingGamutPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type GamutPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): GamutViewKind {
  if (!listing) {
    return "missing";
  }
  if (isGiftListing(listing)) {
    return "gift";
  }
  if (!isDigitalListing(listing)) {
    if (listing.status === "sold") {
      return listing.id === GAMUT_CHAIR_ID ? "chair" : "sold";
    }
    if (listing.status === "file-gone") {
      return "file-gone";
    }
    return listing.id === GAMUT_CHAIR_ID ? "chair" : "physical";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.status === "sold") {
    return "sold";
  }
  if (listing.id === GAMUT_PACK_ID) {
    return "pack";
  }
  if (listing.id === GAMUT_FONT_ID) {
    return "font";
  }
  if (listing.id === GAMUT_PDF_ID) {
    return "pdf";
  }
  if (!canTapeGamut(listing)) {
    return "owned";
  }
  return "digital";
}

function gamutSheetForId(id: string, gamutIds: string[]): GamutViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isGamut: listing ? isListingGamutOverlay(listing.id, gamutIds) : false,
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
}: GamutPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const gamutIds = parseGamutListingIds(jar.get(GAMUT_COOKIE_NAME)?.value);
  const sheet = gamutSheetForId(id, gamutIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: GAMUT_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a gamut note on.",
      path: listingGamutPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "digital") {
    return shareMetadata({
      title: GAMUT_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a gamut note."
          : sheet.kind === "chair"
            ? "A chair does not take a gamut note. Gamut honesty is for the parking-lot LUT pack."
            : sheet.kind === "pack"
              ? "A sample pack does not take a gamut note. Gamut honesty is for the parking-lot LUT pack."
              : sheet.kind === "font"
                ? "A booth font does not take a gamut note. Gamut honesty is for the parking-lot LUT pack."
                : sheet.kind === "pdf"
                  ? "A junk PDF does not take a gamut note. Gamut honesty is for the parking-lot LUT pack."
                  : sheet.kind === "owned"
                    ? "A gamut note is for the parking-lot LUT pack. Another overlay already owns that listing."
                    : "A Game Boy does not take a gamut note. Gamut honesty is for the parking-lot LUT pack.",
      path: listingGamutPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not gamut it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not gamut it. Still a parking lot. Still fluorescent. Still tote. Not posterize. Not gamma. Not lattice. Not an account.`,
    path: listingGamutPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingGamutPage({ params }: GamutPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const gamutIds = parseGamutListingIds(jar.get(GAMUT_COOKIE_NAME)?.value);
  const sheet = gamutSheetForId(id, gamutIds);

  return <ListingGamutView sheet={sheet} gamutIds={gamutIds} />;
}
