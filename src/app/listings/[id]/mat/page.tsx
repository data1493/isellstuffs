import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingMatView,
  type MatViewKind,
  type MatViewSheet,
} from "@/components/listing-mat-view";
import {
  formatMoney,
  isDigitalListing,
  isGiftListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  MAT_COOKIE_NAME,
  MAT_REFUSE_COPY,
  canTapeMat,
  isListingMatOverlay,
  parseMatListingIds,
} from "@/lib/listing-mat";
import { listingMatPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type MatPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): MatViewKind {
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
    if (!canTapeMat(listing)) {
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

function matSheetForId(id: string, matIds: string[]): MatViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isMat: listing ? isListingMatOverlay(listing.id, matIds) : false,
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
}: MatPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const matIds = parseMatListingIds(jar.get(MAT_COOKIE_NAME)?.value);
  const sheet = matSheetForId(id, matIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: MAT_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a mat note on.",
      path: listingMatPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "digital") {
    return shareMetadata({
      title: MAT_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a mat note."
          : sheet.kind === "owned"
            ? "A mat note is for the Side A liner. Another overlay already owns that listing."
            : "A jacket does not take a mat note. A mat note is for one liner page.",
      path: listingMatPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not mat it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not mat it. Still one page. Still wrong on purpose. Still tote. Not bleed. Not typeset. Not a shop. Not preflight.`,
    path: listingMatPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingMatPage({ params }: MatPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const matIds = parseMatListingIds(jar.get(MAT_COOKIE_NAME)?.value);
  const sheet = matSheetForId(id, matIds);

  return <ListingMatView sheet={sheet} matIds={matIds} />;
}
