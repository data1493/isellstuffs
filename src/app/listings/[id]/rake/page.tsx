import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingRakeView,
  type RakeViewKind,
  type RakeViewSheet,
} from "@/components/listing-rake-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  RAKE_CHAIR_ID,
  RAKE_COOKIE_NAME,
  RAKE_JEWELS_ID,
  RAKE_MIXTAPE_ID,
  RAKE_REFUSE_COPY,
  canTapeRake,
  isListingRakeOverlay,
  parseRakeListingIds,
} from "@/lib/listing-rake";
import { listingRakePath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type RakePageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): RakeViewKind {
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
    return listing.id === RAKE_CHAIR_ID ? "chair" : "sold";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.id === RAKE_CHAIR_ID) {
    return "chair";
  }
  if (listing.id === RAKE_MIXTAPE_ID) {
    return "mixtape";
  }
  if (listing.id === RAKE_JEWELS_ID) {
    return "jewels";
  }
  if (!canTapeRake(listing)) {
    return "owned";
  }
  return "physical";
}

function rakeSheetForId(id: string, rakeIds: string[]): RakeViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isRake: listing ? isListingRakeOverlay(listing.id, rakeIds) : false,
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
}: RakePageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const rakeIds = parseRakeListingIds(jar.get(RAKE_COOKIE_NAME)?.value);
  const sheet = rakeSheetForId(id, rakeIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: RAKE_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a rake note on.",
      path: listingRakePath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: RAKE_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a rake note."
          : sheet.kind === "mixtape"
            ? "A mixtape does not take a rake note. Rake honesty is for the unnamed LP."
            : sheet.kind === "jewels"
              ? "Empty jewels do not take a rake note. Rake honesty is for the unnamed LP."
              : sheet.kind === "chair"
                ? "A chair does not take a rake note. Rake honesty is for the unnamed LP."
                : sheet.kind === "owned"
                  ? "A rake note is for the unnamed LP. Another overlay already owns that listing."
                  : "A file does not take a rake note. A rake note is for the LP on the table.",
      path: listingRakePath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not rake it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not rake it. Still a skip. Still unnamed. Still tote. Not resonance. Not pivot. Not vacuum.`,
    path: listingRakePath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingRakePage({ params }: RakePageProps) {
  const { id } = await params;
  const jar = await cookies();
  const rakeIds = parseRakeListingIds(jar.get(RAKE_COOKIE_NAME)?.value);
  const sheet = rakeSheetForId(id, rakeIds);

  return <ListingRakeView sheet={sheet} rakeIds={rakeIds} />;
}
