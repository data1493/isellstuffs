import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingVacuumView,
  type VacuumViewKind,
  type VacuumViewSheet,
} from "@/components/listing-vacuum-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  VACUUM_CHAIR_ID,
  VACUUM_COOKIE_NAME,
  VACUUM_JEWELS_ID,
  VACUUM_MIXTAPE_ID,
  VACUUM_REFUSE_COPY,
  canTapeVacuum,
  isListingVacuumOverlay,
  parseVacuumListingIds,
} from "@/lib/listing-vacuum";
import { listingVacuumPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type VacuumPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): VacuumViewKind {
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
    return listing.id === VACUUM_CHAIR_ID ? "chair" : "sold";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.id === VACUUM_CHAIR_ID) {
    return "chair";
  }
  if (listing.id === VACUUM_MIXTAPE_ID) {
    return "mixtape";
  }
  if (listing.id === VACUUM_JEWELS_ID) {
    return "jewels";
  }
  if (!canTapeVacuum(listing)) {
    return "owned";
  }
  return "physical";
}

function vacuumSheetForId(
  id: string,
  vacuumIds: string[],
): VacuumViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isVacuum: listing
      ? isListingVacuumOverlay(listing.id, vacuumIds)
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
}: VacuumPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const vacuumIds = parseVacuumListingIds(
    jar.get(VACUUM_COOKIE_NAME)?.value,
  );
  const sheet = vacuumSheetForId(id, vacuumIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: VACUUM_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a vacuum note on.",
      path: listingVacuumPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: VACUUM_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a vacuum note."
          : sheet.kind === "mixtape"
            ? "A mixtape does not take a vacuum note. Vacuum is an LP skip."
            : sheet.kind === "jewels"
              ? "Empty jewel cases do not take a vacuum note. Vacuum is an LP skip."
              : sheet.kind === "chair"
                ? "A chair does not take a vacuum note. Vacuum is an LP skip."
                : sheet.kind === "owned"
                  ? "A vacuum note is for the unnamed LP. Another overlay already owns that listing."
                  : "A file does not take a vacuum note. A vacuum note is for the LP on the table.",
      path: listingVacuumPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not vacuum it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not vacuum it. Still a skip. Still a grocery bag. Still tote. Not hone. Not antistat. Not rinse.`,
    path: listingVacuumPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingVacuumPage({
  params,
}: VacuumPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const vacuumIds = parseVacuumListingIds(
    jar.get(VACUUM_COOKIE_NAME)?.value,
  );
  const sheet = vacuumSheetForId(id, vacuumIds);

  return <ListingVacuumView sheet={sheet} vacuumIds={vacuumIds} />;
}
