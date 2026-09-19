import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingPancakeView,
  type PancakeViewKind,
  type PancakeViewSheet,
} from "@/components/listing-pancake-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import {
  PANCAKE_CHAIR_ID,
  PANCAKE_COOKIE_NAME,
  PANCAKE_JEWELS_ID,
  PANCAKE_LP_ID,
  PANCAKE_REFUSE_COPY,
  canTapePancake,
  isListingPancakeOverlay,
  parsePancakeListingIds,
} from "@/lib/listing-pancake";
import { listingHubName } from "@/lib/listing-display";
import { listingPancakePath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type PancakePageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): PancakeViewKind {
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
    return listing.id === PANCAKE_CHAIR_ID ? "chair" : "sold";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.id === PANCAKE_CHAIR_ID) {
    return "chair";
  }
  if (listing.id === PANCAKE_LP_ID) {
    return "lp";
  }
  if (listing.id === PANCAKE_JEWELS_ID) {
    return "jewels";
  }
  if (!canTapePancake(listing)) {
    return "owned";
  }
  return "physical";
}

function pancakeSheetForId(id: string, pancakeIds: string[]): PancakeViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isPancake: listing ? isListingPancakeOverlay(listing.id, pancakeIds) : false,
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
}: PancakePageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const pancakeIds = parsePancakeListingIds(jar.get(PANCAKE_COOKIE_NAME)?.value);
  const sheet = pancakeSheetForId(id, pancakeIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: PANCAKE_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a pancake note on.",
      path: listingPancakePath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: PANCAKE_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a pancake note."
          : sheet.kind === "lp"
            ? "A record does not take a pancake note. Pancake is a cassette flop."
            : sheet.kind === "jewels"
              ? "Empty jewel cases do not take a pancake note. Pancake is a cassette flop."
              : sheet.kind === "chair"
                ? "A chair does not take a pancake note. Pancake is a cassette flop."
                : sheet.kind === "owned"
                  ? "A pancake note is for SUMMER 93. Another overlay already owns that listing."
                  : "A file does not take a pancake note. A pancake note is for the cassette on the table.",
      path: listingPancakePath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not pancake it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not pancake it. Still hiss. Still SUMMER 93. Still tote. Not wind. Not Dolby. Not bake.`,
    path: listingPancakePath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingPancakePage({ params }: PancakePageProps) {
  const { id } = await params;
  const jar = await cookies();
  const pancakeIds = parsePancakeListingIds(jar.get(PANCAKE_COOKIE_NAME)?.value);
  const sheet = pancakeSheetForId(id, pancakeIds);

  return <ListingPancakeView sheet={sheet} pancakeIds={pancakeIds} />;
}
