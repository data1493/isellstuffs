import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingSoakView,
  type SoakViewKind,
  type SoakViewSheet,
} from "@/components/listing-soak-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  SOAK_COOKIE_NAME,
  SOAK_DRAWER_ID,
  SOAK_LID_ID,
  SOAK_REFUSE_COPY,
  canTapeSoak,
  isListingSoakOverlay,
  parseSoakListingIds,
} from "@/lib/listing-soak";
import { listingSoakPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type SoakPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): SoakViewKind {
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
  if (listing.id === SOAK_DRAWER_ID) {
    return "drawer";
  }
  if (listing.id === SOAK_LID_ID) {
    return "lid";
  }
  if (!canTapeSoak(listing)) {
    return "owned";
  }
  return "physical";
}

function soakSheetForId(id: string, soakIds: string[]): SoakViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isSoak: listing ? isListingSoakOverlay(listing.id, soakIds) : false,
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
}: SoakPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const soakIds = parseSoakListingIds(jar.get(SOAK_COOKIE_NAME)?.value);
  const sheet = soakSheetForId(id, soakIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: SOAK_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a soak note on.",
      path: listingSoakPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: SOAK_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a soak note."
          : sheet.kind === "drawer"
            ? "A cable drawer does not take a soak note. Soak is a Game Boy hold."
            : sheet.kind === "lid"
              ? "A pot lid does not take a soak note. Soak is a Game Boy hold."
              : sheet.kind === "owned"
                ? "A soak note is for the cracked Game Boy. Another overlay already owns that listing."
                : "A file does not take a soak note. A soak note is for the Game Boy on the table.",
      path: listingSoakPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not soak it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not soak it. Still a crack. Still Tetris. Still tote. Not hotbar. Not pogo. Not reball.`,
    path: listingSoakPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingSoakPage({ params }: SoakPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const soakIds = parseSoakListingIds(jar.get(SOAK_COOKIE_NAME)?.value);
  const sheet = soakSheetForId(id, soakIds);

  return <ListingSoakView sheet={sheet} soakIds={soakIds} />;
}
