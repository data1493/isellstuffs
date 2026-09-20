import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingGlobtopView,
  type GlobtopViewKind,
  type GlobtopViewSheet,
} from "@/components/listing-globtop-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  GLOBTOP_COOKIE_NAME,
  GLOBTOP_DRAWER_ID,
  GLOBTOP_LID_ID,
  GLOBTOP_REFUSE_COPY,
  canTapeGlobtop,
  isListingGlobtopOverlay,
  parseGlobtopListingIds,
} from "@/lib/listing-globtop";
import { listingGlobtopPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type GlobtopPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): GlobtopViewKind {
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
  if (listing.id === GLOBTOP_DRAWER_ID) {
    return "drawer";
  }
  if (listing.id === GLOBTOP_LID_ID) {
    return "lid";
  }
  if (!canTapeGlobtop(listing)) {
    return "owned";
  }
  return "physical";
}

function globtopSheetForId(id: string, globtopIds: string[]): GlobtopViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isGlobtop: listing ? isListingGlobtopOverlay(listing.id, globtopIds) : false,
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
}: GlobtopPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const globtopIds = parseGlobtopListingIds(jar.get(GLOBTOP_COOKIE_NAME)?.value);
  const sheet = globtopSheetForId(id, globtopIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: GLOBTOP_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a globtop note on.",
      path: listingGlobtopPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: GLOBTOP_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a globtop note."
          : sheet.kind === "drawer"
            ? "A cable drawer does not take a globtop note. Globtop is a Game Boy blob."
            : sheet.kind === "lid"
              ? "A pot lid does not take a globtop note. Globtop is a Game Boy blob."
              : sheet.kind === "owned"
                ? "A globtop note is for the cracked Game Boy. Another overlay already owns that listing."
                : "A file does not take a globtop note. A globtop note is for the Game Boy on the table.",
      path: listingGlobtopPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not globtop it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not globtop it. Still a crack. Still Tetris. Still tote. Not acf. Not soak. Not underfill.`,
    path: listingGlobtopPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingGlobtopPage({ params }: GlobtopPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const globtopIds = parseGlobtopListingIds(jar.get(GLOBTOP_COOKIE_NAME)?.value);
  const sheet = globtopSheetForId(id, globtopIds);

  return <ListingGlobtopView sheet={sheet} globtopIds={globtopIds} />;
}
