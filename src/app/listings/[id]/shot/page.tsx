import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingShotView,
  type ShotViewKind,
  type ShotViewSheet,
} from "@/components/listing-shot-view";
import {
  formatMoney,
  isDigitalListing,
  isGiftListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  SHOT_COOKIE_NAME,
  SHOT_REFUSE_COPY,
  isListingShotOverlay,
  parseShotListingIds,
} from "@/lib/listing-shot";
import { listingShotPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type ShotPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): ShotViewKind {
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

function shotSheetForId(id: string, shotIds: string[]): ShotViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isShot: listing ? isListingShotOverlay(listing.id, shotIds) : false,
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
}: ShotPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const shotIds = parseShotListingIds(jar.get(SHOT_COOKIE_NAME)?.value);
  const sheet = shotSheetForId(id, shotIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: SHOT_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a shot on.",
      path: listingShotPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "digital") {
    return shareMetadata({
      title: SHOT_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code is not a hire cam."
          : "A lamp is not a hire cam. Shot honesty is for a file on the digital lot.",
      path: listingShotPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I don't shoot · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I don't shoot. The camera half-works. Three looks. Convert is Rec.709. Grade is no custom LUT. Still tote.`,
    path: listingShotPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingShotPage({ params }: ShotPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const shotIds = parseShotListingIds(jar.get(SHOT_COOKIE_NAME)?.value);
  const sheet = shotSheetForId(id, shotIds);

  return <ListingShotView sheet={sheet} shotIds={shotIds} />;
}
