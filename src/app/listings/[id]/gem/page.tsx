import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingGemView,
  type GemViewKind,
  type GemViewSheet,
} from "@/components/listing-gem-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  GEM_CHAIR_ID,
  GEM_COOKIE_NAME,
  GEM_JACKET_ID,
  GEM_LID_ID,
  GEM_REFUSE_COPY,
  canTapeGem,
  isListingGemOverlay,
  parseGemListingIds,
} from "@/lib/listing-gem";
import { listingGemPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type GemPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): GemViewKind {
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
    return listing.id === GEM_CHAIR_ID ? "chair" : "sold";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.id === GEM_CHAIR_ID) {
    return "chair";
  }
  if (listing.id === GEM_JACKET_ID) {
    return "jacket";
  }
  if (listing.id === GEM_LID_ID) {
    return "lid";
  }
  if (!canTapeGem(listing)) {
    return "owned";
  }
  return "physical";
}

function gemSheetForId(id: string, gemIds: string[]): GemViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isGem: listing ? isListingGemOverlay(listing.id, gemIds) : false,
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
}: GemPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const gemIds = parseGemListingIds(jar.get(GEM_COOKIE_NAME)?.value);
  const sheet = gemSheetForId(id, gemIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: GEM_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a gem note on.",
      path: listingGemPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: GEM_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a gem note."
          : sheet.kind === "jacket"
            ? "A jacket does not take a gem note. Gem honesty is for the split-sole pair."
            : sheet.kind === "lid"
              ? "A pot lid does not take a gem note. Gem honesty is for the split-sole pair."
              : sheet.kind === "chair"
                ? "A chair does not take a gem note. Gem honesty is for the split-sole pair."
                : sheet.kind === "owned"
                  ? "A gem note is for the split-sole pair. Another overlay already owns that listing."
                  : "A file does not take a gem note. A gem note is for the pair on the table.",
      path: listingGemPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not gem them · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not gem them. Still a flex. Still original laces. Still tote. Not shank. Not edge. Not channel.`,
    path: listingGemPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingGemPage({ params }: GemPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const gemIds = parseGemListingIds(jar.get(GEM_COOKIE_NAME)?.value);
  const sheet = gemSheetForId(id, gemIds);

  return <ListingGemView sheet={sheet} gemIds={gemIds} />;
}
