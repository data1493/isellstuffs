import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingTumbleView,
  type TumbleViewKind,
  type TumbleViewSheet,
} from "@/components/listing-tumble-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  TUMBLE_CHAIR_ID,
  TUMBLE_COOKIE_NAME,
  TUMBLE_LINER_ID,
  TUMBLE_REFUSE_COPY,
  canTapeTumble,
  isListingTumbleOverlay,
  parseTumbleListingIds,
} from "@/lib/listing-tumble";
import { listingTumblePath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type TumblePageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): TumbleViewKind {
  if (!listing) {
    return "missing";
  }
  if (isGiftListing(listing)) {
    return "gift";
  }
  if (!isPhysicalListing(listing)) {
    if (listing.id === TUMBLE_LINER_ID) {
      return "liner";
    }
    return listing.status === "file-gone" ? "file-gone" : "digital";
  }
  if (listing.status === "sold") {
    return listing.id === TUMBLE_CHAIR_ID ? "chair" : "sold";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.id === TUMBLE_CHAIR_ID) {
    return "chair";
  }
  if (!canTapeTumble(listing)) {
    return "owned";
  }
  return "physical";
}

function tumbleSheetForId(id: string, tumbleIds: string[]): TumbleViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isTumble: listing ? isListingTumbleOverlay(listing.id, tumbleIds) : false,
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
}: TumblePageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const tumbleIds = parseTumbleListingIds(jar.get(TUMBLE_COOKIE_NAME)?.value);
  const sheet = tumbleSheetForId(id, tumbleIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: TUMBLE_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a tumble note on.",
      path: listingTumblePath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: TUMBLE_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a tumble note."
          : sheet.kind === "liner"
            ? "A liner PDF does not take a tumble note. Tumble is empty jewels."
            : sheet.kind === "chair"
              ? "A chair does not take a tumble note. Tumble is empty jewels."
              : sheet.kind === "owned"
                ? "A tumble note is for the empty jewel stack. Another overlay already owns that listing."
                : "A file does not take a tumble note. A tumble note is for empty jewels on the table.",
      path: listingTumblePath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not tumble them · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not tumble them. Still empty. Still cracked. Still tote. Not foam. Not nest. Not flock.`,
    path: listingTumblePath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingTumblePage({ params }: TumblePageProps) {
  const { id } = await params;
  const jar = await cookies();
  const tumbleIds = parseTumbleListingIds(jar.get(TUMBLE_COOKIE_NAME)?.value);
  const sheet = tumbleSheetForId(id, tumbleIds);

  return <ListingTumbleView sheet={sheet} tumbleIds={tumbleIds} />;
}
