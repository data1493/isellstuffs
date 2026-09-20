import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingTrussView,
  type TrussViewKind,
  type TrussViewSheet,
} from "@/components/listing-truss-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import {
  TRUSS_COOKIE_NAME,
  TRUSS_LID_ID,
  TRUSS_MUG_ID,
  TRUSS_REFUSE_COPY,
  canTapeTruss,
  isListingTrussOverlay,
  parseTrussListingIds,
} from "@/lib/listing-truss";
import { listingHubName } from "@/lib/listing-display";
import { listingTrussPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type TrussPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): TrussViewKind {
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
  if (listing.id === TRUSS_MUG_ID) {
    return "mug";
  }
  if (listing.id === TRUSS_LID_ID) {
    return "lid";
  }
  if (!canTapeTruss(listing)) {
    return "owned";
  }
  return "physical";
}

function trussSheetForId(id: string, trussIds: string[]): TrussViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isTruss: listing ? isListingTrussOverlay(listing.id, trussIds) : false,
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
}: TrussPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const trussIds = parseTrussListingIds(jar.get(TRUSS_COOKIE_NAME)?.value);
  const sheet = trussSheetForId(id, trussIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: TRUSS_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a truss note on.",
      path: listingTrussPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: TRUSS_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a truss note."
          : sheet.kind === "mug"
            ? "A mug does not take a truss note. Truss is a whisk balloon."
            : sheet.kind === "lid"
              ? "A lid does not take a truss note. Truss is a whisk balloon."
              : sheet.kind === "owned"
                ? "A truss note is for the balloon whisk. Another overlay already owns that listing."
                : "A file does not take a truss note. A truss note is for the whisk on the table.",
      path: listingTrussPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not truss it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not truss it. Still bent. Still metal. Still tote. Not anneal. Not temper. Not peen. Not tines.`,
    path: listingTrussPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingTrussPage({ params }: TrussPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const trussIds = parseTrussListingIds(jar.get(TRUSS_COOKIE_NAME)?.value);
  const sheet = trussSheetForId(id, trussIds);

  return <ListingTrussView sheet={sheet} trussIds={trussIds} />;
}
