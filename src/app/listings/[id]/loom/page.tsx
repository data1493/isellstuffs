import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingLoomView,
  type LoomViewKind,
  type LoomViewSheet,
} from "@/components/listing-loom-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import {
  LOOM_BOY_ID,
  LOOM_CDR_ID,
  LOOM_CHAIR_ID,
  LOOM_COOKIE_NAME,
  LOOM_REFUSE_COPY,
  canTapeLoom,
  isListingLoomOverlay,
  parseLoomListingIds,
} from "@/lib/listing-loom";
import { listingHubName } from "@/lib/listing-display";
import { listingLoomPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type LoomPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): LoomViewKind {
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
    return listing.id === LOOM_CHAIR_ID ? "chair" : "sold";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.id === LOOM_CHAIR_ID) {
    return "chair";
  }
  if (listing.id === LOOM_BOY_ID) {
    return "boy";
  }
  if (listing.id === LOOM_CDR_ID) {
    return "cdr";
  }
  if (!canTapeLoom(listing)) {
    return "owned";
  }
  return "physical";
}

function loomSheetForId(id: string, loomIds: string[]): LoomViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isLoom: listing ? isListingLoomOverlay(listing.id, loomIds) : false,
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
}: LoomPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const loomIds = parseLoomListingIds(jar.get(LOOM_COOKIE_NAME)?.value);
  const sheet = loomSheetForId(id, loomIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: LOOM_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a loom note on.",
      path: listingLoomPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: LOOM_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a loom note."
          : sheet.kind === "boy"
            ? "A Game Boy does not take a loom note. Loom is a cable-pile note."
            : sheet.kind === "cdr"
              ? "A burned disc does not take a loom note. Loom is a cable-pile note."
              : sheet.kind === "chair"
                ? "A chair does not take a loom note. Loom is a cable-pile note."
                : sheet.kind === "owned"
                  ? "A loom note is for the mystery cable drawer. Another overlay already owns that listing."
                  : "A file does not take a loom note. A loom note is for the cable drawer on the table.",
      path: listingLoomPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not loom them · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not loom them. Still a tangle. Still some ends honest. Still tote. Not braid. Not coil. Not ferrite.`,
    path: listingLoomPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingLoomPage({ params }: LoomPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const loomIds = parseLoomListingIds(jar.get(LOOM_COOKIE_NAME)?.value);
  const sheet = loomSheetForId(id, loomIds);

  return <ListingLoomView sheet={sheet} loomIds={loomIds} />;
}
