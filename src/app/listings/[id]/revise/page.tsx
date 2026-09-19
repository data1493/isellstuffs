import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingReviseView,
  type ReviseViewKind,
  type ReviseViewSheet,
} from "@/components/listing-revise-view";
import {
  formatMoney,
  isDigitalListing,
  isGiftListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  REVISE_COOKIE_NAME,
  REVISE_REFUSE_COPY,
  isListingReviseOverlay,
  parseReviseListingIds,
} from "@/lib/listing-revise";
import { listingRevisePath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type RevisePageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): ReviseViewKind {
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

function reviseSheetForId(id: string, reviseIds: string[]): ReviseViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isRevise: listing ? isListingReviseOverlay(listing.id, reviseIds) : false,
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
}: RevisePageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const reviseIds = parseReviseListingIds(jar.get(REVISE_COOKIE_NAME)?.value);
  const sheet = reviseSheetForId(id, reviseIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: REVISE_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a revise on.",
      path: listingRevisePath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "digital") {
    return shareMetadata({
      title: REVISE_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code is not a page."
          : "A lamp is not a page. Revise honesty is for a file on the digital lot.",
      path: listingRevisePath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not revise · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. Written on a folding table. One page. Still tote. Not a second edition. Not a consult desk.`,
    path: listingRevisePath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingRevisePage({ params }: RevisePageProps) {
  const { id } = await params;
  const jar = await cookies();
  const reviseIds = parseReviseListingIds(jar.get(REVISE_COOKIE_NAME)?.value);
  const sheet = reviseSheetForId(id, reviseIds);

  return <ListingReviseView sheet={sheet} reviseIds={reviseIds} />;
}
