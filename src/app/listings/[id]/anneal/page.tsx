import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingAnnealView,
  type AnnealViewKind,
  type AnnealViewSheet,
} from "@/components/listing-anneal-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import {
  ANNEAL_COOKIE_NAME,
  ANNEAL_LID_ID,
  ANNEAL_MUG_ID,
  ANNEAL_REFUSE_COPY,
  canTapeAnneal,
  isListingAnnealOverlay,
  parseAnnealListingIds,
} from "@/lib/listing-anneal";
import { listingHubName } from "@/lib/listing-display";
import { listingAnnealPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type AnnealPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): AnnealViewKind {
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
  if (listing.id === ANNEAL_MUG_ID) {
    return "mug";
  }
  if (listing.id === ANNEAL_LID_ID) {
    return "lid";
  }
  if (!canTapeAnneal(listing)) {
    return "owned";
  }
  return "physical";
}

function annealSheetForId(id: string, annealIds: string[]): AnnealViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isAnneal: listing ? isListingAnnealOverlay(listing.id, annealIds) : false,
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
}: AnnealPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const annealIds = parseAnnealListingIds(jar.get(ANNEAL_COOKIE_NAME)?.value);
  const sheet = annealSheetForId(id, annealIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: ANNEAL_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape an anneal note on.",
      path: listingAnnealPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: ANNEAL_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take an anneal note."
          : sheet.kind === "mug"
            ? "A mug does not take an anneal note. Anneal is a whisk temper."
            : sheet.kind === "lid"
              ? "A lid does not take an anneal note. Anneal is a whisk temper."
              : sheet.kind === "owned"
                ? "An anneal note is for the balloon whisk. Another overlay already owns that listing."
                : "A file does not take an anneal note. An anneal note is for the whisk on the table.",
      path: listingAnnealPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not anneal it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not anneal it. Still splay. Still metal. Still tote. Not bent. Not tines. Not rust.`,
    path: listingAnnealPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingAnnealPage({ params }: AnnealPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const annealIds = parseAnnealListingIds(jar.get(ANNEAL_COOKIE_NAME)?.value);
  const sheet = annealSheetForId(id, annealIds);

  return <ListingAnnealView sheet={sheet} annealIds={annealIds} />;
}
