import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingGangView,
  type GangViewKind,
  type GangViewSheet,
} from "@/components/listing-gang-view";
import {
  formatMoney,
  isDigitalListing,
  isGiftListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  GANG_COOKIE_NAME,
  GANG_REFUSE_COPY,
  canTapeGang,
  isListingGangOverlay,
  parseGangListingIds,
} from "@/lib/listing-gang";
import { listingGangPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type GangPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): GangViewKind {
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
    if (!canTapeGang(listing)) {
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

function gangSheetForId(id: string, gangIds: string[]): GangViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isGang: listing ? isListingGangOverlay(listing.id, gangIds) : false,
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
}: GangPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const gangIds = parseGangListingIds(jar.get(GANG_COOKIE_NAME)?.value);
  const sheet = gangSheetForId(id, gangIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: GANG_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a gang note on.",
      path: listingGangPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "digital") {
    return shareMetadata({
      title: GANG_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a gang note."
          : sheet.kind === "owned"
            ? "A gang note is for the stained recipe cards. Another overlay already owns that listing."
            : "A liner does not take a gang note. A gang note is for three recipe cards.",
      path: listingGangPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not gang them · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not gang them. Still three cards. Still grease. Still tote. Not crop. Not emboss. Not a shop. Not varnish. Print imposition of three cards, not a login.`,
    path: listingGangPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingGangPage({ params }: GangPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const gangIds = parseGangListingIds(jar.get(GANG_COOKIE_NAME)?.value);
  const sheet = gangSheetForId(id, gangIds);

  return <ListingGangView sheet={sheet} gangIds={gangIds} />;
}
