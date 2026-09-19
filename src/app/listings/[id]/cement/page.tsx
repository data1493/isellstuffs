import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingCementView,
  type CementViewKind,
  type CementViewSheet,
} from "@/components/listing-cement-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  CEMENT_COOKIE_NAME,
  CEMENT_REFUSE_COPY,
  isListingCementOverlay,
  parseCementListingIds,
} from "@/lib/listing-cement";
import { listingCementPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type CementPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): CementViewKind {
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

function cementSheetForId(id: string, cementIds: string[]): CementViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind: kind,
    listingId: listing?.id ?? id,
    isCement: listing ? isListingCementOverlay(listing.id, cementIds) : false,
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
}: CementPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const cementIds = parseCementListingIds(jar.get(CEMENT_COOKIE_NAME)?.value);
  const sheet = cementSheetForId(id, cementIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: CEMENT_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a cement note on.",
      path: listingCementPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: CEMENT_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a cement note."
          : "A file does not take a cement note. A cement note is for a pair on the table.",
      path: listingCementPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not cement · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not cement. Peel stays. Still walks. Still tote. Not toe. Not a cobbler. Not glue.`,
    path: listingCementPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingCementPage({ params }: CementPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const cementIds = parseCementListingIds(jar.get(CEMENT_COOKIE_NAME)?.value);
  const sheet = cementSheetForId(id, cementIds);

  return <ListingCementView sheet={sheet} cementIds={cementIds} />;
}
