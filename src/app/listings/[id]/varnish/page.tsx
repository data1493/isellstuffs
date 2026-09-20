import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingVarnishView,
  type VarnishViewKind,
  type VarnishViewSheet,
} from "@/components/listing-varnish-view";
import {
  formatMoney,
  isDigitalListing,
  isGiftListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  VARNISH_COOKIE_NAME,
  VARNISH_REFUSE_COPY,
  canTapeVarnish,
  isListingVarnishOverlay,
  parseVarnishListingIds,
} from "@/lib/listing-varnish";
import { listingVarnishPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type VarnishPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): VarnishViewKind {
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
    if (!canTapeVarnish(listing)) {
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

function varnishSheetForId(id: string, varnishIds: string[]): VarnishViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isVarnish: listing ? isListingVarnishOverlay(listing.id, varnishIds) : false,
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
}: VarnishPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const varnishIds = parseVarnishListingIds(jar.get(VARNISH_COOKIE_NAME)?.value);
  const sheet = varnishSheetForId(id, varnishIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: VARNISH_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a varnish note on.",
      path: listingVarnishPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "digital") {
    return shareMetadata({
      title: VARNISH_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a varnish note."
          : sheet.kind === "owned"
            ? "A varnish note is for the junk PDF. Another overlay already owns that listing."
            : "A lamp does not take a varnish note. A varnish note is for one junk PDF page.",
      path: listingVarnishPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not varnish it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not varnish it. Still one page. Still a rule of thumb. Still tote. Not bleed. Not trap. Not a shop. Not preflight.`,
    path: listingVarnishPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingVarnishPage({ params }: VarnishPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const varnishIds = parseVarnishListingIds(jar.get(VARNISH_COOKIE_NAME)?.value);
  const sheet = varnishSheetForId(id, varnishIds);

  return <ListingVarnishView sheet={sheet} varnishIds={varnishIds} />;
}
