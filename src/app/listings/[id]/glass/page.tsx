import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingGlassView,
  type GlassViewKind,
  type GlassViewSheet,
} from "@/components/listing-glass-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  GLASS_COOKIE_NAME,
  GLASS_REFUSE_COPY,
  isListingGlassOverlay,
  parseGlassListingIds,
} from "@/lib/listing-glass";
import { listingGlassPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type GlassPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): GlassViewKind {
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

function glassSheetForId(id: string, glassIds: string[]): GlassViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isGlass: listing ? isListingGlassOverlay(listing.id, glassIds) : false,
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
}: GlassPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const glassIds = parseGlassListingIds(jar.get(GLASS_COOKIE_NAME)?.value);
  const sheet = glassSheetForId(id, glassIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: GLASS_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a glass refusal on.",
      path: listingGlassPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: GLASS_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take glass."
          : "A file does not take glass. A glass refusal is for a lid on the table.",
      path: listingGlassPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not replace the glass · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. Knob is the wiggle. Fits is the 3-quart. Wrap is newspaper. I will not replace the glass. Lid only. Still tote. Not knob. Not a glass shop. Not wrap.`,
    path: listingGlassPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingGlassPage({ params }: GlassPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const glassIds = parseGlassListingIds(jar.get(GLASS_COOKIE_NAME)?.value);
  const sheet = glassSheetForId(id, glassIds);

  return <ListingGlassView sheet={sheet} glassIds={glassIds} />;
}
