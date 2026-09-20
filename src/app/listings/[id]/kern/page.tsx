import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingKernView,
  type KernViewKind,
  type KernViewSheet,
} from "@/components/listing-kern-view";
import {
  formatMoney,
  isDigitalListing,
  isGiftListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  KERN_COOKIE_NAME,
  KERN_HOST_ID,
  KERN_REFUSE_COPY,
  canTapeKern,
  isListingKernOverlay,
  parseKernListingIds,
} from "@/lib/listing-kern";
import { listingKernPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type KernPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): KernViewKind {
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
    if (listing.id !== KERN_HOST_ID || !canTapeKern(listing)) {
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

function kernSheetForId(id: string, kernIds: string[]): KernViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isKern: listing ? isListingKernOverlay(listing.id, kernIds) : false,
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
}: KernPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const kernIds = parseKernListingIds(jar.get(KERN_COOKIE_NAME)?.value);
  const sheet = kernSheetForId(id, kernIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: KERN_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a kern note on.",
      path: listingKernPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "digital") {
    return shareMetadata({
      title: KERN_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a kern note."
          : sheet.kind === "owned"
            ? "A kern note is for the booth font. Another overlay already owns that listing."
            : "A jacket does not take a kern note. A kern note is for the booth font.",
      path: listingKernPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not kern it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not kern it. Still two weights. Still a map. Still tote. Not ligature. Not subset. Not a shop. Not variable. Not an account.`,
    path: listingKernPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingKernPage({ params }: KernPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const kernIds = parseKernListingIds(jar.get(KERN_COOKIE_NAME)?.value);
  const sheet = kernSheetForId(id, kernIds);

  return <ListingKernView sheet={sheet} kernIds={kernIds} />;
}
