import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingRumbleView,
  type RumbleViewKind,
  type RumbleViewSheet,
} from "@/components/listing-rumble-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  RUMBLE_CHAIR_ID,
  RUMBLE_COOKIE_NAME,
  RUMBLE_JEWELS_ID,
  RUMBLE_MIXTAPE_ID,
  RUMBLE_REFUSE_COPY,
  canTapeRumble,
  isListingRumbleOverlay,
  parseRumbleListingIds,
} from "@/lib/listing-rumble";
import { listingRumblePath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type RumblePageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): RumbleViewKind {
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
    return listing.id === RUMBLE_CHAIR_ID ? "chair" : "sold";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.id === RUMBLE_CHAIR_ID) {
    return "chair";
  }
  if (listing.id === RUMBLE_MIXTAPE_ID) {
    return "mixtape";
  }
  if (listing.id === RUMBLE_JEWELS_ID) {
    return "jewels";
  }
  if (!canTapeRumble(listing)) {
    return "owned";
  }
  return "physical";
}

function rumbleSheetForId(id: string, rumbleIds: string[]): RumbleViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isRumble: listing ? isListingRumbleOverlay(listing.id, rumbleIds) : false,
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
}: RumblePageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const rumbleIds = parseRumbleListingIds(jar.get(RUMBLE_COOKIE_NAME)?.value);
  const sheet = rumbleSheetForId(id, rumbleIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: RUMBLE_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a rumble note on.",
      path: listingRumblePath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: RUMBLE_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a rumble note."
          : sheet.kind === "mixtape"
            ? "A mixtape does not take a rumble note. Rumble honesty is for the unnamed LP."
            : sheet.kind === "jewels"
              ? "Empty jewels do not take a rumble note. Rumble honesty is for the unnamed LP."
              : sheet.kind === "chair"
                ? "A chair does not take a rumble note. Rumble honesty is for the unnamed LP."
                : sheet.kind === "owned"
                  ? "A rumble note is for the unnamed LP. Another overlay already owns that listing."
                  : "A file does not take a rumble note. A rumble note is for the LP on the table.",
      path: listingRumblePath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not rumble it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not rumble it. Still unnamed. Still a skip. Still tote. Not vta. Not riaa. Not vacuum.`,
    path: listingRumblePath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingRumblePage({ params }: RumblePageProps) {
  const { id } = await params;
  const jar = await cookies();
  const rumbleIds = parseRumbleListingIds(jar.get(RUMBLE_COOKIE_NAME)?.value);
  const sheet = rumbleSheetForId(id, rumbleIds);

  return <ListingRumbleView sheet={sheet} rumbleIds={rumbleIds} />;
}
