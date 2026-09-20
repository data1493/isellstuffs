import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingTrapView,
  type TrapViewKind,
  type TrapViewSheet,
} from "@/components/listing-trap-view";
import {
  formatMoney,
  isDigitalListing,
  isGiftListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  TRAP_COOKIE_NAME,
  TRAP_REFUSE_COPY,
  canTapeTrap,
  isListingTrapOverlay,
  parseTrapListingIds,
} from "@/lib/listing-trap";
import { listingTrapPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type TrapPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): TrapViewKind {
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
    if (!canTapeTrap(listing)) {
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

function trapSheetForId(id: string, trapIds: string[]): TrapViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isTrap: listing ? isListingTrapOverlay(listing.id, trapIds) : false,
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
}: TrapPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const trapIds = parseTrapListingIds(jar.get(TRAP_COOKIE_NAME)?.value);
  const sheet = trapSheetForId(id, trapIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: TRAP_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a trap note on.",
      path: listingTrapPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "digital") {
    return shareMetadata({
      title: TRAP_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a trap note."
          : sheet.kind === "owned"
            ? "A trap note is for the junk PDF. Another overlay already owns that listing."
            : "A lamp does not take a trap note. A trap note is for one junk PDF page.",
      path: listingTrapPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not trap it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not trap it. Still a junk PDF. Still a driveway print. Still tote. Not preflight. Not collate. Not a shop. Not bleed.`,
    path: listingTrapPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingTrapPage({ params }: TrapPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const trapIds = parseTrapListingIds(jar.get(TRAP_COOKIE_NAME)?.value);
  const sheet = trapSheetForId(id, trapIds);

  return <ListingTrapView sheet={sheet} trapIds={trapIds} />;
}
