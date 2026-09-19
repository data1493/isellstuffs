import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingCasesView,
  type CasesViewKind,
  type CasesViewSheet,
} from "@/components/listing-cases-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  CASES_COOKIE_NAME,
  CASES_REFUSE_COPY,
  isListingCasesOverlay,
  parseCasesListingIds,
} from "@/lib/listing-cases";
import { listingCasesPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type CasesPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): CasesViewKind {
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
    return "sold";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  return "physical";
}

function casesSheetForId(id: string, casesIds: string[]): CasesViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isCases: listing ? isListingCasesOverlay(listing.id, casesIds) : false,
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
}: CasesPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const casesIds = parseCasesListingIds(jar.get(CASES_COOKIE_NAME)?.value);
  const sheet = casesSheetForId(id, casesIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: CASES_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape an empty case on.",
      path: listingCasesPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: CASES_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code is not a jewel case."
          : "A file is not a jewel case. Empty case is for a disc on the table.",
      path: listingCasesPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `The discs walked · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. Jewel case on the table. The discs walked. Still tote. Not plays. Not wrap.`,
    path: listingCasesPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingCasesPage({ params }: CasesPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const casesIds = parseCasesListingIds(jar.get(CASES_COOKIE_NAME)?.value);
  const sheet = casesSheetForId(id, casesIds);

  return <ListingCasesView sheet={sheet} casesIds={casesIds} />;
}
