import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingPeenView,
  type PeenViewKind,
  type PeenViewSheet,
} from "@/components/listing-peen-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import {
  PEEN_COOKIE_NAME,
  PEEN_LID_ID,
  PEEN_MUG_ID,
  PEEN_REFUSE_COPY,
  canTapePeen,
  isListingPeenOverlay,
  parsePeenListingIds,
} from "@/lib/listing-peen";
import { listingHubName } from "@/lib/listing-display";
import { listingPeenPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type PeenPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): PeenViewKind {
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
  if (listing.id === PEEN_MUG_ID) {
    return "mug";
  }
  if (listing.id === PEEN_LID_ID) {
    return "lid";
  }
  if (!canTapePeen(listing)) {
    return "owned";
  }
  return "physical";
}

function peenSheetForId(id: string, peenIds: string[]): PeenViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isPeen: listing ? isListingPeenOverlay(listing.id, peenIds) : false,
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
}: PeenPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const peenIds = parsePeenListingIds(jar.get(PEEN_COOKIE_NAME)?.value);
  const sheet = peenSheetForId(id, peenIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: PEEN_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a peen note on.",
      path: listingPeenPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: PEEN_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a peen note."
          : sheet.kind === "mug"
            ? "A mug does not take a peen note. Peen is a whisk collar."
            : sheet.kind === "lid"
              ? "A lid does not take a peen note. Peen is a whisk collar."
              : sheet.kind === "owned"
                ? "A peen note is for the balloon whisk. Another overlay already owns that listing."
                : "A file does not take a peen note. A peen note is for the whisk on the table.",
      path: listingPeenPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not peen it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not peen it. Still splayed. Still metal. Still tote. Not anneal. Not bent. Not tines.`,
    path: listingPeenPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingPeenPage({ params }: PeenPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const peenIds = parsePeenListingIds(jar.get(PEEN_COOKIE_NAME)?.value);
  const sheet = peenSheetForId(id, peenIds);

  return <ListingPeenView sheet={sheet} peenIds={peenIds} />;
}
