import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingHotbarView,
  type HotbarViewKind,
  type HotbarViewSheet,
} from "@/components/listing-hotbar-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  HOTBAR_COOKIE_NAME,
  HOTBAR_DRAWER_ID,
  HOTBAR_LID_ID,
  HOTBAR_REFUSE_COPY,
  canTapeHotbar,
  isListingHotbarOverlay,
  parseHotbarListingIds,
} from "@/lib/listing-hotbar";
import { listingHotbarPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type HotbarPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): HotbarViewKind {
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
  if (listing.id === HOTBAR_DRAWER_ID) {
    return "drawer";
  }
  if (listing.id === HOTBAR_LID_ID) {
    return "lid";
  }
  if (!canTapeHotbar(listing)) {
    return "owned";
  }
  return "physical";
}

function hotbarSheetForId(id: string, hotbarIds: string[]): HotbarViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isHotbar: listing ? isListingHotbarOverlay(listing.id, hotbarIds) : false,
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
}: HotbarPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const hotbarIds = parseHotbarListingIds(jar.get(HOTBAR_COOKIE_NAME)?.value);
  const sheet = hotbarSheetForId(id, hotbarIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: HOTBAR_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a hotbar note on.",
      path: listingHotbarPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: HOTBAR_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a hotbar note."
          : sheet.kind === "drawer"
            ? "A cable drawer does not take a hotbar note. Hotbar is a Game Boy flex."
            : sheet.kind === "lid"
              ? "A pot lid does not take a hotbar note. Hotbar is a Game Boy flex."
              : sheet.kind === "owned"
                ? "A hotbar note is for the cracked Game Boy. Another overlay already owns that listing."
                : "A file does not take a hotbar note. A hotbar note is for the Game Boy on the table.",
      path: listingHotbarPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not hotbar it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not hotbar it. Still a crack. Still Tetris. Still tote. Not pogo. Not underfill. Not reball.`,
    path: listingHotbarPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingHotbarPage({ params }: HotbarPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const hotbarIds = parseHotbarListingIds(jar.get(HOTBAR_COOKIE_NAME)?.value);
  const sheet = hotbarSheetForId(id, hotbarIds);

  return <ListingHotbarView sheet={sheet} hotbarIds={hotbarIds} />;
}
