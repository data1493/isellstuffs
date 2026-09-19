import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingHintView,
  type HintViewKind,
  type HintViewSheet,
} from "@/components/listing-hint-view";
import {
  formatMoney,
  isDigitalListing,
  isGiftListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  HINT_COOKIE_NAME,
  HINT_REFUSE_COPY,
  isListingHintOverlay,
  parseHintListingIds,
} from "@/lib/listing-hint";
import { listingHintPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type HintPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): HintViewKind {
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

function hintSheetForId(id: string, hintIds: string[]): HintViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isHint: listing ? isListingHintOverlay(listing.id, hintIds) : false,
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
}: HintPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const hintIds = parseHintListingIds(jar.get(HINT_COOKIE_NAME)?.value);
  const sheet = hintSheetForId(id, hintIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: HINT_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a hint note on.",
      path: listingHintPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "digital") {
    return shareMetadata({
      title: HINT_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code is not a hint note."
          : "A lamp is not a hinted webfont. Hint honesty is for a file on the digital lot.",
      path: listingHintPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not hint it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not hint it. Two weights. Still a map. Still tote. Not foundry. Not a foundry seat. Not bold.`,
    path: listingHintPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingHintPage({ params }: HintPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const hintIds = parseHintListingIds(jar.get(HINT_COOKIE_NAME)?.value);
  const sheet = hintSheetForId(id, hintIds);

  return <ListingHintView sheet={sheet} hintIds={hintIds} />;
}
