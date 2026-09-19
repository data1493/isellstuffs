import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingVibeView,
  type VibeViewKind,
  type VibeViewSheet,
} from "@/components/listing-vibe-view";
import {
  formatMoney,
  isDigitalListing,
  isGiftListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  VIBE_COOKIE_NAME,
  VIBE_REFUSE_COPY,
  isListingVibeOverlay,
  parseVibeListingIds,
} from "@/lib/listing-vibe";
import { listingVibePath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type VibePageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): VibeViewKind {
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

function vibeSheetForId(id: string, vibeIds: string[]): VibeViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isVibe: listing ? isListingVibeOverlay(listing.id, vibeIds) : false,
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
}: VibePageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const vibeIds = parseVibeListingIds(jar.get(VIBE_COOKIE_NAME)?.value);
  const sheet = vibeSheetForId(id, vibeIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: VIBE_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape vibes on.",
      path: listingVibePath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "digital") {
    return shareMetadata({
      title: VIBE_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take recipe-card vibes."
          : "A lamp does not take vibes. Recipe-card paper is for a file on the digital lot.",
      path: listingVibePath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `Measurements are vibes · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. Three cards. Not a cookbook. Size is the lying tag. Fits is the lid. Still tote.`,
    path: listingVibePath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingVibePage({ params }: VibePageProps) {
  const { id } = await params;
  const jar = await cookies();
  const vibeIds = parseVibeListingIds(jar.get(VIBE_COOKIE_NAME)?.value);
  const sheet = vibeSheetForId(id, vibeIds);

  return <ListingVibeView sheet={sheet} vibeIds={vibeIds} />;
}
