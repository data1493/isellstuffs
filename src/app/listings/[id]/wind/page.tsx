import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingWindView,
  type WindViewKind,
  type WindViewSheet,
} from "@/components/listing-wind-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  WIND_COOKIE_NAME,
  WIND_REFUSE_COPY,
  isListingWindOverlay,
  parseWindListingIds,
} from "@/lib/listing-wind";
import { listingWindPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type WindPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): WindViewKind {
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

function windSheetForId(id: string, windIds: string[]): WindViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isWind: listing ? isListingWindOverlay(listing.id, windIds) : false,
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
}: WindPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const windIds = parseWindListingIds(jar.get(WIND_COOKIE_NAME)?.value);
  const sheet = windSheetForId(id, windIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: WIND_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a wind note on.",
      path: listingWindPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: WIND_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a wind note."
          : "A liner PDF does not take a wind. A wind note is for cassettes on the table.",
      path: listingWindPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not wind it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not wind it. Still hiss. Still a radio edit. Still tote. Not hiss. Not a deck. Not radio.`,
    path: listingWindPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingWindPage({ params }: WindPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const windIds = parseWindListingIds(jar.get(WIND_COOKIE_NAME)?.value);
  const sheet = windSheetForId(id, windIds);

  return <ListingWindView sheet={sheet} windIds={windIds} />;
}
