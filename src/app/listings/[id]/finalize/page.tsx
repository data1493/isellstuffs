import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingFinalizeView,
  type FinalizeViewKind,
  type FinalizeViewSheet,
} from "@/components/listing-finalize-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  FINALIZE_COOKIE_NAME,
  FINALIZE_REFUSE_COPY,
  isListingFinalizeOverlay,
  parseFinalizeListingIds,
} from "@/lib/listing-finalize";
import { listingFinalizePath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type FinalizePageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): FinalizeViewKind {
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
  return "physical";
}

function finalizeSheetForId(id: string, finalizeIds: string[]): FinalizeViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isFinalize: listing ? isListingFinalizeOverlay(listing.id, finalizeIds) : false,
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
}: FinalizePageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const finalizeIds = parseFinalizeListingIds(
    jar.get(FINALIZE_COOKIE_NAME)?.value,
  );
  const sheet = finalizeSheetForId(id, finalizeIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: FINALIZE_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a finalize note on.",
      path: listingFinalizePath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: FINALIZE_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a finalize note."
          : "A file does not take a finalize note. A finalize note is for a disc on the table.",
      path: listingFinalizePath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not finalize it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not finalize it. Still Sharpie. Still scratched. Still tote. Not polish. Not ink. Not plays.`,
    path: listingFinalizePath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingFinalizePage({ params }: FinalizePageProps) {
  const { id } = await params;
  const jar = await cookies();
  const finalizeIds = parseFinalizeListingIds(
    jar.get(FINALIZE_COOKIE_NAME)?.value,
  );
  const sheet = finalizeSheetForId(id, finalizeIds);

  return <ListingFinalizeView sheet={sheet} finalizeIds={finalizeIds} />;
}
