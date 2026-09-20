import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingIsrcView,
  type IsrcViewKind,
  type IsrcViewSheet,
} from "@/components/listing-isrc-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  ISRC_CHAIR_ID,
  ISRC_COOKIE_NAME,
  ISRC_FONT_ID,
  ISRC_MIXTAPE_ID,
  ISRC_PACK_ID,
  ISRC_REFUSE_COPY,
  canTapeIsrc,
  isListingIsrcOverlay,
  parseIsrcListingIds,
} from "@/lib/listing-isrc";
import { listingIsrcPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type IsrcPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): IsrcViewKind {
  if (!listing) {
    return "missing";
  }
  if (isGiftListing(listing)) {
    return "gift";
  }
  if (listing.id === ISRC_PACK_ID) {
    return "pack";
  }
  if (listing.id === ISRC_FONT_ID) {
    return "font";
  }
  if (!isPhysicalListing(listing)) {
    return listing.status === "file-gone" ? "file-gone" : "digital";
  }
  if (listing.status === "sold") {
    return listing.id === ISRC_CHAIR_ID ? "chair" : "sold";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.id === ISRC_CHAIR_ID) {
    return "chair";
  }
  if (listing.id === ISRC_MIXTAPE_ID) {
    return "mixtape";
  }
  if (!canTapeIsrc(listing)) {
    return "owned";
  }
  return "physical";
}

function isrcSheetForId(id: string, isrcIds: string[]): IsrcViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isIsrc: listing ? isListingIsrcOverlay(listing.id, isrcIds) : false,
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
}: IsrcPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const isrcIds = parseIsrcListingIds(jar.get(ISRC_COOKIE_NAME)?.value);
  const sheet = isrcSheetForId(id, isrcIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: ISRC_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape an isrc note on.",
      path: listingIsrcPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: ISRC_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take an isrc note."
          : sheet.kind === "pack"
            ? "A sample pack does not take an isrc note. Isrc is a burned-disc note."
            : sheet.kind === "mixtape"
              ? "A mixtape does not take an isrc note. Isrc is a burned-disc note."
              : sheet.kind === "font"
                ? "A font does not take an isrc note. Isrc is a burned-disc note."
                : sheet.kind === "chair"
                  ? "A chair does not take an isrc note. Isrc is a burned-disc note."
                  : sheet.kind === "owned"
                    ? "An isrc note is for the burned CD-R. Another overlay already owns that listing."
                    : "A file does not take an isrc note. An isrc note is for the disc on the table.",
      path: listingIsrcPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not isrc it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not isrc it. Still Sharpie. Still a jewel case. Still tote. Not pregap. Not atip. Not stamper.`,
    path: listingIsrcPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingIsrcPage({ params }: IsrcPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const isrcIds = parseIsrcListingIds(jar.get(ISRC_COOKIE_NAME)?.value);
  const sheet = isrcSheetForId(id, isrcIds);

  return <ListingIsrcView sheet={sheet} isrcIds={isrcIds} />;
}
