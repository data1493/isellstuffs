import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingMistrackView,
  type MistrackViewKind,
  type MistrackViewSheet,
} from "@/components/listing-mistrack-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  MISTRACK_CHAIR_ID,
  MISTRACK_COOKIE_NAME,
  MISTRACK_JEWELS_ID,
  MISTRACK_MIXTAPE_ID,
  MISTRACK_REFUSE_COPY,
  canTapeMistrack,
  isListingMistrackOverlay,
  parseMistrackListingIds,
} from "@/lib/listing-mistrack";
import { listingMistrackPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type MistrackPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): MistrackViewKind {
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
    return listing.id === MISTRACK_CHAIR_ID ? "chair" : "sold";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.id === MISTRACK_CHAIR_ID) {
    return "chair";
  }
  if (listing.id === MISTRACK_MIXTAPE_ID) {
    return "mixtape";
  }
  if (listing.id === MISTRACK_JEWELS_ID) {
    return "jewels";
  }
  if (!canTapeMistrack(listing)) {
    return "owned";
  }
  return "physical";
}

function mistrackSheetForId(id: string, mistrackIds: string[]): MistrackViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isMistrack: listing ? isListingMistrackOverlay(listing.id, mistrackIds) : false,
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
}: MistrackPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const mistrackIds = parseMistrackListingIds(jar.get(MISTRACK_COOKIE_NAME)?.value);
  const sheet = mistrackSheetForId(id, mistrackIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: MISTRACK_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a mistrack note on.",
      path: listingMistrackPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: MISTRACK_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a mistrack note."
          : sheet.kind === "mixtape"
            ? "A mixtape does not take a mistrack note. Mistrack honesty is for the unnamed LP."
            : sheet.kind === "jewels"
              ? "Empty jewels do not take a mistrack note. Mistrack honesty is for the unnamed LP."
              : sheet.kind === "chair"
                ? "A chair does not take a mistrack note. Mistrack honesty is for the unnamed LP."
                : sheet.kind === "owned"
                  ? "A mistrack note is for the unnamed LP. Another overlay already owns that listing."
                  : "A file does not take a mistrack note. A mistrack note is for the LP on the table.",
      path: listingMistrackPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not mistrack it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not mistrack it. Still a skip. Still unnamed. Still tote. Not rake. Not resonance. Not vacuum.`,
    path: listingMistrackPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingMistrackPage({ params }: MistrackPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const mistrackIds = parseMistrackListingIds(jar.get(MISTRACK_COOKIE_NAME)?.value);
  const sheet = mistrackSheetForId(id, mistrackIds);

  return <ListingMistrackView sheet={sheet} mistrackIds={mistrackIds} />;
}
