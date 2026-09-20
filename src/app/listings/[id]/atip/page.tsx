import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingAtipView,
  type AtipViewKind,
  type AtipViewSheet,
} from "@/components/listing-atip-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  ATIP_CHAIR_ID,
  ATIP_COOKIE_NAME,
  ATIP_FONT_ID,
  ATIP_MIXTAPE_ID,
  ATIP_PACK_ID,
  ATIP_REFUSE_COPY,
  canTapeAtip,
  isListingAtipOverlay,
  parseAtipListingIds,
} from "@/lib/listing-atip";
import { listingAtipPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type AtipPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): AtipViewKind {
  if (!listing) {
    return "missing";
  }
  if (isGiftListing(listing)) {
    return "gift";
  }
  if (listing.id === ATIP_PACK_ID) {
    return "pack";
  }
  if (listing.id === ATIP_FONT_ID) {
    return "font";
  }
  if (!isPhysicalListing(listing)) {
    return listing.status === "file-gone" ? "file-gone" : "digital";
  }
  if (listing.status === "sold") {
    return listing.id === ATIP_CHAIR_ID ? "chair" : "sold";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.id === ATIP_CHAIR_ID) {
    return "chair";
  }
  if (listing.id === ATIP_MIXTAPE_ID) {
    return "mixtape";
  }
  if (!canTapeAtip(listing)) {
    return "owned";
  }
  return "physical";
}

function atipSheetForId(id: string, atipIds: string[]): AtipViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isAtip: listing ? isListingAtipOverlay(listing.id, atipIds) : false,
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
}: AtipPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const atipIds = parseAtipListingIds(jar.get(ATIP_COOKIE_NAME)?.value);
  const sheet = atipSheetForId(id, atipIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: ATIP_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape an atip note on.",
      path: listingAtipPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: ATIP_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take an atip note."
          : sheet.kind === "pack"
            ? "A sample pack does not take an atip note. Atip honesty is for the burned disc."
            : sheet.kind === "mixtape"
              ? "A cassette does not take an atip note. Atip honesty is for the burned disc."
              : sheet.kind === "font"
                ? "A booth font does not take an atip note. Atip honesty is for the burned disc."
                : sheet.kind === "chair"
                  ? "A chair does not take an atip note. Atip honesty is for the burned disc."
                  : sheet.kind === "owned"
                    ? "An atip note is for BEATS 07. Another overlay already owns that listing."
                    : "A file does not take an atip note. An atip note is for the burned disc on the table.",
      path: listingAtipPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not atip it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not atip it. Still Sharpie. Still a jewel case. Still tote. Not pregap. Not encode. Not stamper.`,
    path: listingAtipPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingAtipPage({ params }: AtipPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const atipIds = parseAtipListingIds(jar.get(ATIP_COOKIE_NAME)?.value);
  const sheet = atipSheetForId(id, atipIds);

  return <ListingAtipView sheet={sheet} atipIds={atipIds} />;
}
