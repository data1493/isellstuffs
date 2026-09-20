import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingQuenchView,
  type QuenchViewKind,
  type QuenchViewSheet,
} from "@/components/listing-quench-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import {
  QUENCH_COOKIE_NAME,
  QUENCH_LID_ID,
  QUENCH_MUG_ID,
  QUENCH_REFUSE_COPY,
  canTapeQuench,
  isListingQuenchOverlay,
  parseQuenchListingIds,
} from "@/lib/listing-quench";
import { listingHubName } from "@/lib/listing-display";
import { listingQuenchPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type QuenchPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): QuenchViewKind {
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
  if (listing.id === QUENCH_MUG_ID) {
    return "mug";
  }
  if (listing.id === QUENCH_LID_ID) {
    return "lid";
  }
  if (!canTapeQuench(listing)) {
    return "owned";
  }
  return "physical";
}

function quenchSheetForId(id: string, quenchIds: string[]): QuenchViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isQuench: listing ? isListingQuenchOverlay(listing.id, quenchIds) : false,
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
}: QuenchPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const quenchIds = parseQuenchListingIds(jar.get(QUENCH_COOKIE_NAME)?.value);
  const sheet = quenchSheetForId(id, quenchIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: QUENCH_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a quench note on.",
      path: listingQuenchPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: QUENCH_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a quench note."
          : sheet.kind === "mug"
            ? "A mug does not take a quench note. Quench is a whisk dunk."
            : sheet.kind === "lid"
              ? "A lid does not take a quench note. Quench is a whisk dunk."
              : sheet.kind === "owned"
                ? "A quench note is for the balloon whisk. Another overlay already owns that listing."
                : "A file does not take a quench note. A quench note is for the whisk on the table.",
      path: listingQuenchPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not quench it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not quench it. Still a splay. Still a whisk. Still tote. Not temper. Not anneal. Not peen.`,
    path: listingQuenchPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingQuenchPage({ params }: QuenchPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const quenchIds = parseQuenchListingIds(jar.get(QUENCH_COOKIE_NAME)?.value);
  const sheet = quenchSheetForId(id, quenchIds);

  return <ListingQuenchView sheet={sheet} quenchIds={quenchIds} />;
}
