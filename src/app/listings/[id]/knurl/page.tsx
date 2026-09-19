import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingKnurlView,
  type KnurlViewKind,
  type KnurlViewSheet,
} from "@/components/listing-knurl-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  KNURL_COOKIE_NAME,
  KNURL_REFUSE_COPY,
  isListingKnurlOverlay,
  parseKnurlListingIds,
} from "@/lib/listing-knurl";
import { listingKnurlPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type KnurlPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): KnurlViewKind {
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
  return "physical";
}

function knurlSheetForId(id: string, knurlIds: string[]): KnurlViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isKnurl: listing ? isListingKnurlOverlay(listing.id, knurlIds) : false,
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
}: KnurlPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const knurlIds = parseKnurlListingIds(jar.get(KNURL_COOKIE_NAME)?.value);
  const sheet = knurlSheetForId(id, knurlIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: KNURL_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a knurl note on.",
      path: listingKnurlPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: KNURL_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a knurl note."
          : "A file does not take a knurl note. A knurl note is for a pot lid on the table.",
      path: listingKnurlPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not knurl it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not knurl it. Still loose. Still a lid. Still tote. Not knob. Not glass. Not vent.`,
    path: listingKnurlPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingKnurlPage({ params }: KnurlPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const knurlIds = parseKnurlListingIds(jar.get(KNURL_COOKIE_NAME)?.value);
  const sheet = knurlSheetForId(id, knurlIds);

  return <ListingKnurlView sheet={sheet} knurlIds={knurlIds} />;
}
