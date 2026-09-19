import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingHoneView,
  type HoneViewKind,
  type HoneViewSheet,
} from "@/components/listing-hone-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import {
  HONE_CHAIR_ID,
  HONE_COOKIE_NAME,
  HONE_JEWELS_ID,
  HONE_MIXTAPE_ID,
  HONE_MUG_ID,
  HONE_REFUSE_COPY,
  canTapeHone,
  isListingHoneOverlay,
  parseHoneListingIds,
} from "@/lib/listing-hone";
import { listingHubName } from "@/lib/listing-display";
import { listingHonePath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type HonePageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): HoneViewKind {
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
    return listing.id === HONE_CHAIR_ID ? "chair" : "sold";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.id === HONE_CHAIR_ID) {
    return "chair";
  }
  if (listing.id === HONE_MIXTAPE_ID) {
    return "mixtape";
  }
  if (listing.id === HONE_MUG_ID) {
    return "mug";
  }
  if (listing.id === HONE_JEWELS_ID) {
    return "jewels";
  }
  if (!canTapeHone(listing)) {
    return "owned";
  }
  return "physical";
}

function honeSheetForId(id: string, honeIds: string[]): HoneViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isHone: listing ? isListingHoneOverlay(listing.id, honeIds) : false,
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
}: HonePageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const honeIds = parseHoneListingIds(jar.get(HONE_COOKIE_NAME)?.value);
  const sheet = honeSheetForId(id, honeIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: HONE_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a hone note on.",
      path: listingHonePath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: HONE_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a hone note."
          : sheet.kind === "mixtape"
            ? "A mixtape does not take a hone note. Hone is an LP groove."
            : sheet.kind === "mug"
              ? "A mug does not take a hone note. Hone is an LP groove."
              : sheet.kind === "jewels"
                ? "Empty jewel cases do not take a hone note. Hone is an LP groove."
                : sheet.kind === "chair"
                  ? "A chair does not take a hone note. Hone is an LP groove."
                  : sheet.kind === "owned"
                    ? "A hone note is for the unnamed LP. Another overlay already owns that listing."
                    : "A file does not take a hone note. A hone note is for the LP on the table.",
      path: listingHonePath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not hone it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not hone it. Still skips. Still unnamed. Still tote. Not puck. Not polish. Not skip.`,
    path: listingHonePath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingHonePage({ params }: HonePageProps) {
  const { id } = await params;
  const jar = await cookies();
  const honeIds = parseHoneListingIds(jar.get(HONE_COOKIE_NAME)?.value);
  const sheet = honeSheetForId(id, honeIds);

  return <ListingHoneView sheet={sheet} honeIds={honeIds} />;
}
