import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingNormView,
  type NormViewKind,
  type NormViewSheet,
} from "@/components/listing-norm-view";
import {
  formatMoney,
  isDigitalListing,
  isGiftListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  NORM_COOKIE_NAME,
  NORM_REFUSE_COPY,
  isListingNormOverlay,
  parseNormListingIds,
} from "@/lib/listing-norm";
import { listingNormPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type NormPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): NormViewKind {
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

function normSheetForId(id: string, normIds: string[]): NormViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isNorm: listing ? isListingNormOverlay(listing.id, normIds) : false,
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
}: NormPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const normIds = parseNormListingIds(jar.get(NORM_COOKIE_NAME)?.value);
  const sheet = normSheetForId(id, normIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: NORM_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a normalize note on.",
      path: listingNormPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "digital") {
    return shareMetadata({
      title: NORM_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code is not a normalize note."
          : "A lamp is not a normalized pack. Normalize honesty is for a file on the digital lot.",
      path: listingNormPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not normalize · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. As recorded. Walkers still want the kicks the same loud. Still tote. Not a mix desk.`,
    path: listingNormPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingNormPage({ params }: NormPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const normIds = parseNormListingIds(jar.get(NORM_COOKIE_NAME)?.value);
  const sheet = normSheetForId(id, normIds);

  return <ListingNormView sheet={sheet} normIds={normIds} />;
}
