import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingPleatView,
  type PleatViewKind,
  type PleatViewSheet,
} from "@/components/listing-pleat-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import {
  PLEAT_CHAIR_ID,
  PLEAT_COOKIE_NAME,
  PLEAT_LAMP_ID,
  PLEAT_REFUSE_COPY,
  PLEAT_SNEAKER_ID,
  canTapePleat,
  isListingPleatOverlay,
  parsePleatListingIds,
} from "@/lib/listing-pleat";
import { listingHubName } from "@/lib/listing-display";
import { listingPleatPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type PleatPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): PleatViewKind {
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
    return listing.id === PLEAT_CHAIR_ID ? "chair" : "sold";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.id === PLEAT_CHAIR_ID) {
    return "chair";
  }
  if (listing.id === PLEAT_SNEAKER_ID) {
    return "sneakers";
  }
  if (listing.id === PLEAT_LAMP_ID) {
    return "lamp";
  }
  if (!canTapePleat(listing)) {
    return "owned";
  }
  return "physical";
}

function pleatSheetForId(id: string, pleatIds: string[]): PleatViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isPleat: listing ? isListingPleatOverlay(listing.id, pleatIds) : false,
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
}: PleatPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const pleatIds = parsePleatListingIds(jar.get(PLEAT_COOKIE_NAME)?.value);
  const sheet = pleatSheetForId(id, pleatIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: PLEAT_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a pleat note on.",
      path: listingPleatPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: PLEAT_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a pleat note."
          : sheet.kind === "sneakers"
            ? "Sneakers do not take a pleat note. Pleat is a jacket fold."
            : sheet.kind === "lamp"
              ? "A lamp does not take a pleat note. Pleat is a jacket fold."
              : sheet.kind === "chair"
                ? "A chair does not take a pleat note. Pleat is a jacket fold."
                : sheet.kind === "owned"
                  ? "A pleat note is for the windbreaker. Another overlay already owns that listing."
                  : "A file does not take a pleat note. A pleat note is for the jacket on the table.",
      path: listingPleatPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not pleat it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not pleat it. Still a jacket. Still a hole. Still tote. Not sew. Not darn. Not dart.`,
    path: listingPleatPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingPleatPage({ params }: PleatPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const pleatIds = parsePleatListingIds(jar.get(PLEAT_COOKIE_NAME)?.value);
  const sheet = pleatSheetForId(id, pleatIds);

  return <ListingPleatView sheet={sheet} pleatIds={pleatIds} />;
}
