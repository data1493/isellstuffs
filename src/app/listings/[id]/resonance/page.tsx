import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingResonanceView,
  type ResonanceViewKind,
  type ResonanceViewSheet,
} from "@/components/listing-resonance-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  RESONANCE_CHAIR_ID,
  RESONANCE_COOKIE_NAME,
  RESONANCE_JEWELS_ID,
  RESONANCE_MIXTAPE_ID,
  RESONANCE_REFUSE_COPY,
  canTapeResonance,
  isListingResonanceOverlay,
  parseResonanceListingIds,
} from "@/lib/listing-resonance";
import { listingResonancePath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type ResonancePageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): ResonanceViewKind {
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
    return listing.id === RESONANCE_CHAIR_ID ? "chair" : "sold";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.id === RESONANCE_CHAIR_ID) {
    return "chair";
  }
  if (listing.id === RESONANCE_MIXTAPE_ID) {
    return "mixtape";
  }
  if (listing.id === RESONANCE_JEWELS_ID) {
    return "jewels";
  }
  if (!canTapeResonance(listing)) {
    return "owned";
  }
  return "physical";
}

function resonanceSheetForId(
  id: string,
  resonanceIds: string[],
): ResonanceViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isResonance: listing
      ? isListingResonanceOverlay(listing.id, resonanceIds)
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
}: ResonancePageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const resonanceIds = parseResonanceListingIds(
    jar.get(RESONANCE_COOKIE_NAME)?.value,
  );
  const sheet = resonanceSheetForId(id, resonanceIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: RESONANCE_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a resonance note on.",
      path: listingResonancePath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: RESONANCE_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a resonance note."
          : sheet.kind === "mixtape"
            ? "A mixtape does not take a resonance note. Resonance honesty is for the unnamed LP."
            : sheet.kind === "jewels"
              ? "Empty jewels do not take a resonance note. Resonance honesty is for the unnamed LP."
              : sheet.kind === "chair"
                ? "A chair does not take a resonance note. Resonance honesty is for the unnamed LP."
                : sheet.kind === "owned"
                  ? "A resonance note is for the unnamed LP. Another overlay already owns that listing."
                  : "A file does not take a resonance note. A resonance note is for the LP on the table.",
      path: listingResonancePath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not resonance it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not resonance it. Still a skip. Still unnamed. Still tote. Not pivot. Not dashpot. Not vacuum.`,
    path: listingResonancePath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingResonancePage({
  params,
}: ResonancePageProps) {
  const { id } = await params;
  const jar = await cookies();
  const resonanceIds = parseResonanceListingIds(
    jar.get(RESONANCE_COOKIE_NAME)?.value,
  );
  const sheet = resonanceSheetForId(id, resonanceIds);

  return <ListingResonanceView sheet={sheet} resonanceIds={resonanceIds} />;
}
