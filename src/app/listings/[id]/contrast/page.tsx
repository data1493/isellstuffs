import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingContrastView,
  type ContrastViewKind,
  type ContrastViewSheet,
} from "@/components/listing-contrast-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import {
  CONTRAST_COOKIE_NAME,
  CONTRAST_LUT_ID,
  CONTRAST_PACK_ID,
  CONTRAST_REFUSE_COPY,
  canTapeContrast,
  isListingContrastOverlay,
  parseContrastListingIds,
} from "@/lib/listing-contrast";
import { listingHubName } from "@/lib/listing-display";
import { listingContrastPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type ContrastPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): ContrastViewKind {
  if (!listing) {
    return "missing";
  }
  if (isGiftListing(listing)) {
    return "gift";
  }
  if (listing.id === CONTRAST_LUT_ID) {
    return "lut";
  }
  if (listing.id === CONTRAST_PACK_ID) {
    return "pack";
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
  if (!canTapeContrast(listing)) {
    return "owned";
  }
  return "physical";
}

function contrastSheetForId(
  id: string,
  contrastIds: string[],
): ContrastViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isContrast: listing
      ? isListingContrastOverlay(listing.id, contrastIds)
      : false,
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
}: ContrastPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const contrastIds = parseContrastListingIds(
    jar.get(CONTRAST_COOKIE_NAME)?.value,
  );
  const sheet = contrastSheetForId(id, contrastIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: CONTRAST_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a contrast note on.",
      path: listingContrastPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: CONTRAST_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a contrast note."
          : sheet.kind === "lut"
            ? "A LUT pack does not take a contrast note. Contrast is a Game Boy screen."
            : sheet.kind === "pack"
              ? "A sample pack does not take a contrast note. Contrast is a Game Boy screen."
              : sheet.kind === "owned"
                ? "A contrast note is for the cracked Game Boy. Another overlay already owns that listing."
                : "A file does not take a contrast note. A contrast note is for the Game Boy on the table.",
      path: listingContrastPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not contrast it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not contrast it. Still a line. Still dim. Still tote. Not line. Not cells. Not recap.`,
    path: listingContrastPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingContrastPage({
  params,
}: ContrastPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const contrastIds = parseContrastListingIds(
    jar.get(CONTRAST_COOKIE_NAME)?.value,
  );
  const sheet = contrastSheetForId(id, contrastIds);

  return <ListingContrastView sheet={sheet} contrastIds={contrastIds} />;
}
