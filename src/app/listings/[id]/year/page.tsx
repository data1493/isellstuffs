import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingYearView,
  type YearViewKind,
  type YearViewSheet,
} from "@/components/listing-year-view";
import {
  formatMoney,
  isDigitalListing,
  isGiftListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  YEAR_COOKIE_NAME,
  YEAR_REFUSE_COPY,
  isListingYearOverlay,
  parseYearListingIds,
} from "@/lib/listing-year";
import { listingYearPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type YearPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): YearViewKind {
  if (!listing) {
    return "missing";
  }
  if (isGiftListing(listing)) {
    return "gift";
  }
  if (isDigitalListing(listing)) {
    return listing.status === "file-gone" ? "file-gone" : "digital";
  }
  if (listing.status === "sold") {
    return "sold";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  return "physical";
}

function yearSheetForId(id: string, yearIds: string[]): YearViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isYear: listing ? isListingYearOverlay(listing.id, yearIds) : false,
    title: listing?.title ?? null,
    priceLabel: listing ? formatMoney(listing.price) : null,
    fact: listing
      ? isDigitalListing(listing)
        ? listing.fileFormat
        : listing.condition
      : null,
    stallName: stall?.boothName ?? listing?.stallId ?? null,
    stallSlug: stall?.slug ?? null,
    hubName: listing ? listingHubName(listing) : null,
    listing: listing ?? null,
  };
}

export async function generateMetadata({
  params,
}: YearPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const yearIds = parseYearListingIds(jar.get(YEAR_COOKIE_NAME)?.value);
  const sheet = yearSheetForId(id, yearIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: YEAR_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a year note on.",
      path: listingYearPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "digital") {
    return shareMetadata({
      title: YEAR_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code is not a year note."
          : "An LP is not a liner year. Year honesty is for a file on the digital lot.",
      path: listingYearPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not date it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. Summer-ish. Still a page. Walkers still want a year. Still tote.`,
    path: listingYearPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingYearPage({ params }: YearPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const yearIds = parseYearListingIds(jar.get(YEAR_COOKIE_NAME)?.value);
  const sheet = yearSheetForId(id, yearIds);

  return <ListingYearView sheet={sheet} yearIds={yearIds} />;
}
