import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingSmokeView,
  type SmokeViewKind,
  type SmokeViewSheet,
} from "@/components/listing-smoke-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  SMOKE_COOKIE_NAME,
  SMOKE_REFUSE_COPY,
  isListingSmokeOverlay,
  parseSmokeListingIds,
} from "@/lib/listing-smoke";
import { listingSmokePath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type SmokePageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): SmokeViewKind {
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

function smokeSheetForId(id: string, smokeIds: string[]): SmokeViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isSmoke: listing ? isListingSmokeOverlay(listing.id, smokeIds) : false,
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
}: SmokePageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const smokeIds = parseSmokeListingIds(jar.get(SMOKE_COOKIE_NAME)?.value);
  const sheet = smokeSheetForId(id, smokeIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: SMOKE_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape smoke on.",
      path: listingSmokePath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: SMOKE_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. Files do not smoke."
          : "A file does not smoke. Garment honesty is for a jacket on the table.",
      path: listingSmokePath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `Smells like smoke · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. Pockets are empty is the jacket check. This is the smoke smell. Still tote. Not as-is. Not look.`,
    path: listingSmokePath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingSmokePage({ params }: SmokePageProps) {
  const { id } = await params;
  const jar = await cookies();
  const smokeIds = parseSmokeListingIds(jar.get(SMOKE_COOKIE_NAME)?.value);
  const sheet = smokeSheetForId(id, smokeIds);

  return <ListingSmokeView sheet={sheet} smokeIds={smokeIds} />;
}
