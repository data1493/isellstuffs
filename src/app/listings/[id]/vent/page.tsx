import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingVentView,
  type VentViewKind,
  type VentViewSheet,
} from "@/components/listing-vent-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  VENT_COOKIE_NAME,
  VENT_REFUSE_COPY,
  isListingVentOverlay,
  parseVentListingIds,
} from "@/lib/listing-vent";
import { listingVentPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type VentPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): VentViewKind {
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

function ventSheetForId(id: string, ventIds: string[]): VentViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isVent: listing ? isListingVentOverlay(listing.id, ventIds) : false,
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
}: VentPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const ventIds = parseVentListingIds(jar.get(VENT_COOKIE_NAME)?.value);
  const sheet = ventSheetForId(id, ventIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: VENT_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a vent note on.",
      path: listingVentPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: VENT_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a vent note."
          : "A file does not take a vent note. A vent note is for a lid on the table.",
      path: listingVentPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not vent · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not vent. Solid glass. Still a lid. Still tote. Still for sale.`,
    path: listingVentPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingVentPage({ params }: VentPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const ventIds = parseVentListingIds(jar.get(VENT_COOKIE_NAME)?.value);
  const sheet = ventSheetForId(id, ventIds);

  return <ListingVentView sheet={sheet} ventIds={ventIds} />;
}
