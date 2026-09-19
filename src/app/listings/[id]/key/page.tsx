import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingKeyView,
  type KeyViewKind,
  type KeyViewSheet,
} from "@/components/listing-key-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  KEY_COOKIE_NAME,
  KEY_REFUSE_COPY,
  isListingKeyOverlay,
  parseKeyListingIds,
} from "@/lib/listing-key";
import { listingKeyPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type KeyPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): KeyViewKind {
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

function keySheetForId(id: string, keyIds: string[]): KeyViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isKey: listing ? isListingKeyOverlay(listing.id, keyIds) : false,
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
}: KeyPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const keyIds = parseKeyListingIds(jar.get(KEY_COOKIE_NAME)?.value);
  const sheet = keySheetForId(id, keyIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: KEY_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a key on.",
      path: listingKeyPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: KEY_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a key."
          : "A file does not take a key. Key honesty is for a cabinet or case on the table.",
      path: listingKeyPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `The key walked · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. The key is not in the box. Still tote. Remote is the clicker. Strap is the bag strap. Not remote. Not lost.`,
    path: listingKeyPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingKeyPage({ params }: KeyPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const keyIds = parseKeyListingIds(jar.get(KEY_COOKIE_NAME)?.value);
  const sheet = keySheetForId(id, keyIds);

  return <ListingKeyView sheet={sheet} keyIds={keyIds} />;
}
