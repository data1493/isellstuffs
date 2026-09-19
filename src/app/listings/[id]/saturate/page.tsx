import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingSaturateView,
  type SaturateViewKind,
  type SaturateViewSheet,
} from "@/components/listing-saturate-view";
import {
  formatMoney,
  isDigitalListing,
  isGiftListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  SATURATE_COOKIE_NAME,
  SATURATE_FONT_ID,
  SATURATE_LUT_ID,
  SATURATE_REFUSE_COPY,
  canTapeSaturate,
  isListingSaturateOverlay,
  parseSaturateListingIds,
} from "@/lib/listing-saturate";
import { listingSaturatePath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type SaturatePageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): SaturateViewKind {
  if (!listing) {
    return "missing";
  }
  if (isGiftListing(listing)) {
    return "gift";
  }
  if (listing.id === SATURATE_FONT_ID) {
    return "font";
  }
  if (listing.id === SATURATE_LUT_ID) {
    return "lut";
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
  if (!canTapeSaturate(listing)) {
    return "physical";
  }
  return "digital";
}

function saturateSheetForId(id: string, saturateIds: string[]): SaturateViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isSaturate: listing ? isListingSaturateOverlay(listing.id, saturateIds) : false,
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
}: SaturatePageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const saturateIds = parseSaturateListingIds(
    jar.get(SATURATE_COOKIE_NAME)?.value,
  );
  const sheet = saturateSheetForId(id, saturateIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: SATURATE_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a saturate note on.",
      path: listingSaturatePath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "digital") {
    return shareMetadata({
      title: SATURATE_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a saturate note."
          : sheet.kind === "font"
            ? "A booth font does not take a saturate note. Saturate is twelve shots and a zip."
            : sheet.kind === "lut"
              ? "A LUT pack does not take a saturate note. Saturate is twelve shots and a zip."
              : "A lamp does not take a saturate note. A saturate note is for twelve shots and a zip.",
      path: listingSaturatePath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not saturate them · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not saturate them. Still twelve shots. Still a zip. Still tote. Not quantize. Not crush. Not a shop. Not gate.`,
    path: listingSaturatePath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingSaturatePage({ params }: SaturatePageProps) {
  const { id } = await params;
  const jar = await cookies();
  const saturateIds = parseSaturateListingIds(
    jar.get(SATURATE_COOKIE_NAME)?.value,
  );
  const sheet = saturateSheetForId(id, saturateIds);

  return <ListingSaturateView sheet={sheet} saturateIds={saturateIds} />;
}
