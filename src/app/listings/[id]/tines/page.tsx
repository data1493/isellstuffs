import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingTinesView,
  type TinesViewKind,
  type TinesViewSheet,
} from "@/components/listing-tines-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  TINES_COOKIE_NAME,
  TINES_REFUSE_COPY,
  isListingTinesOverlay,
  parseTinesListingIds,
} from "@/lib/listing-tines";
import { listingTinesPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type TinesPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): TinesViewKind {
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

function tinesSheetForId(id: string, tinesIds: string[]): TinesViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isTines: listing ? isListingTinesOverlay(listing.id, tinesIds) : false,
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
}: TinesPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const tinesIds = parseTinesListingIds(jar.get(TINES_COOKIE_NAME)?.value);
  const sheet = tinesSheetForId(id, tinesIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: TINES_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a tines refusal on.",
      path: listingTinesPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: TINES_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a tine."
          : "A recipe scan does not take a tine. A tines refusal is for a whisk on the table.",
      path: listingTinesPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not replace a tine · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. Wires splay. Still metal. I will not replace a tine. Still tote. Not a parts counter.`,
    path: listingTinesPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingTinesPage({ params }: TinesPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const tinesIds = parseTinesListingIds(jar.get(TINES_COOKIE_NAME)?.value);
  const sheet = tinesSheetForId(id, tinesIds);

  return <ListingTinesView sheet={sheet} tinesIds={tinesIds} />;
}
