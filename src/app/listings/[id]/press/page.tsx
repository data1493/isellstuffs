import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingPressView,
  type PressViewKind,
  type PressViewSheet,
} from "@/components/listing-press-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  PRESS_COOKIE_NAME,
  PRESS_REFUSE_COPY,
  listingPressFor,
  parseListingPress,
} from "@/lib/listing-press";
import { listingPressPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type PressPageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ error?: string | string[] }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): PressViewKind {
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

function pressSheetForId(
  id: string,
  map: ReturnType<typeof parseListingPress>,
): PressViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    current: listing ? listingPressFor(listing.id, map) : undefined,
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
}: PressPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const map = parseListingPress(jar.get(PRESS_COOKIE_NAME)?.value);
  const sheet = pressSheetForId(id, map);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: PRESS_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a press on.",
      path: listingPressPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: PRESS_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. Files have no press."
          : "A file has no press. Sleeve paper is for a record on the table.",
      path: listingPressPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `Which press · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. Still for sale. Not a first press. Not a scan mate.`,
    path: listingPressPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingPressPage({
  params,
  searchParams,
}: PressPageProps) {
  const { id } = await params;
  const query = searchParams ? await searchParams : {};
  const error = Array.isArray(query.error) ? query.error[0] : query.error;
  const jar = await cookies();
  const map = parseListingPress(jar.get(PRESS_COOKIE_NAME)?.value);
  const sheet = pressSheetForId(id, map);

  return (
    <ListingPressView sheet={sheet} map={map} emptyTape={error === "empty"} />
  );
}
