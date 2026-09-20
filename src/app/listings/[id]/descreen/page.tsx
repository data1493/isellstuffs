import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingDescreenView,
  type DescreenViewKind,
  type DescreenViewSheet,
} from "@/components/listing-descreen-view";
import {
  formatMoney,
  isDigitalListing,
  isGiftListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  DESCREEN_COOKIE_NAME,
  DESCREEN_REFUSE_COPY,
  canTapeDescreen,
  isListingDescreenOverlay,
  parseDescreenListingIds,
} from "@/lib/listing-descreen";
import { listingDescreenPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type DescreenPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): DescreenViewKind {
  if (!listing) {
    return "missing";
  }
  if (isGiftListing(listing)) {
    return "gift";
  }
  if (isDigitalListing(listing)) {
    if (listing.status === "file-gone") {
      return "file-gone";
    }
    if (!canTapeDescreen(listing)) {
      return "owned";
    }
    return "digital";
  }
  if (listing.status === "sold") {
    return "sold";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  return "physical";
}

function descreenSheetForId(id: string, descreenIds: string[]): DescreenViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isDescreen: listing ? isListingDescreenOverlay(listing.id, descreenIds) : false,
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
}: DescreenPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const descreenIds = parseDescreenListingIds(jar.get(DESCREEN_COOKIE_NAME)?.value);
  const sheet = descreenSheetForId(id, descreenIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: DESCREEN_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a descreen note on.",
      path: listingDescreenPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "digital") {
    return shareMetadata({
      title: DESCREEN_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a descreen note."
          : sheet.kind === "owned"
            ? "A descreen note is for the stained recipe cards. Another overlay already owns that listing."
            : "A whisk does not take a descreen note. A descreen note is for three recipe cards.",
      path: listingDescreenPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not descreen them · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not descreen them. Still three cards. Still grease. Still tote. Not gang. Not crop. Not a shop. Not emboss. Pull the print dots, not a login.`,
    path: listingDescreenPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingDescreenPage({ params }: DescreenPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const descreenIds = parseDescreenListingIds(jar.get(DESCREEN_COOKIE_NAME)?.value);
  const sheet = descreenSheetForId(id, descreenIds);

  return <ListingDescreenView sheet={sheet} descreenIds={descreenIds} />;
}
