import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingEccentricView,
  type EccentricViewKind,
  type EccentricViewSheet,
} from "@/components/listing-eccentric-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  ECCENTRIC_CHAIR_ID,
  ECCENTRIC_COOKIE_NAME,
  ECCENTRIC_JEWELS_ID,
  ECCENTRIC_MIXTAPE_ID,
  ECCENTRIC_REFUSE_COPY,
  canTapeEccentric,
  isListingEccentricOverlay,
  parseEccentricListingIds,
} from "@/lib/listing-eccentric";
import { listingEccentricPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type EccentricPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): EccentricViewKind {
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
    return listing.id === ECCENTRIC_CHAIR_ID ? "chair" : "sold";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.id === ECCENTRIC_CHAIR_ID) {
    return "chair";
  }
  if (listing.id === ECCENTRIC_MIXTAPE_ID) {
    return "mixtape";
  }
  if (listing.id === ECCENTRIC_JEWELS_ID) {
    return "jewels";
  }
  if (!canTapeEccentric(listing)) {
    return "owned";
  }
  return "physical";
}

function eccentricSheetForId(id: string, eccentricIds: string[]): EccentricViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isEccentric: listing ? isListingEccentricOverlay(listing.id, eccentricIds) : false,
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
}: EccentricPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const eccentricIds = parseEccentricListingIds(jar.get(ECCENTRIC_COOKIE_NAME)?.value);
  const sheet = eccentricSheetForId(id, eccentricIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: ECCENTRIC_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape an eccentric note on.",
      path: listingEccentricPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: ECCENTRIC_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take an eccentric note."
          : sheet.kind === "mixtape"
            ? "A mixtape does not take an eccentric note. Eccentric honesty is for the unnamed LP."
            : sheet.kind === "jewels"
              ? "Empty jewels do not take an eccentric note. Eccentric honesty is for the unnamed LP."
              : sheet.kind === "chair"
                ? "A chair does not take an eccentric note. Eccentric honesty is for the unnamed LP."
                : sheet.kind === "owned"
                  ? "An eccentric note is for the unnamed LP. Another overlay already owns that listing."
                  : "A file does not take an eccentric note. An eccentric note is for the LP on the table.",
      path: listingEccentricPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not eccentric it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not eccentric it. Still a skip. Still unnamed. Still tote. Not mistrack. Not rake. Not vacuum.`,
    path: listingEccentricPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingEccentricPage({ params }: EccentricPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const eccentricIds = parseEccentricListingIds(jar.get(ECCENTRIC_COOKIE_NAME)?.value);
  const sheet = eccentricSheetForId(id, eccentricIds);

  return <ListingEccentricView sheet={sheet} eccentricIds={eccentricIds} />;
}
