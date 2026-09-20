import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingScrapeView,
  type ScrapeViewKind,
  type ScrapeViewSheet,
} from "@/components/listing-scrape-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  SCRAPE_CHAIR_ID,
  SCRAPE_COOKIE_NAME,
  SCRAPE_JEWELS_ID,
  SCRAPE_MIXTAPE_ID,
  SCRAPE_REFUSE_COPY,
  canTapeScrape,
  isListingScrapeOverlay,
  parseScrapeListingIds,
} from "@/lib/listing-scrape";
import { listingScrapePath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type ScrapePageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): ScrapeViewKind {
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
    return listing.id === SCRAPE_CHAIR_ID ? "chair" : "sold";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.id === SCRAPE_CHAIR_ID) {
    return "chair";
  }
  if (listing.id === SCRAPE_MIXTAPE_ID) {
    return "mixtape";
  }
  if (listing.id === SCRAPE_JEWELS_ID) {
    return "jewels";
  }
  if (!canTapeScrape(listing)) {
    return "owned";
  }
  return "physical";
}

function scrapeSheetForId(
  id: string,
  scrapeIds: string[],
): ScrapeViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isScrape: listing
      ? isListingScrapeOverlay(listing.id, scrapeIds)
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
}: ScrapePageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const scrapeIds = parseScrapeListingIds(
    jar.get(SCRAPE_COOKIE_NAME)?.value,
  );
  const sheet = scrapeSheetForId(id, scrapeIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: SCRAPE_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a scrape note on.",
      path: listingScrapePath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: SCRAPE_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a scrape note."
          : sheet.kind === "mixtape"
            ? "A mixtape does not take a scrape note. Scrape is an LP scratch."
            : sheet.kind === "jewels"
              ? "Empty jewel cases do not take a scrape note. Scrape is an LP scratch."
              : sheet.kind === "chair"
                ? "A chair does not take a scrape note. Scrape is an LP scratch."
                : sheet.kind === "owned"
                  ? "A scrape note is for the unnamed LP. Another overlay already owns that listing."
                  : "A file does not take a scrape note. A scrape note is for the LP on the table.",
      path: listingScrapePath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not scrape it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not scrape it. Still a scratch. Still a skip. Still tote. Not rinse. Not hone. Not antistat.`,
    path: listingScrapePath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingScrapePage({
  params,
}: ScrapePageProps) {
  const { id } = await params;
  const jar = await cookies();
  const scrapeIds = parseScrapeListingIds(
    jar.get(SCRAPE_COOKIE_NAME)?.value,
  );
  const sheet = scrapeSheetForId(id, scrapeIds);

  return <ListingScrapeView sheet={sheet} scrapeIds={scrapeIds} />;
}
