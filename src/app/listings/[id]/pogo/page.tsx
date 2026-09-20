import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingPogoView,
  type PogoViewKind,
  type PogoViewSheet,
} from "@/components/listing-pogo-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  POGO_COOKIE_NAME,
  POGO_DISC_ID,
  POGO_DRAWER_ID,
  POGO_REFUSE_COPY,
  canTapePogo,
  isListingPogoOverlay,
  parsePogoListingIds,
} from "@/lib/listing-pogo";
import { listingPogoPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type PogoPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): PogoViewKind {
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
  if (listing.id === POGO_DRAWER_ID) {
    return "drawer";
  }
  if (listing.id === POGO_DISC_ID) {
    return "disc";
  }
  if (!canTapePogo(listing)) {
    return "owned";
  }
  return "physical";
}

function pogoSheetForId(id: string, pogoIds: string[]): PogoViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isPogo: listing ? isListingPogoOverlay(listing.id, pogoIds) : false,
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
}: PogoPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const pogoIds = parsePogoListingIds(jar.get(POGO_COOKIE_NAME)?.value);
  const sheet = pogoSheetForId(id, pogoIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: POGO_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a pogo note on.",
      path: listingPogoPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: POGO_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a pogo note."
          : sheet.kind === "drawer"
            ? "A cable drawer does not take a pogo note. Pogo is a Game Boy spring."
            : sheet.kind === "disc"
              ? "A burned disc does not take a pogo note. Pogo is a Game Boy spring."
              : sheet.kind === "owned"
                ? "A pogo note is for the cracked Game Boy. Another overlay already owns that listing."
                : "A file does not take a pogo note. A pogo note is for the Game Boy on the table.",
      path: listingPogoPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not pogo it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not pogo it. Still a cart. Still Tetris. Still tote. Not clock. Not shield. Not recap.`,
    path: listingPogoPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingPogoPage({ params }: PogoPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const pogoIds = parsePogoListingIds(jar.get(POGO_COOKIE_NAME)?.value);
  const sheet = pogoSheetForId(id, pogoIds);

  return <ListingPogoView sheet={sheet} pogoIds={pogoIds} />;
}
