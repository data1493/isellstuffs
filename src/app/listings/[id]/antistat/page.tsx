import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingAntistatView,
  type AntistatViewKind,
  type AntistatViewSheet,
} from "@/components/listing-antistat-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  ANTISTAT_CHAIR_ID,
  ANTISTAT_COOKIE_NAME,
  ANTISTAT_JEWELS_ID,
  ANTISTAT_MIXTAPE_ID,
  ANTISTAT_REFUSE_COPY,
  canTapeAntistat,
  isListingAntistatOverlay,
  parseAntistatListingIds,
} from "@/lib/listing-antistat";
import { listingAntistatPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type AntistatPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): AntistatViewKind {
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
    return listing.id === ANTISTAT_CHAIR_ID ? "chair" : "sold";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.id === ANTISTAT_CHAIR_ID) {
    return "chair";
  }
  if (listing.id === ANTISTAT_MIXTAPE_ID) {
    return "mixtape";
  }
  if (listing.id === ANTISTAT_JEWELS_ID) {
    return "jewels";
  }
  if (!canTapeAntistat(listing)) {
    return "owned";
  }
  return "physical";
}

function antistatSheetForId(
  id: string,
  antistatIds: string[],
): AntistatViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isAntistat: listing
      ? isListingAntistatOverlay(listing.id, antistatIds)
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
}: AntistatPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const antistatIds = parseAntistatListingIds(
    jar.get(ANTISTAT_COOKIE_NAME)?.value,
  );
  const sheet = antistatSheetForId(id, antistatIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: ANTISTAT_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape an antistat note on.",
      path: listingAntistatPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: ANTISTAT_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take an antistat note."
          : sheet.kind === "mixtape"
            ? "A mixtape does not take an antistat note. Antistat is an LP scratch."
            : sheet.kind === "jewels"
              ? "Empty jewel cases do not take an antistat note. Antistat is an LP scratch."
              : sheet.kind === "chair"
                ? "A chair does not take an antistat note. Antistat is an LP scratch."
                : sheet.kind === "owned"
                  ? "An antistat note is for the unnamed LP. Another overlay already owns that listing."
                  : "A file does not take an antistat note. An antistat note is for the LP on the table.",
      path: listingAntistatPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not antistat it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not antistat it. Still a scratch. Still a skip. Still tote. Not rinse. Not hone. Not dust.`,
    path: listingAntistatPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingAntistatPage({
  params,
}: AntistatPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const antistatIds = parseAntistatListingIds(
    jar.get(ANTISTAT_COOKIE_NAME)?.value,
  );
  const sheet = antistatSheetForId(id, antistatIds);

  return <ListingAntistatView sheet={sheet} antistatIds={antistatIds} />;
}
