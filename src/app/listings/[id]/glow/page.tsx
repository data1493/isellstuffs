import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingGlowView,
  type GlowViewKind,
  type GlowViewSheet,
} from "@/components/listing-glow-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  GLOW_COOKIE_NAME,
  GLOW_REFUSE_COPY,
  isListingGlowOverlay,
  parseGlowListingIds,
} from "@/lib/listing-glow";
import { listingGlowPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type GlowPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): GlowViewKind {
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

function glowSheetForId(id: string, glowIds: string[]): GlowViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isGlow: listing ? isListingGlowOverlay(listing.id, glowIds) : false,
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
}: GlowPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const glowIds = parseGlowListingIds(jar.get(GLOW_COOKIE_NAME)?.value);
  const sheet = glowSheetForId(id, glowIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: GLOW_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a backlight note on.",
      path: listingGlowPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: GLOW_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a backlight."
          : "A file does not take a backlight. A backlight note is for a handheld on the table.",
      path: listingGlowPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I don't have a backlight · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I don't have a backlight. Line stays. Still plays. Still tote. Still for sale.`,
    path: listingGlowPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingGlowPage({ params }: GlowPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const glowIds = parseGlowListingIds(jar.get(GLOW_COOKIE_NAME)?.value);
  const sheet = glowSheetForId(id, glowIds);

  return <ListingGlowView sheet={sheet} glowIds={glowIds} />;
}
