import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingEdgeView,
  type EdgeViewKind,
  type EdgeViewSheet,
} from "@/components/listing-edge-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  EDGE_CHAIR_ID,
  EDGE_COOKIE_NAME,
  EDGE_JACKET_ID,
  EDGE_REFUSE_COPY,
  canTapeEdge,
  isListingEdgeOverlay,
  parseEdgeListingIds,
} from "@/lib/listing-edge";
import { listingEdgePath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type EdgePageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): EdgeViewKind {
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
    return listing.id === EDGE_CHAIR_ID ? "chair" : "sold";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.id === EDGE_CHAIR_ID) {
    return "chair";
  }
  if (listing.id === EDGE_JACKET_ID) {
    return "jacket";
  }
  if (!canTapeEdge(listing)) {
    return "owned";
  }
  return "physical";
}

function edgeSheetForId(id: string, edgeIds: string[]): EdgeViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isEdge: listing ? isListingEdgeOverlay(listing.id, edgeIds) : false,
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
}: EdgePageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const edgeIds = parseEdgeListingIds(jar.get(EDGE_COOKIE_NAME)?.value);
  const sheet = edgeSheetForId(id, edgeIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: EDGE_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape an edge note on.",
      path: listingEdgePath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: EDGE_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take an edge note."
          : sheet.kind === "jacket"
            ? "A jacket does not take an edge note. Edge is a pair peel."
            : sheet.kind === "chair"
              ? "A chair does not take an edge note. Edge is a pair peel."
              : sheet.kind === "owned"
                ? "An edge note is for the split-sole pair. Another overlay already owns that listing."
                : "A file does not take an edge note. An edge note is for the pair on the table.",
      path: listingEdgePath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not edge it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not edge it. Still a pair. Still a peel. Still tote. Not skive. Not welt. Not burnish.`,
    path: listingEdgePath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingEdgePage({ params }: EdgePageProps) {
  const { id } = await params;
  const jar = await cookies();
  const edgeIds = parseEdgeListingIds(jar.get(EDGE_COOKIE_NAME)?.value);
  const sheet = edgeSheetForId(id, edgeIds);

  return <ListingEdgeView sheet={sheet} edgeIds={edgeIds} />;
}
