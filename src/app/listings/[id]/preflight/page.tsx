import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingPreflightView,
  type PreflightViewKind,
  type PreflightViewSheet,
} from "@/components/listing-preflight-view";
import {
  formatMoney,
  isDigitalListing,
  isGiftListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  PREFLIGHT_COOKIE_NAME,
  PREFLIGHT_REFUSE_COPY,
  canTapePreflight,
  isListingPreflightOverlay,
  parsePreflightListingIds,
} from "@/lib/listing-preflight";
import { listingPreflightPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type PreflightPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): PreflightViewKind {
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
    if (!canTapePreflight(listing)) {
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

function preflightSheetForId(
  id: string,
  preflightIds: string[],
): PreflightViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isPreflight: listing
      ? isListingPreflightOverlay(listing.id, preflightIds)
      : false,
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
}: PreflightPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const preflightIds = parsePreflightListingIds(
    jar.get(PREFLIGHT_COOKIE_NAME)?.value,
  );
  const sheet = preflightSheetForId(id, preflightIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: PREFLIGHT_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a preflight note on.",
      path: listingPreflightPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "digital") {
    return shareMetadata({
      title: PREFLIGHT_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a preflight note."
          : sheet.kind === "owned"
            ? "A preflight note is for the junk PDF. Another overlay already owns that listing."
            : "A lamp does not take a preflight note. A preflight note is for one junk PDF page.",
      path: listingPreflightPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not preflight it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not preflight it. Still one page. Still a PDF. Still tote. Not collate. Not impose. Not a shop. Not typeset.`,
    path: listingPreflightPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingPreflightPage({
  params,
}: PreflightPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const preflightIds = parsePreflightListingIds(
    jar.get(PREFLIGHT_COOKIE_NAME)?.value,
  );
  const sheet = preflightSheetForId(id, preflightIds);

  return <ListingPreflightView sheet={sheet} preflightIds={preflightIds} />;
}
