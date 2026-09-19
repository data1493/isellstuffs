import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingRememberView,
  type RememberViewKind,
  type RememberViewSheet,
} from "@/components/listing-remember-view";
import {
  formatMoney,
  isDigitalListing,
  isGiftListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  REMEMBER_COOKIE_NAME,
  REMEMBER_REFUSE_COPY,
  isListingRememberOverlay,
  parseRememberListingIds,
} from "@/lib/listing-remember";
import { listingRememberPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type RememberPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): RememberViewKind {
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

function rememberSheetForId(
  id: string,
  rememberIds: string[],
): RememberViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isRemember: listing
      ? isListingRememberOverlay(listing.id, rememberIds)
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
}: RememberPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const rememberIds = parseRememberListingIds(
    jar.get(REMEMBER_COOKIE_NAME)?.value,
  );
  const sheet = rememberSheetForId(id, rememberIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: REMEMBER_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a remember on.",
      path: listingRememberPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "digital") {
    return shareMetadata({
      title: REMEMBER_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code is not a memory page."
          : "An LP is not a memory page. Remember honesty is for a file on the digital lot.",
      path: listingRememberPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not remember better · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. What we remember is the page. Wrong is the liner. Songs is no titles. Still tote. Not a liner shop.`,
    path: listingRememberPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingRememberPage({
  params,
}: RememberPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const rememberIds = parseRememberListingIds(
    jar.get(REMEMBER_COOKIE_NAME)?.value,
  );
  const sheet = rememberSheetForId(id, rememberIds);

  return <ListingRememberView sheet={sheet} rememberIds={rememberIds} />;
}
