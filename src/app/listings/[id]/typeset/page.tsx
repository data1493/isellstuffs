import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingTypesetView,
  type TypesetViewKind,
  type TypesetViewSheet,
} from "@/components/listing-typeset-view";
import {
  formatMoney,
  isDigitalListing,
  isGiftListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  TYPESET_COOKIE_NAME,
  TYPESET_REFUSE_COPY,
  isListingTypesetOverlay,
  parseTypesetListingIds,
} from "@/lib/listing-typeset";
import { listingTypesetPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type TypesetPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): TypesetViewKind {
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

function typesetSheetForId(id: string, typesetIds: string[]): TypesetViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isTypeset: listing ? isListingTypesetOverlay(listing.id, typesetIds) : false,
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
}: TypesetPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const typesetIds = parseTypesetListingIds(jar.get(TYPESET_COOKIE_NAME)?.value);
  const sheet = typesetSheetForId(id, typesetIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: TYPESET_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a typeset on.",
      path: listingTypesetPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "digital") {
    return shareMetadata({
      title: TYPESET_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code is not a page."
          : "A lamp is not a page. Typeset honesty is for a file on the digital lot.",
      path: listingTypesetPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not typeset · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. Written on a folding table. Workbook is no sequel. Foundry is two weights. Still tote. Not a Canva desk.`,
    path: listingTypesetPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingTypesetPage({ params }: TypesetPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const typesetIds = parseTypesetListingIds(jar.get(TYPESET_COOKIE_NAME)?.value);
  const sheet = typesetSheetForId(id, typesetIds);

  return <ListingTypesetView sheet={sheet} typesetIds={typesetIds} />;
}
