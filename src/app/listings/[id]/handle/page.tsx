import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingHandleView,
  type HandleViewKind,
  type HandleViewSheet,
} from "@/components/listing-handle-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  HANDLE_COOKIE_NAME,
  HANDLE_REFUSE_COPY,
  isListingHandleOverlay,
  parseHandleListingIds,
} from "@/lib/listing-handle";
import { listingHandlePath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type HandlePageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): HandleViewKind {
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

function handleSheetForId(id: string, handleIds: string[]): HandleViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isHandle: listing ? isListingHandleOverlay(listing.id, handleIds) : false,
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
}: HandlePageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const handleIds = parseHandleListingIds(jar.get(HANDLE_COOKIE_NAME)?.value);
  const sheet = handleSheetForId(id, handleIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: HANDLE_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a handle note on.",
      path: listingHandlePath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: HANDLE_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a handle note."
          : "A file does not take a handle note. A handle note is for a diner mug on the table.",
      path: listingHandlePath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not handle it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not handle it. Still a chip. Still coffee. Still tote. Not chip. Not whose. Not cap.`,
    path: listingHandlePath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingHandlePage({ params }: HandlePageProps) {
  const { id } = await params;
  const jar = await cookies();
  const handleIds = parseHandleListingIds(jar.get(HANDLE_COOKIE_NAME)?.value);
  const sheet = handleSheetForId(id, handleIds);

  return <ListingHandleView sheet={sheet} handleIds={handleIds} />;
}
