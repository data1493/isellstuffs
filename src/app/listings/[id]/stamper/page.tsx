import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingStamperView,
  type StamperViewKind,
  type StamperViewSheet,
} from "@/components/listing-stamper-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  STAMPER_CHAIR_ID,
  STAMPER_COOKIE_NAME,
  STAMPER_FONT_ID,
  STAMPER_MIXTAPE_ID,
  STAMPER_PACK_ID,
  STAMPER_REFUSE_COPY,
  canTapeStamper,
  isListingStamperOverlay,
  parseStamperListingIds,
} from "@/lib/listing-stamper";
import { listingStamperPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type StamperPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): StamperViewKind {
  if (!listing) {
    return "missing";
  }
  if (isGiftListing(listing)) {
    return "gift";
  }
  if (listing.id === STAMPER_PACK_ID) {
    return "pack";
  }
  if (listing.id === STAMPER_FONT_ID) {
    return "font";
  }
  if (!isPhysicalListing(listing)) {
    return listing.status === "file-gone" ? "file-gone" : "digital";
  }
  if (listing.status === "sold") {
    return listing.id === STAMPER_CHAIR_ID ? "chair" : "sold";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.id === STAMPER_CHAIR_ID) {
    return "chair";
  }
  if (listing.id === STAMPER_MIXTAPE_ID) {
    return "mixtape";
  }
  if (!canTapeStamper(listing)) {
    return "owned";
  }
  return "physical";
}

function stamperSheetForId(id: string, stamperIds: string[]): StamperViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isStamper: listing ? isListingStamperOverlay(listing.id, stamperIds) : false,
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
}: StamperPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const stamperIds = parseStamperListingIds(jar.get(STAMPER_COOKIE_NAME)?.value);
  const sheet = stamperSheetForId(id, stamperIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: STAMPER_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a stamper note on.",
      path: listingStamperPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: STAMPER_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a stamper note."
          : sheet.kind === "pack"
            ? "A sample pack does not take a stamper note. Stamper honesty is for the burned disc."
            : sheet.kind === "mixtape"
              ? "A cassette does not take a stamper note. Stamper honesty is for the burned disc."
              : sheet.kind === "font"
                ? "A booth font does not take a stamper note. Stamper honesty is for the burned disc."
                : sheet.kind === "chair"
                  ? "A chair does not take a stamper note. Stamper honesty is for the burned disc."
                  : sheet.kind === "owned"
                    ? "A stamper note is for BEATS 07. Another overlay already owns that listing."
                    : "A file does not take a stamper note. A stamper note is for the burned disc on the table.",
      path: listingStamperPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not stamper it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not stamper it. Still Sharpie. Still a jewel case. Still tote. Not pregap. Not encode. Not cue.`,
    path: listingStamperPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingStamperPage({ params }: StamperPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const stamperIds = parseStamperListingIds(jar.get(STAMPER_COOKIE_NAME)?.value);
  const sheet = stamperSheetForId(id, stamperIds);

  return <ListingStamperView sheet={sheet} stamperIds={stamperIds} />;
}
