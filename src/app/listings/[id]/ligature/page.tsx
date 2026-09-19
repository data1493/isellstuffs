import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingLigatureView,
  type LigatureViewKind,
  type LigatureViewSheet,
} from "@/components/listing-ligature-view";
import {
  formatMoney,
  isDigitalListing,
  isGiftListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  LIGATURE_COOKIE_NAME,
  LIGATURE_REFUSE_COPY,
  isListingLigatureOverlay,
  parseLigatureListingIds,
} from "@/lib/listing-ligature";
import { listingLigaturePath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type LigaturePageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): LigatureViewKind {
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

function ligatureSheetForId(
  id: string,
  ligatureIds: string[],
): LigatureViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isLigature: listing
      ? isListingLigatureOverlay(listing.id, ligatureIds)
      : false,
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
}: LigaturePageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const ligatureIds = parseLigatureListingIds(
    jar.get(LIGATURE_COOKIE_NAME)?.value,
  );
  const sheet = ligatureSheetForId(id, ligatureIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: LIGATURE_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a ligature note on.",
      path: listingLigaturePath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "digital") {
    return shareMetadata({
      title: LIGATURE_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a ligature note."
          : "A Game Boy does not take a ligature note. Ligature honesty is for the booth font.",
      path: listingLigaturePath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not ligature it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not ligature it. Still two weights. Still a food court. Still tote. Not foundry. Not slant. Not bold.`,
    path: listingLigaturePath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingLigaturePage({
  params,
}: LigaturePageProps) {
  const { id } = await params;
  const jar = await cookies();
  const ligatureIds = parseLigatureListingIds(
    jar.get(LIGATURE_COOKIE_NAME)?.value,
  );
  const sheet = ligatureSheetForId(id, ligatureIds);

  return <ListingLigatureView sheet={sheet} ligatureIds={ligatureIds} />;
}
