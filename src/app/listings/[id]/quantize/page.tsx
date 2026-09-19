import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingQuantizeView,
  type QuantizeViewKind,
  type QuantizeViewSheet,
} from "@/components/listing-quantize-view";
import {
  formatMoney,
  isDigitalListing,
  isGiftListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  QUANTIZE_COOKIE_NAME,
  QUANTIZE_RECIPES_ID,
  QUANTIZE_REFUSE_COPY,
  isListingQuantizeOverlay,
  parseQuantizeListingIds,
} from "@/lib/listing-quantize";
import { listingQuantizePath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type QuantizePageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): QuantizeViewKind {
  if (!listing) {
    return "missing";
  }
  if (isGiftListing(listing)) {
    return "gift";
  }
  if (listing.id === QUANTIZE_RECIPES_ID) {
    return "recipes";
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

function quantizeSheetForId(id: string, quantizeIds: string[]): QuantizeViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isQuantize: listing ? isListingQuantizeOverlay(listing.id, quantizeIds) : false,
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
}: QuantizePageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const quantizeIds = parseQuantizeListingIds(jar.get(QUANTIZE_COOKIE_NAME)?.value);
  const sheet = quantizeSheetForId(id, quantizeIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: QUANTIZE_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a quantize note on.",
      path: listingQuantizePath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "digital") {
    return shareMetadata({
      title: QUANTIZE_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a quantize note."
          : sheet.kind === "recipes"
            ? "Recipe cards do not take a quantize note. A quantize note is for twelve shots and a zip."
            : "A lamp does not take a quantize note. A quantize note is for twelve shots and a zip.",
      path: listingQuantizePath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not quantize them · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not quantize them. Still twelve shots. Still a zip. Still tote. Not gate. Not tune. Not a shop. Not crush.`,
    path: listingQuantizePath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingQuantizePage({ params }: QuantizePageProps) {
  const { id } = await params;
  const jar = await cookies();
  const quantizeIds = parseQuantizeListingIds(jar.get(QUANTIZE_COOKIE_NAME)?.value);
  const sheet = quantizeSheetForId(id, quantizeIds);

  return <ListingQuantizeView sheet={sheet} quantizeIds={quantizeIds} />;
}
