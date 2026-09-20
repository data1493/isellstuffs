import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingShaperView,
  type ShaperViewKind,
  type ShaperViewSheet,
} from "@/components/listing-shaper-view";
import {
  formatMoney,
  isDigitalListing,
  isGiftListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  SHAPER_COOKIE_NAME,
  SHAPER_HOST_ID,
  SHAPER_REFUSE_COPY,
  canTapeShaper,
  isListingShaperOverlay,
  parseShaperListingIds,
} from "@/lib/listing-shaper";
import { listingShaperPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type ShaperPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): ShaperViewKind {
  if (!listing) {
    return "missing";
  }
  if (isGiftListing(listing)) {
    return "gift";
  }
  if (isDigitalListing(listing)) {
    if (listing.status === "file-gone") {
      return "file-gone";
    }
    if (listing.id !== SHAPER_HOST_ID || !canTapeShaper(listing)) {
      return "owned";
    }
    return "digital";
  }
  if (listing.status === "sold") {
    return "sold";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  return "physical";
}

function shaperSheetForId(id: string, shaperIds: string[]): ShaperViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isShaper: listing ? isListingShaperOverlay(listing.id, shaperIds) : false,
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
}: ShaperPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const shaperIds = parseShaperListingIds(jar.get(SHAPER_COOKIE_NAME)?.value);
  const sheet = shaperSheetForId(id, shaperIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: SHAPER_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a shaper note on.",
      path: listingShaperPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "digital") {
    return shareMetadata({
      title: SHAPER_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a shaper note."
          : sheet.kind === "owned"
            ? "A shaper note is for the parking-lot LUT pack. Another overlay already owns that listing."
            : "A Game Boy does not take a shaper note. A shaper note is for three parking-lot looks.",
      path: listingShaperPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not shaper them · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not shaper them. Still three looks. Still fluorescent. Still tote. Not cube. Not grain. Not a shop. Not convert. Not an account.`,
    path: listingShaperPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingShaperPage({ params }: ShaperPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const shaperIds = parseShaperListingIds(jar.get(SHAPER_COOKIE_NAME)?.value);
  const sheet = shaperSheetForId(id, shaperIds);

  return <ListingShaperView sheet={sheet} shaperIds={shaperIds} />;
}
