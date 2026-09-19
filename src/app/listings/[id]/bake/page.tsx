import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingBakeView,
  type BakeViewKind,
  type BakeViewSheet,
} from "@/components/listing-bake-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  BAKE_COOKIE_NAME,
  BAKE_REFUSE_COPY,
  isListingBakeOverlay,
  parseBakeListingIds,
} from "@/lib/listing-bake";
import { listingBakePath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type BakePageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): BakeViewKind {
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

function bakeSheetForId(id: string, bakeIds: string[]): BakeViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isBake: listing ? isListingBakeOverlay(listing.id, bakeIds) : false,
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
}: BakePageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const bakeIds = parseBakeListingIds(jar.get(BAKE_COOKIE_NAME)?.value);
  const sheet = bakeSheetForId(id, bakeIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: BAKE_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a bake refusal on.",
      path: listingBakePath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: BAKE_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not bake."
          : "A liner PDF does not bake. A bake refusal is for a cassette on the table.",
      path: listingBakePath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not bake · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. Hiss is the hiss. Rip is no WAV. Songs is no titles. I will not bake. Rewound by hand. Still tote. Not hiss. Not a bake shop. Not rip.`,
    path: listingBakePath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingBakePage({ params }: BakePageProps) {
  const { id } = await params;
  const jar = await cookies();
  const bakeIds = parseBakeListingIds(jar.get(BAKE_COOKIE_NAME)?.value);
  const sheet = bakeSheetForId(id, bakeIds);

  return <ListingBakeView sheet={sheet} bakeIds={bakeIds} />;
}
