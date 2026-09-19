import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingAskView,
  type AskViewKind,
  type AskViewSheet,
} from "@/components/listing-ask-view";
import {
  ASK_COOKIE_NAME,
  ASK_REFUSE_COPY,
  isListingAskOverlay,
  parseAskListingIds,
} from "@/lib/ask-first";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import { listingAskPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type AskPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): AskViewKind {
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

function askSheetForId(id: string, askIds: string[]): AskViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isAsk: listing ? isListingAskOverlay(listing.id, askIds) : false,
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
}: AskPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const askIds = parseAskListingIds(jar.get(ASK_COOKIE_NAME)?.value);
  const sheet = askSheetForId(id, askIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: ASK_REFUSE_COPY,
      description: "No SKU with that id. Nothing to ask before you flip.",
      path: listingAskPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: ASK_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. Files are not flipped."
          : "A file is not flipped. Ask-first is for a sleeve on the table.",
      path: listingAskPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `Ask before you flip it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. Still for sale. Not look. Not a hold.`,
    path: listingAskPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingAskPage({ params }: AskPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const askIds = parseAskListingIds(jar.get(ASK_COOKIE_NAME)?.value);
  const sheet = askSheetForId(id, askIds);

  return <ListingAskView sheet={sheet} askIds={askIds} />;
}
