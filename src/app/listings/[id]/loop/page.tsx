import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingLoopView,
  type LoopViewKind,
  type LoopViewSheet,
} from "@/components/listing-loop-view";
import {
  formatMoney,
  isDigitalListing,
  isGiftListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  LOOP_COOKIE_NAME,
  LOOP_REFUSE_COPY,
  isListingLoopOverlay,
  parseLoopListingIds,
} from "@/lib/listing-loop";
import { listingLoopPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type LoopPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): LoopViewKind {
  if (!listing) {
    return "missing";
  }
  if (isGiftListing(listing)) {
    return "gift";
  }
  if (isDigitalListing(listing)) {
    return listing.status === "file-gone" ? "file-gone" : "digital";
  }
  if (listing.status === "sold") {
    return "sold";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  return "physical";
}

function loopSheetForId(id: string, loopIds: string[]): LoopViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isLoop: listing ? isListingLoopOverlay(listing.id, loopIds) : false,
    title: listing?.title ?? null,
    priceLabel: listing ? formatMoney(listing.price) : null,
    fact: listing
      ? isDigitalListing(listing)
        ? listing.fileFormat
        : listing.condition
      : null,
    stallName: stall?.boothName ?? listing?.stallId ?? null,
    stallSlug: stall?.slug ?? null,
    hubName: listing ? listingHubName(listing) : null,
    listing: listing ?? null,
  };
}

export async function generateMetadata({
  params,
}: LoopPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const loopIds = parseLoopListingIds(jar.get(LOOP_COOKIE_NAME)?.value);
  const sheet = loopSheetForId(id, loopIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: LOOP_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a loop on.",
      path: listingLoopPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "digital") {
    return shareMetadata({
      title: LOOP_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code is not a loop."
          : "A lamp is not a loop. Loop honesty is for a file on the digital lot.",
      path: listingLoopPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not slice the loop · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. The loop stays a loop. Stems is twelve shots. BPM is a guess. Still tote. Not a kit shop.`,
    path: listingLoopPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingLoopPage({ params }: LoopPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const loopIds = parseLoopListingIds(jar.get(LOOP_COOKIE_NAME)?.value);
  const sheet = loopSheetForId(id, loopIds);

  return <ListingLoopView sheet={sheet} loopIds={loopIds} />;
}
